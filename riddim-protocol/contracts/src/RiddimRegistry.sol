// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title RiddimRegistry
/// @notice Programmable music-rights registry for the Riddim Protocol.
///         Producers register riddims as component splits, artists license
///         riddims into tracks, artists register consent for AI voice clones,
///         and fans tip a track — the tip is auto-split onchain across every
///         riddim component owner and every attached voice-clone owner.
///
/// Design notes (intentional, for the hackathon MVP):
///  - No admin keys, no `Ownable`, no pause, no upgradeability. The contract is
///    immutable after deployment by design, to demonstrate trustlessness.
///  - Payouts use `.transfer()` (2300 gas stipend) rather than a
///    checks-effects-interactions withdraw pattern. This is a known, accepted
///    simplification for the demo — recipients are EOAs/simple wallets. For
///    production, migrate to a pull-payment (withdraw) pattern.
///  - `tipTrack` deviates slightly from an over-allocating reference: voice
///    royalties are taken off the top of the full tip, then the remainder is
///    split across riddim components. This guarantees total payouts never
///    exceed `msg.value` (so the headline voice-clone flow never reverts) while
///    still paying each voice clone `royaltyRateBps` of the full tip.
contract RiddimRegistry {
    // --- Types ---

    struct Component {
        string name; // e.g. "drums", "melody", "vocal hook"
        uint256 splitBps; // basis points (10000 = 100%)
        address payoutWallet;
    }

    struct Riddim {
        uint256 id;
        address producer;
        string title;
        Component[] components;
        uint256 totalSplitBps;
        uint256 createdAt;
        bool exists;
    }

    struct Track {
        uint256 id;
        address artist;
        string title;
        uint256[] riddimIds; // licensed riddims
        uint256 totalTipped;
        uint256 createdAt;
        bool exists;
    }

    struct VoiceCloneLicense {
        uint256 id;
        address artist;
        string voiceName;
        uint256 royaltyRateBps; // royalty rate in basis points, capped at 5000 (50%)
        address payoutWallet;
        bool active;
    }

    // --- Storage ---

    mapping(uint256 => Riddim) private _riddims;
    mapping(uint256 => Track) private _tracks;
    mapping(uint256 => VoiceCloneLicense) private _voiceClones;
    mapping(uint256 => uint256[]) private _trackVoiceClones; // trackId => voiceCloneId[]

    uint256 public riddimCount;
    uint256 public trackCount;
    uint256 public voiceCloneCount;

    uint256 public constant MAX_VOICE_ROYALTY_BPS = 5000; // 50% cap
    uint256 public constant TOTAL_BPS = 10_000; // 100%

    // --- Events ---

    event RiddimRegistered(uint256 indexed id, address indexed producer, string title);
    event RiddimLicensed(uint256 indexed trackId, uint256 indexed riddimId, address indexed artist);
    event VoiceCloneRegistered(uint256 indexed id, address indexed artist, string voiceName);
    event VoiceCloneAttached(uint256 indexed trackId, uint256 indexed voiceCloneId, address indexed artist);
    event TipSplit(uint256 indexed trackId, address indexed tipper, uint256 amount);

    // --- Writes ---

    /// @notice Register a riddim as a set of ownership components.
    /// @dev Reverts unless `splitBps` sums to exactly 10000.
    function registerRiddim(
        string calldata title,
        string[] calldata componentNames,
        uint256[] calldata splitBps,
        address[] calldata payoutWallets
    ) external returns (uint256) {
        require(bytes(title).length > 0, "title required");
        require(componentNames.length > 0, "no components");
        require(componentNames.length == splitBps.length, "length mismatch");
        require(componentNames.length == payoutWallets.length, "length mismatch");

        uint256 totalBps;
        for (uint256 i = 0; i < splitBps.length; i++) {
            require(bytes(componentNames[i]).length > 0, "component name required");
            require(payoutWallets[i] != address(0), "invalid payout wallet");
            totalBps += splitBps[i];
        }
        require(totalBps == TOTAL_BPS, "splits must sum to 10000 bps");

        uint256 riddimId = ++riddimCount;
        Riddim storage r = _riddims[riddimId];
        r.id = riddimId;
        r.producer = msg.sender;
        r.title = title;
        r.totalSplitBps = totalBps;
        r.createdAt = block.timestamp;
        r.exists = true;

        for (uint256 i = 0; i < componentNames.length; i++) {
            r.components.push(
                Component({name: componentNames[i], splitBps: splitBps[i], payoutWallet: payoutWallets[i]})
            );
        }

        emit RiddimRegistered(riddimId, msg.sender, title);
        return riddimId;
    }

    /// @notice License an existing riddim into a new track.
    /// @dev Reverts if the riddim does not exist.
    function licenseRiddim(string calldata trackTitle, uint256 riddimId) external returns (uint256) {
        require(_riddims[riddimId].exists, "riddim not found");

        uint256 trackId = ++trackCount;
        Track storage t = _tracks[trackId];
        t.id = trackId;
        t.artist = msg.sender;
        t.title = trackTitle;
        t.riddimIds.push(riddimId);
        t.createdAt = block.timestamp;
        t.exists = true;

        emit RiddimLicensed(trackId, riddimId, msg.sender);
        return trackId;
    }

    /// @notice Register consent for an AI voice clone with a royalty rate.
    /// @dev Reverts if `royaltyRateBps` exceeds the 50% cap.
    function registerVoiceClone(string calldata voiceName, uint256 royaltyRateBps, address payoutWallet)
        external
        returns (uint256)
    {
        require(bytes(voiceName).length > 0, "voice name required");
        require(royaltyRateBps > 0, "royalty required");
        require(royaltyRateBps <= MAX_VOICE_ROYALTY_BPS, "max 50% royalty");
        require(payoutWallet != address(0), "invalid payout wallet");

        uint256 cloneId = ++voiceCloneCount;
        _voiceClones[cloneId] = VoiceCloneLicense({
            id: cloneId,
            artist: msg.sender,
            voiceName: voiceName,
            royaltyRateBps: royaltyRateBps,
            payoutWallet: payoutWallet,
            active: true
        });

        emit VoiceCloneRegistered(cloneId, msg.sender, voiceName);
        return cloneId;
    }

    /// @notice Attach a registered voice clone to a track.
    /// @dev Only the voice clone's owner may attach it. Track must exist and
    ///      the clone must be active.
    function attachVoiceClone(uint256 trackId, uint256 voiceCloneId) external {
        require(_tracks[trackId].exists, "track not found");
        VoiceCloneLicense storage vc = _voiceClones[voiceCloneId];
        require(vc.active, "clone not active");
        require(vc.artist == msg.sender, "not your voice");

        _trackVoiceClones[trackId].push(voiceCloneId);
        emit VoiceCloneAttached(trackId, voiceCloneId, msg.sender);
    }

    /// @notice Tip a track. The tip auto-splits onchain across all attached
    ///         voice clones (each taking its royalty of the full tip) and then
    ///         across the components of every licensed riddim.
    function tipTrack(uint256 trackId) external payable {
        require(_tracks[trackId].exists, "track not found");
        require(msg.value > 0, "tip must be > 0");

        Track storage t = _tracks[trackId];
        t.totalTipped += msg.value;

        // (b) Voice clones: each takes royaltyRateBps of the FULL tip, off the top.
        uint256[] storage cloneIds = _trackVoiceClones[trackId];
        uint256 voiceTotal;
        for (uint256 i = 0; i < cloneIds.length; i++) {
            VoiceCloneLicense storage vc = _voiceClones[cloneIds[i]];
            uint256 voiceShare = (msg.value * vc.royaltyRateBps) / TOTAL_BPS;
            if (voiceShare > 0) {
                voiceTotal += voiceShare;
                payable(vc.payoutWallet).transfer(voiceShare);
            }
        }
        require(voiceTotal <= msg.value, "voice royalties exceed tip");

        // (a) Remaining split across every licensed riddim's components.
        uint256 remaining = msg.value - voiceTotal;
        uint256 riddimIdsLength = t.riddimIds.length;
        if (riddimIdsLength > 0 && remaining > 0) {
            uint256 perRiddim = remaining / riddimIdsLength;
            for (uint256 i = 0; i < riddimIdsLength; i++) {
                Riddim storage r = _riddims[t.riddimIds[i]];
                uint256 componentsLength = r.components.length;
                for (uint256 j = 0; j < componentsLength; j++) {
                    uint256 share = (perRiddim * r.components[j].splitBps) / TOTAL_BPS;
                    if (share > 0) {
                        payable(r.components[j].payoutWallet).transfer(share);
                    }
                }
            }
        }

        // Integer-division dust remains held by the contract (see receive()).
        emit TipSplit(trackId, msg.sender, msg.value);
    }

    // --- Reads ---

    function getRiddim(uint256 id) external view returns (Riddim memory) {
        return _riddims[id];
    }

    function getTrack(uint256 id) external view returns (Track memory) {
        return _tracks[id];
    }

    function getVoiceClone(uint256 id) external view returns (VoiceCloneLicense memory) {
        return _voiceClones[id];
    }

    function getTrackVoiceClones(uint256 trackId) external view returns (uint256[] memory) {
        return _trackVoiceClones[trackId];
    }

    /// @notice Allow the contract to hold integer-division dust from splits.
    receive() external payable {}
}
