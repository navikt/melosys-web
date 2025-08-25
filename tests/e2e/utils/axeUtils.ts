import { expect, Page } from "@playwright/test";
import type { AxeResults, NodeResult, Result } from "axe-core";
import AxeBuilder from "@axe-core/playwright";
import { createHtmlReport } from "axe-html-reporter";
import { sanitizeFilename } from "./testUtils";

/**
 * Runs an accessibility analysis using Axe and formats the results
 * @param page - The Playwright page object
 * @param testName - The name of the test
 * @param contextDescription - Optional description for log messages
 */
export async function runAxeAnalyze(
  page: Page,
  testName: string,
  contextDescription: string = "(not specified)",
): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  createHtmlReport({
    results,
    options: {
      outputDir: "tests/e2e/reports/axe-report",
      reportFileName: `${sanitizeFilename(testName)}.html`,
    },
  });

  if (results.violations.length > 0) {
    const detailedViolations = formatAxeViolationsToString(results, contextDescription);
    expect(detailedViolations, `Accessibility violations found for ${contextDescription}`).toBe("");
    return;
  }

  /* eslint-disable-next-line no-console */
  console.log(`\n✅ No accessibility violations found${contextDescription ? ` for ${contextDescription}` : ""}`);
}

/**
 * Formats accessibility violations from Axe into a detailed string
 * @param results - The results from AxeBuilder's analyze() method
 * @param contextDescription - Optional description for log messages
 * @returns A formatted string with detailed violation information
 */
function formatAxeViolationsToString(results: AxeResults, contextDescription: string = ""): string {
  const { violations } = results;
  const contextMsg = contextDescription ? ` for ${contextDescription}` : "";

  if (violations.length === 0) {
    return `\n✅ No accessibility violations found${contextMsg}`;
  }

  let output = `\n-------- Accessibility Violations${contextMsg} --------\n`;
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
