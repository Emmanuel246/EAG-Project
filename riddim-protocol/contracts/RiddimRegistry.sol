// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RiddimRegistry is ReentrancyGuard {
    struct Component {
        string name;
        uint256 splitBps;
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
        uint256[] riddimIds;
        uint256 totalTipped;
        uint256 createdAt;
        bool exists;
    }

    struct VoiceClone {
        uint256 id;
        address artist;
        string voiceName;
        uint256 royaltyRateBps;
        address payoutWallet;
        bool active;
    }

    uint256 private _riddimCounter;
    uint256 private _trackCounter;
    uint256 private _voiceCloneCounter;

    mapping(uint256 => Riddim) private _riddims;
    mapping(uint256 => Track) private _tracks;
    mapping(uint256 => VoiceClone) private _voiceClones;

    event RiddimRegistered(uint256 indexed id, address indexed producer, string title);
    event RiddimLicensed(uint256 indexed trackId, uint256 indexed riddimId, address indexed artist);
    event VoiceCloneRegistered(uint256 indexed id, address indexed artist, string voiceName);
    event VoiceCloneAttached(uint256 indexed trackId, uint256 indexed voiceCloneId);
    event TipSplit(uint256 indexed trackId, address indexed tipper, uint256 amount);

    function registerRiddim(
        string memory title,
        string[] memory componentNames,
        uint256[] memory splitBps,
        address[] memory payoutWallets
    ) external returns (uint256) {
        require(bytes(title).length > 0, "title required");
        require(componentNames.length == splitBps.length, "component length mismatch");
        require(componentNames.length == payoutWallets.length, "wallet length mismatch");
        require(componentNames.length > 0, "no components");

        uint256 totalBps;
        for (uint256 i = 0; i < splitBps.length; i++) {
            require(bytes(componentNames[i]).length > 0, "component name required");
            require(payoutWallets[i] != address(0), "invalid wallet");
            totalBps += splitBps[i];
        }

        require(totalBps == 10_000, "splits must total 100%");

        uint256 riddimId = ++_riddimCounter;
        Riddim storage riddim = _riddims[riddimId];
        riddim.id = riddimId;
        riddim.producer = msg.sender;
        riddim.title = title;
        riddim.totalSplitBps = totalBps;
        riddim.createdAt = block.timestamp;
        riddim.exists = true;

        for (uint256 i = 0; i < componentNames.length; i++) {
            riddim.components.push(Component({
                name: componentNames[i],
                splitBps: splitBps[i],
                payoutWallet: payoutWallets[i]
            }));
        }

        emit RiddimRegistered(riddimId, msg.sender, title);
        return riddimId;
    }

    function licenseRiddim(string memory trackTitle, uint256 riddimId) external returns (uint256) {
        require(_riddims[riddimId].exists, "riddim does not exist");

        uint256 trackId = ++_trackCounter;
        Track storage track = _tracks[trackId];
        track.id = trackId;
        track.artist = msg.sender;
        track.title = trackTitle;
        track.createdAt = block.timestamp;
        track.exists = true;
        track.riddimIds.push(riddimId);

        emit RiddimLicensed(trackId, riddimId, msg.sender);
        return trackId;
    }

    function registerVoiceClone(
        string memory voiceName,
        uint256 royaltyRateBps,
        address payoutWallet
    ) external returns (uint256) {
        require(bytes(voiceName).length > 0, "voice name required");
        require(royaltyRateBps > 0 && royaltyRateBps <= 10_000, "invalid royalty rate");
        require(payoutWallet != address(0), "invalid payout wallet");

        uint256 voiceCloneId = ++_voiceCloneCounter;
        VoiceClone storage clone = _voiceClones[voiceCloneId];
        clone.id = voiceCloneId;
        clone.artist = msg.sender;
        clone.voiceName = voiceName;
        clone.royaltyRateBps = royaltyRateBps;
        clone.payoutWallet = payoutWallet;
        clone.active = true;

        emit VoiceCloneRegistered(voiceCloneId, msg.sender, voiceName);
        return voiceCloneId;
    }

    function attachVoiceClone(uint256 trackId, uint256 voiceCloneId) external {
        require(_tracks[trackId].exists, "track does not exist");
        require(_voiceClones[voiceCloneId].active, "voice clone is inactive");

        emit VoiceCloneAttached(trackId, voiceCloneId);
    }

    function tipTrack(uint256 trackId) external payable nonReentrant {
        require(_tracks[trackId].exists, "track does not exist");
        require(msg.value > 0, "tip must be greater than zero");

        Track storage track = _tracks[trackId];
        track.totalTipped += msg.value;

        uint256 totalSplit = 0;
        uint256[] memory reducedAmounts;
        reducedAmounts = new uint256[](0);

        for (uint256 i = 0; i < track.riddimIds.length; i++) {
            uint256 riddimId = track.riddimIds[i];
            Riddim storage riddim = _riddims[riddimId];

            for (uint256 j = 0; j < riddim.components.length; j++) {
                totalSplit += riddim.components[j].splitBps;
            }
        }

        require(totalSplit > 0, "no component split exists");

        uint256 remaining = msg.value;
        uint256 distributed = 0;

        for (uint256 i = 0; i < track.riddimIds.length; i++) {
            uint256 riddimId = track.riddimIds[i];
            Riddim storage riddim = _riddims[riddimId];

            for (uint256 j = 0; j < riddim.components.length; j++) {
                Component storage component = riddim.components[j];
                uint256 amount = (msg.value * component.splitBps) / totalSplit;
                if (j == riddim.components.length - 1 && i == track.riddimIds.length - 1) {
                    amount = remaining;
                }

                (bool success, ) = payable(component.payoutWallet).call{value: amount}(
                    ""
                );
                require(success, "payout failed");

                distributed += amount;
                remaining -= amount;
            }
        }

        require(distributed == msg.value, "distribution mismatch");

        emit TipSplit(trackId, msg.sender, msg.value);
    }

    function getRiddim(uint256 id) external view returns (Riddim memory) {
        return _riddims[id];
    }

    function getTrack(uint256 id) external view returns (Track memory) {
        return _tracks[id];
    }

    function getVoiceClone(uint256 id) external view returns (VoiceClone memory) {
        return _voiceClones[id];
    }
}
