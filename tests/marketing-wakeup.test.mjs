import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const apiSource = readFileSync("src/api/marketing.ts", "utf8");
const typeSource = readFileSync("src/types/marketing.ts", "utf8");

test("Marketing espera mediante peticiones cortas mientras Render despierta", () => {
  assert.match(apiSource, /WAKEUP_POLL_INTERVAL_MS = 5_000/);
  assert.match(apiSource, /WAKEUP_MAX_ATTEMPTS = 18/);
  assert.match(apiSource, /if \(!lastStatus\.warming_up\)/);
  assert.match(apiSource, /apiClient\.get<MarketingStatus>\("\/marketing\/status"\)/);
});

test("el contrato reconoce el estado warming_up", () => {
  assert.match(typeSource, /warming_up\?: boolean/);
});
