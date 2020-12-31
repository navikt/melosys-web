const dotenv = require("dotenv-save");
const branch = require("git-branch");

const buildNumber = process.env.BUILD_NUMBER || "local";
let branchName = process.env.BRANCH_NAME || "unknown";
if (branchName === "unknown") {
  branchName = branch.sync(process.cwd());
}

dotenv.set("REACT_APP_BUILD_VERSION", buildNumber);
