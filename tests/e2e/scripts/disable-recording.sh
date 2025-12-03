#!/bin/bash
# Script to disable API recording in all E2E test files (revert to standard Playwright)
# Usage: ./tests/e2e/scripts/disable-recording.sh

set -e

SPECS_DIR="tests/e2e/specs"

echo "Disabling API recording in all test files..."

# Find all spec.ts files and revert imports
find "$SPECS_DIR" -name "*.spec.ts" -type f | while read -r file; do
  # Check if file uses recording/fixtures import
  if grep -q 'from ".*recording/fixtures"' "$file"; then
    echo "  Reverting: $file"

    # Replace import back to @playwright/test
    sed -i '' \
      -e 's|from ".*recording/fixtures"|from "@playwright/test"|g' \
      "$file"

    # Remove apiRecorder parameter from test functions
    sed -i '' \
      -e 's/{ page, apiRecorder }/{ page }/g' \
      -e 's/{ page, apiRecorder },/{ page },/g' \
      "$file"
  fi
done

echo "Done! All test files now use standard @playwright/test."
