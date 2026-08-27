import assert from "node:assert/strict";
import test from "node:test";

import { platformAdapters } from "./platform-adapters";

test("audiomack adapter exposes canonical track data", async () => {
  const record = await platformAdapters.audiomack.syncTrack({
    title: "Afro Echo",
  });

  assert.equal(record.platform, "audiomack");
  assert.equal(record.title, "Afro Echo");
  assert.equal(record.licenseStatus, "registered");
  assert.ok(record.payoutSplit.length >= 2);
});

test("spotify adapter keeps a rights owner wallet and license state", async () => {
  const record = await platformAdapters.spotify.syncTrack({
    title: "Sunrise Traffic",
  });

  assert.equal(record.platform, "spotify");
  assert.equal(record.licenseStatus, "licensed");
  assert.ok(record.rightsOwnerWallet);
});

test("boomplay adapter declares a streaming usage record", async () => {
  const record = await platformAdapters.boomplay.syncTrack({
    title: "Night Market",
  });

  assert.equal(record.platform, "boomplay");
  assert.equal(record.usageType, "streaming");
  assert.equal(record.licenseStatus, "pending");
});
