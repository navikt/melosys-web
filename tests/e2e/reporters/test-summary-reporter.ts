import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";
import { TestData, TestSummaryData } from "./types";

/**
 * Custom Playwright reporter that creates a test summary
 *
 * Creates a markdown summary file showing:
 * - Overall pass/fail/skip statistics
 * - Test results table grouped by file
 * - Failed tests with error details
 * - Flaky tests (failed then passed on retry)
 *
 * Output: tests/e2e/reports/test-summary.md
 */

interface TestInfo {
  test: TestCase;
  results: TestResult[];
  finalStatus: "passed" | "failed" | "skipped" | "flaky";
  totalAttempts: number;
  failedAttempts: number;
}

class TestSummaryReporter implements Reporter {
  private testsByKey: Map<string, TestInfo> = new Map();

  onTestEnd(test: TestCase, result: TestResult) {
    // Create unique key for test (file + title)
    const key = `${test.location.file}::${test.title}`;

    // Get or create test info
    let testInfo = this.testsByKey.get(key);
    if (!testInfo) {
      testInfo = {
        test,
        results: [],
        finalStatus: result.status as "passed" | "failed" | "skipped",
        totalAttempts: 0,
        failedAttempts: 0,
      };
      this.testsByKey.set(key, testInfo);
    }

    // Add result
    testInfo.results.push(result);
    testInfo.totalAttempts++;

    // Update status
    if (result.status === "failed") {
      testInfo.failedAttempts++;
      testInfo.finalStatus = "failed";
    } else if (result.status === "passed" && testInfo.failedAttempts > 0) {
      testInfo.finalStatus = "flaky";
    } else if (result.status === "passed") {
      testInfo.finalStatus = "passed";
    } else if (result.status === "skipped") {
      testInfo.finalStatus = "skipped";
    }
  }

  onEnd(result: FullResult) {
    const outputDir = path.join(process.cwd(), "tests/e2e/reports");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const tests = Array.from(this.testsByKey.values());
    const realFailures = tests.filter((t) => t.finalStatus === "failed").length;
    const ciStatus = realFailures > 0 ? "failed" : "passed";

    // Convert to TestData format
    const testData: TestData[] = tests.map((ti) => ({
      title: ti.test.title,
      file: ti.test.location.file,
      status: ti.finalStatus,
      totalAttempts: ti.totalAttempts,
      failedAttempts: ti.failedAttempts,
      duration: ti.results[ti.results.length - 1].duration,
      error: ti.results[ti.results.length - 1].error?.message,
    }));

    const summaryData: TestSummaryData = {
      status: ciStatus,
      startTime: result.startTime,
      duration: result.duration,
      tests: testData,
      mode: (process.env.E2E_MODE as "playback" | "record" | "live") || "live",
    };

    // Generate markdown summary
    const summary = this.generateMarkdownSummary(summaryData);

    // Write markdown summary
    const outputPath = path.join(outputDir, "test-summary.md");
    fs.writeFileSync(outputPath, summary, "utf-8");
    // eslint-disable-next-line no-console
    console.log(`\n📊 Test summary written to: ${outputPath}`);

    // Write JSON version
    const jsonPath = path.join(outputDir, "test-summary.json");
    fs.writeFileSync(jsonPath, JSON.stringify(summaryData, null, 2));
    // eslint-disable-next-line no-console
    console.log(`📊 JSON summary written to: ${jsonPath}`);
  }

  private generateMarkdownSummary(data: TestSummaryData): string {
    const tests = data.tests;

    // Calculate statistics
    const passed = tests.filter((t) => t.status === "passed").length;
    const failed = tests.filter((t) => t.status === "failed").length;
    const skipped = tests.filter((t) => t.status === "skipped").length;
    const flaky = tests.filter((t) => t.status === "flaky").length;
    const totalTests = tests.length;
    const totalAttempts = tests.reduce((sum, t) => sum + t.totalAttempts, 0);

    let md = "## 🧪 Integration Test Results (Playback)\n\n";

    // Mode badge
    const modeBadge = data.mode === "playback" ? "🔄 Playback" : data.mode === "record" ? "🔴 Record" : "🟢 Live";
    md += `**Mode:** ${modeBadge}\n\n`;

    // Summary table
    md += "| Status | Count |\n";
    md += "|--------|-------|\n";
    md += `| ✅ Passed | ${passed} |\n`;
    md += `| ❌ Failed | ${failed} |\n`;
    md += `| ⏭️ Skipped | ${skipped} |\n`;
    if (flaky > 0) {
      md += `| 🔄 Flaky | ${flaky} |\n`;
    }
    md += `| **Total** | **${totalTests}** |\n\n`;

    if (totalAttempts > totalTests) {
      md += `_${totalAttempts - totalTests} retries were needed_\n\n`;
    }

    md += `**Duration:** ${Math.round(data.duration / 1000)}s\n\n`;

    // Failed tests section
    if (failed > 0) {
      md += this.generateFailedTestsSection(tests.filter((t) => t.status === "failed"));
    }

    // Flaky tests section
    if (flaky > 0) {
      md += this.generateFlakyTestsSection(tests.filter((t) => t.status === "flaky"));
    }

    // Skipped tests section
    if (skipped > 0) {
      md += this.generateSkippedTestsSection(tests.filter((t) => t.status === "skipped"));
    }

    // Test results table
    md += this.generateTestResultsTable(tests);

    return md;
  }

  private generateFailedTestsSection(failedTests: TestData[]): string {
    let md = `### ❌ Failed Tests (${failedTests.length})\n\n`;

    for (const test of failedTests) {
      const fileName = path.basename(test.file);
      md += `<details>\n`;
      md += `<summary><strong>${test.title}</strong> (${fileName})</summary>\n\n`;

      if (test.totalAttempts > 1) {
        md += `**Attempts:** ${test.totalAttempts} (all failed)\n\n`;
      }

      if (test.error) {
        // Truncate long errors
        const errorText = test.error.length > 1000 ? test.error.substring(0, 1000) + "\n..." : test.error;
        md += `**Error:**\n\`\`\`\n${errorText}\n\`\`\`\n`;
      }

      md += `\n</details>\n\n`;
    }

    return md;
  }

  private generateFlakyTestsSection(flakyTests: TestData[]): string {
    let md = `### 🔄 Flaky Tests (${flakyTests.length})\n\n`;
    md += `_These tests failed initially but passed on retry:_\n\n`;

    for (const test of flakyTests) {
      const fileName = path.basename(test.file);
      md += `- **${test.title}** (${fileName}) - ${test.failedAttempts}/${test.totalAttempts} attempts failed\n`;
    }
    md += "\n";

    return md;
  }

  private generateSkippedTestsSection(skippedTests: TestData[]): string {
    let md = `### ⏭️ Skipped Tests (${skippedTests.length})\n\n`;

    for (const test of skippedTests) {
      const fileName = path.basename(test.file);
      md += `- ${test.title} (${fileName})\n`;
    }
    md += "\n";

    return md;
  }

  private generateTestResultsTable(tests: TestData[]): string {
    let md = `### 📋 All Tests\n\n`;

    // Group by file
    const byFile = new Map<string, TestData[]>();
    for (const test of tests) {
      const fileName = path.basename(test.file);
      if (!byFile.has(fileName)) {
        byFile.set(fileName, []);
      }
      byFile.get(fileName)!.push(test);
    }

    // Sort files: files with failures first
    const sortedFiles = Array.from(byFile.entries()).sort((a, b) => {
      const aHasFailures = a[1].some((t) => t.status === "failed");
      const bHasFailures = b[1].some((t) => t.status === "failed");
      if (aHasFailures && !bHasFailures) return -1;
      if (!aHasFailures && bHasFailures) return 1;
      return a[0].localeCompare(b[0]);
    });

    md += "<details>\n";
    md += "<summary>Click to expand full test list</summary>\n\n";

    md += "| File | Test | Status | Duration |\n";
    md += "|------|------|--------|----------|\n";

    for (const [fileName, fileTests] of sortedFiles) {
      // Sort tests within file: failed first
      const sortedTests = fileTests.sort((a, b) => {
        if (a.status === "failed" && b.status !== "failed") return -1;
        if (a.status !== "failed" && b.status === "failed") return 1;
        return 0;
      });

      for (const test of sortedTests) {
        const statusEmoji = this.getStatusEmoji(test.status);
        const duration = Math.round(test.duration / 1000) + "s";
        const title = test.title.length > 50 ? test.title.substring(0, 47) + "..." : test.title;
        md += `| ${fileName} | ${title} | ${statusEmoji} | ${duration} |\n`;
      }
    }

    md += "\n</details>\n";

    return md;
  }

  private getStatusEmoji(status: TestData["status"]): string {
    switch (status) {
      case "passed":
        return "✅";
      case "failed":
        return "❌";
      case "flaky":
        return "🔄";
      case "skipped":
        return "⏭️";
      default:
        return "❓";
    }
  }
}

export default TestSummaryReporter;
