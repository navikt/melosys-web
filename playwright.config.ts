import { defineConfig } from "@playwright/test";
// create test:  npx playwright codegen
// test npx playwright test
// debug test npx playwright test --headed
// watching tet npx playwright test --ui

export default defineConfig({
  testDir: "./tests", // Folder where tests are stored
  use: {
    browserName: "chromium", // You can also use 'firefox' or 'webkit'
    headless: true, // Set to false to see the browser running
    baseURL: "http://localhost:3000", // Vite default port (adjust if needed)
    screenshot: "only-on-failure", // Captures screenshots on failure
    video: "retain-on-failure", // Saves videos of failing tests
  },
  //  webServer: {
  //    command: "npm run start", // Starts the app
  //    url: "http://localhost:3000",
  //    reuseExistingServer: true,
  //  },
});

// npx playwright test --headed
// npx playwright test --debug
// npx playwright show-report
