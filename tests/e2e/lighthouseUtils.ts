import fs from "fs";
import path from "path";
import { Page } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import { sanitizeFilename } from "./testUtils";

export const auditThresholds = {
  "best-practices": 100,
  seo: 100,
};

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
 * Runs a Lighthouse audit on a page and handles the results
 * @param page - The Playwright page object
 * @param reportName - The base name for the report (without extension)
 * @param thresholds - Thresholds for Lighthouse audits
 * @param contextDescription - Optional description for log messages
 */
export async function runLighthouseAudit(
  page: Page,
  reportName: string,
  thresholds: Record<string, number>,
  contextDescription: string = "",
): Promise<void> {
  const reportInfo = generateReportPaths(reportName);
  const { reportPath, reportDir, jsonReportPath, reportName: sanitizedReportName } = reportInfo;
  const contextMsg = contextDescription ? ` for ${contextDescription}` : "";

  try {
    await playAudit({
      page,
      thresholds,
      reports: {
        formats: {
          html: true,
          json: true,
        },
        directory: reportDir,
        name: sanitizedReportName,
      },
      port: 9222,
    });

    console.log(`\n⏳ Lighthouse audit execution completed${contextMsg}`);
    console.log(`📊 Report saved to: ${reportPath}`);

    parseLighthouseReport(jsonReportPath, thresholds);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Lighthouse audit failed${contextMsg}: ${errorMessage}`);

    parseLighthouseReport(jsonReportPath, thresholds);

    // If parseLighthouseReport didn' throw and error, re-throw the original
    throw error;
  }
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
    .map(([_id, audit]: [string, LighthouseAudit]) => audit);

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

function getEmoji(threshold: number, id: string, score: number) {
  if (score >= threshold) {
    return "✅";
  }
  if (score >= threshold / 2) {
    return "⚠️";
  }
  return "❌";
}

/**
 * Function to display Lighthouse results
 */
function displayLighthouseResults(reportJson: LighthouseReport, thresholds: Record<string, number>): void {
  if (reportJson.categories) {
    console.log("\n-------- Lighthouse Category Scores --------");
    Object.entries(reportJson.categories).forEach(([id, category]: [string, LighthouseCategory]) => {
      const score = Math.round(category.score * 100);
      // Use the threshold for this category if available, otherwise use a default threshold of 90
      const emoji = getEmoji(thresholds[id] || 90, id, score);
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
  const failedThresholds = getFailedThresholds(reportJson, thresholds);

  if (failedThresholds.length > 0) {
    const failureMessage = failedThresholds
      .map(({ category, score, threshold }) => `${category} score is ${score} and is under the ${threshold} threshold`)
      .join("\n");

    // Only log success if all thresholds are met
    console.log(`\n❌ Lighthouse audit failed - some thresholds not met`);

    throw new Error(`Lighthouse audit failed: Some thresholds are not matching the expectations.\n\n${failureMessage}`);
  } else if (failedThresholds.length === 0) {
    // Only log success if all thresholds are met
    console.log(`\n✅ Lighthouse audit passed successfully - all thresholds met`);
  }
}

/**
 * Parses a Lighthouse JSON report and displays the results
 * @param jsonReportPath - Path to the Lighthouse JSON report
 * @param thresholds - Thresholds for Lighthouse audits (same as used in playAudit)
 */
function parseLighthouseReport(jsonReportPath: string, thresholds: Record<string, number>): void {
  if (!fs.existsSync(jsonReportPath)) {
    console.log(`\n⚠️ JSON report not found at ${jsonReportPath}`);
    throw new Error(`Lighthouse audit failed: JSON report not found at ${jsonReportPath}`);
  }

  try {
    const reportJson = JSON.parse(fs.readFileSync(jsonReportPath, "utf8")) as LighthouseReport;
    displayLighthouseResults(reportJson, thresholds);
  } catch (error: unknown) {
    const errorMessage = `Error parsing Lighthouse JSON report: ${error instanceof Error ? error.message : "Unknown error"}`;
    console.error(`\n❌ ${errorMessage}`);
    throw new Error(`Lighthouse audit failed: ${errorMessage}`);
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
  const sanitizedReportName = sanitizeFilename(reportName);
  const reportPath = path.join(reportDir, `${sanitizedReportName}.html`);
  const jsonReportPath = path.join(reportDir, `${sanitizedReportName}.json`);

  return {
    reportPath,
    reportDir,
    reportName: sanitizedReportName,
    jsonReportPath,
  };
}
