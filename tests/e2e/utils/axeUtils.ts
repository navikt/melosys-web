import { expect, Page } from "@playwright/test";
import type { AxeResults, NodeResult, Result } from "axe-core";
import AxeBuilder from "@axe-core/playwright";
import { createHtmlReport } from "axe-html-reporter";
import { sanitizeFilename } from "./testUtils";

// Siden accessibility testing er nedprioritert deaktiverer vi de som default.
export const disableAxeTests = true;

/**
 * Runs an accessibility analysis using Axe and formats the results
 * @param page - The Playwright page object
 * @param testName - The name of the test
 * @param contextDescription - Optional description for log messages
 */
export async function runAxeAnalyze(page: Page, testName: string, contextDescription: string = ""): Promise<void> {
  if (disableAxeTests) {
    /* eslint-disable-next-line no-console */
    console.log(
      `\n⏭️ Skipping Axe analyze for: '${testName}' ${contextDescription ? ` - (${contextDescription})` : ""}`,
    );
    return;
  }

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
  console.log(`\n✅ Ingen tilgjengelighetsproblemer funnet${contextDescription ? ` for ${contextDescription}` : ""}`);
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
    return `\n✅ Ingen tilgjengelighetsproblemer funnet${contextMsg}`;
  }

  let output = `\n-------- Tilgjengelighetsproblemer${contextMsg} --------\n`;
  output += `Funnet ${violations.length} tilgjengelighetsproblem(er)\n`;

  violations.forEach((violation: Result, index: number) => {
    output += `\n🔴 ${index + 1}. ${violation.help} (${violation.impact} impact)\n`;
    output += `   Regel: ${violation.id}\n`;
    output += `   Beskrivelse: ${violation.description}\n`;
    output += `   WCAG: ${violation.tags.filter((tag: string) => tag.startsWith("wcag")).join(", ")}\n`;

    if (violation.nodes && violation.nodes.length > 0) {
      output += `   Berørte elementer (${violation.nodes.length}):\n`;

      violation.nodes.forEach((node: NodeResult, nodeIndex: number) => {
        output += `     ${nodeIndex + 1}. ${node.html}\n`;

        if (node.target && node.target.length > 0) {
          output += `        Mål: ${node.target.join(", ")}\n`;
        }

        if (node.failureSummary) {
          output += `        Feilsammendrag: ${node.failureSummary.replace(/\n/g, "\n        ")}\n`;
        }
      });
    }

    output += `   How to fix: ${violation.help}\n`;
    output += `   More info: ${violation.helpUrl}\n`;
  });

  output += `\n-------------------------------------------------`;
  return output;
}
