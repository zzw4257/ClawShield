import { test, expect } from "@playwright/test";

const AUDIT_ID = "11111111-1111-4111-8111-111111111111";

test("home page shows form and wallet section", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ClawShield" })).toBeVisible();
  await expect(page.getByText("Attester Wallet")).toBeVisible();
  await expect(page.getByLabel("GitHub Repository URL")).toBeVisible();
  await expect(page.getByLabel("Commit SHA")).toBeVisible();
});

test("start audit redirects to audit detail page", async ({ page }) => {
  await page.route("**/api/audit/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        auditId: AUDIT_ID,
        status: "queued"
      })
    });
  });

  await page.goto("/");
  await page.getByLabel("GitHub Repository URL").fill("https://github.com/Tarran6/VibeGuard-AI");
  await page.getByLabel("Commit SHA").fill("8605baa");
  await page.getByRole("button", { name: "Run Audit" }).click();

  await expect(page).toHaveURL(new RegExp(`/audits/${AUDIT_ID}$`));
});

test("audit detail page renders findings and supports attestation action", async ({ page }) => {
  await page.route(`**/api/audit/${AUDIT_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "done",
        fingerprint: "0x" + "ab".repeat(32),
        score: 18,
        level: "green",
        reportUrl: "https://example.com/report",
        reportHash: "0x" + "cd".repeat(32),
        llmSummary: "Safe enough for attestation",
        findings: [
          {
            id: "f-1",
            dimension: "suspicious_network",
            severity: "low",
            evidence: "README.md: outbound call to known host",
            explanation: "Low-risk telemetry endpoint",
            recommendation: "Document endpoint and keep allowlist"
          }
        ]
      })
    });
  });

  await page.route("**/api/attest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        txHash: "0x" + "12".repeat(32),
        chainId: 5611,
        contractAddress: "0x" + "34".repeat(20)
      })
    });
  });

  await page.goto(`/audits/${AUDIT_ID}`);

  await expect(page.getByText("GREEN · 18")).toBeVisible();
  await expect(page.getByText("Safe enough for attestation")).toBeVisible();
  await expect(page.getByText("suspicious_network")).toBeVisible();

  await page.getByRole("button", { name: "Attest Onchain" }).click();
  await expect(page.getByText(/^TX: 0x/)).toBeVisible();
});
