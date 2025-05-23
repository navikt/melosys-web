import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { playAudit } from "playwright-lighthouse";
import path from "path";
import { parseLighthouseReport } from "./utils/lighthouseUtils";

const BASE_URL = "http://localhost:3000";

test("should have no accessibility violations (Axe)", async ({ page }) => {
  await page.goto(BASE_URL);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  expect(results.violations).toEqual([]);
});

test("should pass Lighthouse audits (SEO, best-practices)", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE_URL);

  const reportPath = path.join(__dirname, "reports/lighthouse-report.html");

  const reportName = path.basename(reportPath, ".html");
  const reportDir = path.dirname(reportPath);
  const jsonReportPath = path.join(reportDir, `${reportName}.json`);

  // Define thresholds for Lighthouse audits
  const auditThresholds = {
    "best-practices": 100,
    seo: 100,
  };

  try {
    await playAudit({
      page,
      thresholds: auditThresholds,
      reports: {
        formats: {
          html: true,
          json: true,
        },
        directory: reportDir,
        name: reportName,
      },
      port: 9222,
    });

    console.log(`\n⏳ Lighthouse audit execution completed`);
    console.log(`📊 Report saved to: ${reportPath}`);

    parseLighthouseReport(jsonReportPath, auditThresholds, true);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Lighthouse audit failed: ${errorMessage}`);
    console.log(`\n⚠️ Attempting to parse any existing report...`);

    parseLighthouseReport(jsonReportPath, auditThresholds, true);

    // If parseLighthouseReport() didn't throw, rethrow the original error
    throw error;
  }

  await context.close();
});
