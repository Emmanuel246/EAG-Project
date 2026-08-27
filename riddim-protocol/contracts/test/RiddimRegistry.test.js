const { expect } = require("chai");
const { ethers } = require("hardhat");

const bps = (n) => BigInt(n);
const ONE = ethers.parseEther("1");

describe("RiddimRegistry", () => {
  let registry;
  let producer, artist, fan, drumsWallet, melodyWallet, voiceWallet, stranger;

  beforeEach(async () => {
    [producer, artist, fan, drumsWallet, melodyWallet, voiceWallet, stranger] =
      await ethers.getSigners();
    const Registry = await ethers.getContractFactory("RiddimRegistry");
    registry = await Registry.connect(producer).deploy();
    await registry.waitForDeployment();
  });

  async function registerBaseRiddim() {
    // drums 40%, melody 60%
    const tx = await registry
      .connect(producer)
      .registerRiddim(
        "Afro Vibes",
        ["drums", "melody"],
        [bps(4000), bps(6000)],
        [drumsWallet.address, melodyWallet.address],
      );
    await tx.wait();
    return 1n; // first riddim id
  }

  describe("registerRiddim", () => {
    it("registers a riddim whose splits sum to 10000", async () => {
      await expect(registerBaseRiddim())
        .to.eventually.equal(1n);
      const r = await registry.getRiddim(1);
      expect(r.exists).to.equal(true);
      expect(r.producer).to.equal(producer.address);
      expect(r.totalSplitBps).to.equal(10000n);
      expect(r.components.length).to.equal(2);
      expect(await registry.riddimCount()).to.equal(1n);
    });

    it("reverts when splits do not sum to 10000", async () => {
      await expect(
        registry.registerRiddim(
          "Bad Splits",
          ["drums", "melody"],
          [bps(4000), bps(5000)], // 9000 != 10000
          [drumsWallet.address, melodyWallet.address],
        ),
      ).to.be.revertedWith("splits must sum to 10000 bps");
    });

    it("reverts on array length mismatch", async () => {
      await expect(
        registry.registerRiddim(
          "Mismatch",
          ["drums"],
          [bps(6000), bps(4000)],
          [drumsWallet.address, melodyWallet.address],
        ),
      ).to.be.revertedWith("length mismatch");
    });

    it("reverts on a zero payout wallet", async () => {
      await expect(
        registry.registerRiddim(
          "Zero Wallet",
          ["drums", "melody"],
          [bps(4000), bps(6000)],
          [drumsWallet.address, ethers.ZeroAddress],
        ),
      ).to.be.revertedWith("invalid payout wallet");
    });
  });

  describe("licenseRiddim", () => {
    it("licenses an existing riddim into a new track", async () => {
      await registerBaseRiddim();
      await expect(registry.connect(artist).licenseRiddim("Afro Vibes Remix", 1))
        .to.emit(registry, "RiddimLicensed")
        .withArgs(1n, 1n, artist.address);

      const track = await registry.getTrack(1);
      expect(track.exists).to.equal(true);
      expect(track.artist).to.equal(artist.address);
      expect(track.riddimIds.map((x) => x)).to.deep.equal([1n]);
    });

    it("reverts when the riddim does not exist", async () => {
      await expect(
        registry.connect(artist).licenseRiddim("Ghost Track", 99),
      ).to.be.revertedWith("riddim not found");
    });
  });

  describe("registerVoiceClone", () => {
    it("registers a voice clone at or below the 50% cap", async () => {
      await expect(
        registry
          .connect(artist)
          .registerVoiceClone("NigerianStar", bps(5000), voiceWallet.address),
      )
        .to.emit(registry, "VoiceCloneRegistered")
        .withArgs(1n, artist.address, "NigerianStar");

      const vc = await registry.getVoiceClone(1);
      expect(vc.royaltyRateBps).to.equal(5000n);
      expect(vc.active).to.equal(true);
      expect(vc.artist).to.equal(artist.address);
    });

    it("reverts when royalty exceeds the 50% cap", async () => {
      await expect(
        registry
          .connect(artist)
          .registerVoiceClone("Greedy", bps(5001), voiceWallet.address),
      ).to.be.revertedWith("max 50% royalty");
    });
  });

  describe("attachVoiceClone", () => {
    beforeEach(async () => {
      await registerBaseRiddim();
      await registry.connect(artist).licenseRiddim("Afro Vibes Remix", 1); // track 1
      await registry
        .connect(artist)
        .registerVoiceClone("NigerianStar", bps(1000), voiceWallet.address); // clone 1
    });

    it("lets the voice owner attach the clone to a track", async () => {
      await expect(registry.connect(artist).attachVoiceClone(1, 1))
        .to.emit(registry, "VoiceCloneAttached")
        .withArgs(1n, 1n, artist.address);
      expect((await registry.getTrackVoiceClones(1)).map((x) => x)).to.deep.equal([1n]);
    });

    it("reverts for a non-owner caller", async () => {
      await expect(
        registry.connect(stranger).attachVoiceClone(1, 1),
      ).to.be.revertedWith("not your voice");
    });

    it("reverts when the track does not exist", async () => {
      await expect(
        registry.connect(artist).attachVoiceClone(99, 1),
      ).to.be.revertedWith("track not found");
    });
  });

  describe("tipTrack", () => {
    it("reverts on a zero-value tip", async () => {
      await registerBaseRiddim();
      await registry.connect(artist).licenseRiddim("Afro Vibes Remix", 1);
      await expect(
        registry.connect(fan).tipTrack(1, { value: 0 }),
      ).to.be.revertedWith("tip must be > 0");
    });

    it("reverts when the track does not exist", async () => {
      await expect(
        registry.connect(fan).tipTrack(1, { value: ONE }),
      ).to.be.revertedWith("track not found");
    });

    it("splits a tip across riddim components (no voice clone)", async () => {
      await registerBaseRiddim();
      await registry.connect(artist).licenseRiddim("Afro Vibes Remix", 1); // track 1

      const drumsBefore = await ethers.provider.getBalance(drumsWallet.address);
      const melodyBefore = await ethers.provider.getBalance(melodyWallet.address);

      await expect(registry.connect(fan).tipTrack(1, { value: ONE }))
        .to.emit(registry, "TipSplit")
        .withArgs(1n, fan.address, ONE);

      const drumsAfter = await ethers.provider.getBalance(drumsWallet.address);
      const melodyAfter = await ethers.provider.getBalance(melodyWallet.address);

      expect(drumsAfter - drumsBefore).to.equal(ethers.parseEther("0.4"));
      expect(melodyAfter - melodyBefore).to.equal(ethers.parseEther("0.6"));

      const track = await registry.getTrack(1);
      expect(track.totalTipped).to.equal(ONE);
      // No dust for this clean split.
      expect(await ethers.provider.getBalance(await registry.getAddress())).to.equal(0n);
    });

    it("splits a tip across a voice clone AND the riddim components", async () => {
      await registerBaseRiddim();
      await registry.connect(artist).licenseRiddim("Afro Vibes Remix", 1); // track 1
      await registry
        .connect(artist)
        .registerVoiceClone("NigerianStar", bps(1000), voiceWallet.address); // 10%
      await registry.connect(artist).attachVoiceClone(1, 1);

      const drumsBefore = await ethers.provider.getBalance(drumsWallet.address);
      const melodyBefore = await ethers.provider.getBalance(melodyWallet.address);
      const voiceBefore = await ethers.provider.getBalance(voiceWallet.address);

      await registry.connect(fan).tipTrack(1, { value: ONE });

      const drumsAfter = await ethers.provider.getBalance(drumsWallet.address);
      const melodyAfter = await ethers.provider.getBalance(melodyWallet.address);
      const voiceAfter = await ethers.provider.getBalance(voiceWallet.address);

      // Voice takes 10% of the full tip off the top => 0.1.
      expect(voiceAfter - voiceBefore).to.equal(ethers.parseEther("0.1"));
      // Remaining 0.9 splits 40/60 across components => 0.36 / 0.54.
      expect(drumsAfter - drumsBefore).to.equal(ethers.parseEther("0.36"));
      expect(melodyAfter - melodyBefore).to.equal(ethers.parseEther("0.54"));

      // Everything is accounted for: no dust for this clean split.
      expect(await ethers.provider.getBalance(await registry.getAddress())).to.equal(0n);
    });
  });
});
