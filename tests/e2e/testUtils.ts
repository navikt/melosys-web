import fs from "fs";
import path from "path";
import { expect, Page } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import type { AxeResults, NodeResult, Result } from "axe-core";
import AxeBuilder from "@axe-core/playwright";

/**
 * Helper function to search for an ID
 * @param page - The Playwright page object
 * @param id - The ID to search for
 */
export async function searchFor(page: Page, id: string): Promise<void> {
  // Navigate to the homepage
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Check that the search form is visible
  await expect(page.locator("form.sokeskjema")).toBeVisible();

  // Find the search input field and enter the search term
  const searchInput = page.locator("form.sokeskjema input[type='text']");

  // If the search input is not found, it's an error
  const searchInputCount = await searchInput.count();
  expect(searchInputCount > 0, "Search input field 'Søk sak:' not found").toBeTruthy();

  // Fill the search input with the provided ID
  await searchInput.fill(id);

  // Find the search button and click it
  const searchButton = page.locator("form.sokeskjema .sokeskjema__knapp button");

  // If the search button is not found, it's an error
  const searchButtonCount = await searchButton.count();
  expect(searchButtonCount > 0, "Search button not found").toBeTruthy();

  // Click the search button
  await searchButton.click();

  // Wait for the search results to load
  await page.waitForLoadState("networkidle");
}

// Define interfaces for Lighthouse report structure
export interface LighthouseAuditItem {
  node?: string;
  url?: string;
  source?: string;
  selector?: string;
  failureReason?: string;

  [key: string]: any;
}

export interface LighthouseAuditDetails {
  items?: LighthouseAuditItem[];
  debugData?: {
    impact?: string;
  };
  type?: string;
  overallSavingsMs?: number;
}

export interface LighthouseAudit {
  id?: string;
  title: string;
  description: string;
  score: number | null;
  details?: LighthouseAuditDetails;
  errorMessage?: string;
  warnings?: string[];
  helpText?: string;
  helpUrl?: string;
}

export interface LighthouseAuditRef {
  id: string;
  weight: number;
  group?: string;
}

export interface LighthouseCategory {
  title: string;
  score: number;
  auditRefs: LighthouseAuditRef[];
}

export interface LighthouseReport {
  categories: {
    [key: string]: LighthouseCategory;
  };
  audits: {
    [key: string]: LighthouseAudit;
  };
}

/**
 * Function to extract and display audit results for a specific category
 */
function displayCategoryIssues(reportJson: LighthouseReport, categoryName: string, categoryId: string): boolean {
  // Get audit references from the category
  const categoryAuditRefs = reportJson.categories[categoryId]?.auditRefs || [];
  const categoryAuditIds = new Set(categoryAuditRefs.map((ref: LighthouseAuditRef) => ref.id));

  // Filter audits that belong to this category and have a score less than 1
  const categoryAudits = Object.entries(reportJson.audits || {})
    .filter(
      ([id, audit]: [string, LighthouseAudit]) => categoryAuditIds.has(id) && audit.score !== 1 && audit.score !== null,
    )
    .map(([_, audit]: [string, LighthouseAudit]) => audit);

  if (categoryAudits.length > 0) {
    console.log(`\n-------- Lighthouse ${categoryName} Issues --------`);
    categoryAudits.forEach((audit: LighthouseAudit) => {
      const scoreDisplay = audit.score ? `${Math.round(audit.score * 100)}/100` : "Failed";
      console.log(`\n🔴 ${audit.title} (Score: ${scoreDisplay})`);
      console.log(`   Description: ${audit.description}`);

      // Display failure details
      if (audit.details && audit.details.items && audit.details.items.length > 0) {
        console.log("   Failing Elements:");
        audit.details.items.forEach((item: LighthouseAuditItem, index: number) => {
          // Try to extract the most useful information
          const itemInfo: string[] = [];
          if (item.node) itemInfo.push(`Node: ${item.node}`);
          if (item.url) itemInfo.push(`URL: ${item.url}`);
          if (item.selector) itemInfo.push(`Selector: ${item.selector}`);
          if (item.failureReason) itemInfo.push(`Reason: ${item.failureReason}`);

          // Handle console.error source with more detail
          if (item.source === "console.error") {
            console.log(`     ${index + 1}. Source: console.error`);

            // Extract and display additional details for console errors
            if (item.args) {
              console.log(`        Arguments:`);
              item.args.forEach((arg: any, argIndex: number) => {
                console.log(`          ${argIndex + 1}. ${JSON.stringify(arg, null, 2)}`);
              });
            }

            if (item.stack) {
              console.log(`        Stack trace:`);
              const stackLines = item.stack.split("\n");
              stackLines.forEach((line: string, lineIndex: number) => {
                console.log(`          ${lineIndex + 1}. ${line.trim()}`);
              });
            }

            // Display any other properties that might be useful
            const otherProps = Object.entries(item).filter(
              ([key]) => !["node", "url", "source", "selector", "failureReason", "args", "stack"].includes(key),
            );

            if (otherProps.length > 0) {
              console.log(`        Additional details:`);
              otherProps.forEach(([key, value]) => {
                console.log(`          ${key}: ${typeof value === "object" ? JSON.stringify(value, null, 2) : value}`);
              });
            }
          } else {
            // For non-console.error items, use the original approach but with better formatting
            const displayText = itemInfo.length > 0 ? itemInfo.join(", ") : JSON.stringify(item, null, 2);
            console.log(`     ${index + 1}. ${item.source ? `Source: ${item.source}, ` : ""}${displayText}`);

            // If there are other properties not covered by the basic info, show them too
            const otherProps = Object.entries(item).filter(
              ([key]) => !["node", "url", "source", "selector", "failureReason"].includes(key),
            );

            if (otherProps.length > 0) {
              console.log(`        Additional details:`);
              otherProps.forEach(([key, value]) => {
                if (value !== null && typeof value === "object") {
                  console.log(`          ${key}:`);
                  console.log(`            ${JSON.stringify(value, null, 2).replace(/\n/g, "\n            ")}`);
                } else {
                  console.log(`          ${key}: ${value}`);
                }
              });
            }
          }
        });
      }

      // Display error message
      if (audit.errorMessage) {
        console.log(`   Error: ${audit.errorMessage}`);
      }

      // Display warnings
      if (audit.warnings && audit.warnings.length > 0) {
        console.log("   Warnings:");
        audit.warnings.forEach((warning: string, index: number) => {
          console.log(`     ${index + 1}. ${warning}`);
        });
      }

      // Display how to fix
      if (audit.helpText) {
        console.log("   How to fix:");
        // Clean up the help text (remove HTML tags and normalize whitespace)
        const cleanHelpText = audit.helpText
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim();
        console.log(`     ${cleanHelpText}`);
      }

      // Display more info link
      if (audit.details && audit.details.debugData && audit.details.debugData.impact) {
        console.log(`   Impact: ${audit.details.debugData.impact}`);
      }

      if (audit.details && audit.details.type === "opportunity") {
        console.log(`   Potential Savings: ${audit.details.overallSavingsMs}ms`);
      }

      if (audit.helpUrl) {
        console.log(`   More info: ${audit.helpUrl}`);
      }
    });
    console.log(`\n-------------------------------------------------`);
    return true;
  }
  return false;
}

/**
 * Function to check if any thresholds have failed
 */
function hasFailedThresholds(reportJson: LighthouseReport, thresholds: Record<string, number>): boolean {
  // Check if any category scores are below their thresholds
  return Object.entries(reportJson.categories).some(([id, category]) => {
    const score = Math.round(category.score * 100);
    return thresholds[id] !== undefined && score < thresholds[id];
  });
}

/**
 * Function to get information about failed thresholds
 */
function getFailedThresholds(
  reportJson: LighthouseReport,
  thresholds: Record<string, number>,
): { category: string; score: number; threshold: number }[] {
  // Filter categories with scores below their thresholds
  return Object.entries(reportJson.categories)
    .filter(([id, category]) => {
      const score = Math.round(category.score * 100);
      return thresholds[id] !== undefined && score < thresholds[id];
    })
    .map(([id, category]) => ({
      category: category.title,
      score: Math.round(category.score * 100),
      threshold: thresholds[id],
    }));
}

/**
 * Function to display Lighthouse results
 */
function displayLighthouseResults(
  reportJson: LighthouseReport,
  thresholds: Record<string, number>,
  shouldThrowOnFailedThresholds: boolean = false,
): void {
  // Display category scores
  if (reportJson.categories) {
    console.log("\n-------- Lighthouse Category Scores --------");
    Object.entries(reportJson.categories).forEach(([id, category]: [string, LighthouseCategory]) => {
      const score = Math.round(category.score * 100);
      let emoji = "❌";
      if (score >= 90) {
        emoji = "✅";
      } else if (score >= 50) {
        emoji = "⚠️";
      }
      console.log(`${emoji} ${category.title}: ${score}/100`);
    });
    console.log("-------------------------------------------------");
  }

  // Display issues for each category
  const foundBestPracticesIssues = displayCategoryIssues(reportJson, "Best Practices", "best-practices");
  const foundSeoIssues = displayCategoryIssues(reportJson, "SEO", "seo");

  if (!foundBestPracticesIssues && !foundSeoIssues) {
    console.log("\n✅ No issues found in the Lighthouse report for Best Practices and SEO categories.");
  }

  // Check if any thresholds have failed and throw an error if requested
  if (shouldThrowOnFailedThresholds && hasFailedThresholds(reportJson, thresholds)) {
    const failedThresholds = getFailedThresholds(reportJson, thresholds);
    const failureMessage = failedThresholds
      .map(({ category, score, threshold }) => `${category} score is ${score} and is under the ${threshold} threshold`)
      .join("\n");

    // Only log success if all thresholds are met
    console.log(`\n❌ Lighthouse audit failed - some thresholds not met`);

    throw new Error(`Lighthouse audit failed: Some thresholds are not matching the expectations.\n\n${failureMessage}`);
  } else if (!hasFailedThresholds(reportJson, thresholds)) {
    // Only log success if all thresholds are met
    console.log(`\n✅ Lighthouse audit passed successfully - all thresholds met`);
  }
}

/**
 * Parses a Lighthouse JSON report and displays the results
 * @param jsonReportPath - Path to the Lighthouse JSON report
 * @param thresholds - Thresholds for Lighthouse audits (same as used in playAudit)
 * @param throwOnFailedThresholds - Whether to throw an error if thresholds aren't met
 */
export function parseLighthouseReport(
  jsonReportPath: string,
  thresholds: Record<string, number>,
  throwOnFailedThresholds: boolean = false,
): void {
  if (!fs.existsSync(jsonReportPath)) {
    console.log(`\n⚠️ JSON report not found at ${jsonReportPath}`);
    if (throwOnFailedThresholds) {
      throw new Error(`Lighthouse audit failed: JSON report not found at ${jsonReportPath}`);
    }
    return;
  }

  try {
    const reportJson = JSON.parse(fs.readFileSync(jsonReportPath, "utf8")) as LighthouseReport;

    // Call displayResults directly with the provided throwOnFailedThresholds parameter
    displayLighthouseResults(reportJson, thresholds, throwOnFailedThresholds);
  } catch (error: unknown) {
    const errorMessage = `Error parsing Lighthouse JSON report: ${error instanceof Error ? error.message : "Unknown error"}`;
    console.error(`\n❌ ${errorMessage}`);
    if (throwOnFailedThresholds) {
      throw new Error(`Lighthouse audit failed: ${errorMessage}`);
    }
  }
}

/**
 * Generates report paths for Lighthouse audits
 * @param reportName - The base name for the report (without extension)
 * @returns Object containing the report paths
 * @private - This function is now private and only used internally by runLighthouseAudit
 */
function generateReportPaths(reportName: string): {
  reportPath: string;
  reportDir: string;
  reportName: string;
  jsonReportPath: string;
} {
  const reportDir = path.join(__dirname, "..", "e2e/reports/lighthouse-report");
  const reportPath = path.join(reportDir, `${reportName}.html`);
  const jsonReportPath = path.join(reportDir, `${reportName}.json`);

  return {
    reportPath,
    reportDir,
    reportName,
    jsonReportPath,
  };
}

/**
 * Runs a Lighthouse audit on a page and handles the results
 * @param page - The Playwright page object
 * @param reportName - The base name for the report (without extension)
 * @param auditThresholds - Thresholds for Lighthouse audits
 * @param contextDescription - Optional description for log messages
 */
export async function runLighthouseAudit(
  page: Page,
  reportName: string,
  auditThresholds: Record<string, number>,
  contextDescription: string = "",
): Promise<void> {
  const reportInfo = generateReportPaths(reportName);
  const { reportPath, reportDir, jsonReportPath } = reportInfo;
  const contextMsg = contextDescription ? ` for ${contextDescription}` : "";

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

    console.log(`\n⏳ Lighthouse audit execution completed${contextMsg}`);
    console.log(`📊 Report saved to: ${reportPath}`);

    parseLighthouseReport(jsonReportPath, auditThresholds, true);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Lighthouse audit failed${contextMsg}: ${errorMessage}`);
    console.log(`\n⚠️ Attempting to parse any existing report...`);

    parseLighthouseReport(jsonReportPath, auditThresholds, true);

    // If parseLighthouseReport() didn't throw, rethrow the original error
    throw error;
  }
}

/**
 * Formats accessibility violations from Axe into a detailed string
 * @param results - The results from AxeBuilder's analyze() method
 * @param contextDescription - Optional description for log messages
 * @returns A formatted string with detailed violation information
 */
function formatAxeViolationsToString(results: AxeResults, contextDescription: string = ""): string {
  const { violations } = results;
  const contextMsg = contextDescription ? `${contextDescription}` : "";

  if (violations.length === 0) {
    return `\n✅ No accessibility violations found for '${contextMsg}'`;
  }

  let output = `\n-------- Accessibility Violations for '${contextMsg}' --------\n`;
  output += `Found ${violations.length} accessibility violation(s)\n`;

  violations.forEach((violation: Result, index: number) => {
    output += `\n🔴 ${index + 1}. ${violation.help} (${violation.impact} impact)\n`;
    output += `   Rule: ${violation.id}\n`;
    output += `   Description: ${violation.description}\n`;
    output += `   WCAG: ${violation.tags.filter((tag) => tag.startsWith("wcag")).join(", ")}\n`;

    if (violation.nodes && violation.nodes.length > 0) {
      output += `   Affected Elements (${violation.nodes.length}):\n`;

      violation.nodes.forEach((node: NodeResult, nodeIndex) => {
        output += `     ${nodeIndex + 1}. ${node.html}\n`;

        if (node.target && node.target.length > 0) {
          output += `        Target: ${node.target.join(", ")}\n`;
        }

        if (node.failureSummary) {
          output += `        Failure Summary: ${node.failureSummary.replace(/\n/g, "\n        ")}\n`;
        }
      });
    }

    output += `   How to fix: ${violation.help}\n`;
    output += `   More info: ${violation.helpUrl}\n`;
  });

  output += `\n-------------------------------------------------`;
  return output;
}

/**
 * Runs an accessibility analysis using Axe and formats the results
 * @param page - The Playwright page object
 * @param contextDescription - Optional description for log messages
 * @returns A string with detailed violation information, or an empty string if no violations are found
 */
export async function runAxeAnalyze(page: Page, contextDescription: string = ""): Promise<string> {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  if (results.violations.length > 0) {
    const detailedViolations = formatAxeViolationsToString(results, contextDescription);
    console.log(detailedViolations);
    return detailedViolations;
  }

  console.log(`\n✅ No accessibility violations found${contextDescription ? ` for ${contextDescription}` : ""}`);
  return "";
}
