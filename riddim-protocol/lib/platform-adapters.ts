export type PlatformName = "audiomack" | "spotify" | "boomplay";

export type PlatformPayoutShare = {
  wallet: string;
  share: number;
};

export type PlatformRecord = {
  platform: PlatformName;
  externalTrackId: string;
  title: string;
  artist: string;
  rightsOwnerWallet?: string;
  usageType: "original" | "derived" | "ai-clone" | "streaming";
  licenseStatus: "registered" | "licensed" | "pending";
  sourceUrl?: string;
  payoutSplit: PlatformPayoutShare[];
  lastSyncedAt: string;
};

export type PlatformAdapter = {
  name: PlatformName;
  syncTrack: (input: Partial<PlatformRecord>) => Promise<PlatformRecord>;
  listTracks: () => Promise<PlatformRecord[]>;
};

const nowIso = () => new Date().toISOString();

const basePayoutSplit = [
  { wallet: "0xProducerWallet", share: 60 },
  { wallet: "0xContributorWallet", share: 40 },
];

export const normalizePlatformRecord = (
  input: Partial<PlatformRecord>,
): PlatformRecord => ({
  platform: input.platform ?? "audiomack",
  externalTrackId: input.externalTrackId ?? "demo-track",
  title: input.title ?? "Untitled track",
  artist: input.artist ?? "Unknown artist",
  rightsOwnerWallet: input.rightsOwnerWallet,
  usageType: input.usageType ?? "streaming",
  licenseStatus: input.licenseStatus ?? "registered",
  sourceUrl: input.sourceUrl,
  payoutSplit: input.payoutSplit ?? basePayoutSplit,
  lastSyncedAt: input.lastSyncedAt ?? nowIso(),
});

export const platformAdapters: Record<PlatformName, PlatformAdapter> = {
  audiomack: {
    name: "audiomack",
    async syncTrack(input) {
      return normalizePlatformRecord({
        platform: "audiomack",
        externalTrackId: "audiomack-track-001",
        title: "Afro Echo",
        artist: "Nia Sol",
        rightsOwnerWallet: "0xProducerWallet",
        usageType: "original",
        licenseStatus: "registered",
        sourceUrl: "https://audiomack.com/example/track/afro-echo",
        payoutSplit: [
          { wallet: "0xProducerWallet", share: 70 },
          { wallet: "0xContributorWallet", share: 30 },
        ],
        lastSyncedAt: nowIso(),
        ...input,
      });
    },
    async listTracks() {
      return [
        normalizePlatformRecord({
          platform: "audiomack",
          externalTrackId: "audiomack-track-001",
          title: "Afro Echo",
          artist: "Nia Sol",
          rightsOwnerWallet: "0xProducerWallet",
          usageType: "original",
          licenseStatus: "registered",
          payoutSplit: [
            { wallet: "0xProducerWallet", share: 70 },
            { wallet: "0xContributorWallet", share: 30 },
          ],
        }),
      ];
    },
  },
  spotify: {
    name: "spotify",
    async syncTrack(input) {
      return normalizePlatformRecord({
        platform: "spotify",
        externalTrackId: "spotify-track-001",
        title: "Sunrise Traffic",
        artist: "Moyo K",
        rightsOwnerWallet: "0xArtistWallet",
        usageType: "derived",
        licenseStatus: "licensed",
        sourceUrl: "https://open.spotify.com/track/example",
        payoutSplit: [
          { wallet: "0xArtistWallet", share: 80 },
          { wallet: "0xProducerWallet", share: 20 },
        ],
        lastSyncedAt: nowIso(),
        ...input,
      });
    },
    async listTracks() {
      return [
        normalizePlatformRecord({
          platform: "spotify",
          externalTrackId: "spotify-track-001",
          title: "Sunrise Traffic",
          artist: "Moyo K",
          rightsOwnerWallet: "0xArtistWallet",
          usageType: "derived",
          licenseStatus: "licensed",
          payoutSplit: [
            { wallet: "0xArtistWallet", share: 80 },
            { wallet: "0xProducerWallet", share: 20 },
          ],
        }),
      ];
    },
  },
  boomplay: {
    name: "boomplay",
    async syncTrack(input) {
      return normalizePlatformRecord({
        platform: "boomplay",
        externalTrackId: "boomplay-track-001",
        title: "Night Market",
        artist: "Kemi T",
        rightsOwnerWallet: "0xRightsWallet",
        usageType: "streaming",
        licenseStatus: "pending",
        sourceUrl: "https://www.boomplay.com/songs/example",
        payoutSplit: [
          { wallet: "0xRightsWallet", share: 50 },
          { wallet: "0xProducerWallet", share: 50 },
        ],
        lastSyncedAt: nowIso(),
        ...input,
      });
    },
    async listTracks() {
      return [
        normalizePlatformRecord({
          platform: "boomplay",
          externalTrackId: "boomplay-track-001",
          title: "Night Market",
          artist: "Kemi T",
          rightsOwnerWallet: "0xRightsWallet",
          usageType: "streaming",
          licenseStatus: "pending",
          payoutSplit: [
            { wallet: "0xRightsWallet", share: 50 },
            { wallet: "0xProducerWallet", share: 50 },
          ],
        }),
      ];
    },
  },
};

export const supportedPlatforms = Object.keys(
  platformAdapters,
) as PlatformName[];
