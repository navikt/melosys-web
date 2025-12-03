#!/bin/bash
# Script to enable API recording in all E2E test files
# Usage: ./tests/e2e/scripts/enable-recording.sh

set -e

SPECS_DIR="tests/e2e/specs"

echo "Enabling API recording in all test files..."

# Find all spec.ts files and update imports
find "$SPECS_DIR" -name "*.spec.ts" -type f | while read -r file; do
  # Check if file uses @playwright/test import
  if grep -q 'from "@playwright/test"' "$file"; then
    # Calculate relative path to recording/fixtures
    dir=$(dirname "$file")
    rel_path=$(python3 -c "import os.path; print(os.path.relpath('tests/e2e/recording/fixtures', '$dir'))")

    echo "  Updating: $file"

    # Replace import and add apiRecorder to test function
    sed -i '' \
      -e "s|from \"@playwright/test\"|from \"$rel_path\"|g" \
      "$file"

    # Add apiRecorder parameter to test functions (if not already present)
    sed -i '' \
      -e 's/async ({ page })/async ({ page, apiRecorder })/g' \
      -e 's/async ({ page },/async ({ page, apiRecorder },/g' \
      "$file"
  fi
done

echo "Done! All test files now use the recording fixture."
echo ""
echo "To record API responses:"
echo "  pnpm test:e2e:record"
echo ""
echo "To run tests in playback mode:"
echo "  pnpm test:e2e:playback"
