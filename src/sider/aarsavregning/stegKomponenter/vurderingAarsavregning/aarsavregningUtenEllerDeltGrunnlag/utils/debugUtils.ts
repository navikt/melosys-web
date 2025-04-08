import React from 'react';

// Helper function to log and return changed dependencies
export const getChangedDependencies = (currentDeps: Record<string, any>, previousDepsRef: React.MutableRefObject<any>) => {
  const changedDeps: Record<string, any> = {};
  if (previousDepsRef.current) {
    // Compare current dependencies with previous ones
    Object.keys(currentDeps).forEach((key) => {
      if (!Object.is(currentDeps[key as keyof typeof currentDeps], previousDepsRef.current[key])) {
        changedDeps[key] = {
          prev: previousDepsRef.current[key],
          curr: currentDeps[key as keyof typeof currentDeps],
        };
      }
    });
    // Log only if there are changed dependencies
    if (Object.keys(changedDeps).length > 0) {
      console.log("UseEffect Changed Dependencies", changedDeps);
    } else {
      console.log("UseEffect No Changed Dependencies?!");
    }
  } else {
    // Log all dependencies on the first run
    console.log("UseEffect First Run Dependencies", currentDeps);
  }

  // Update previous deps ref
  // eslint-disable-next-line no-param-reassign
  previousDepsRef.current = currentDeps;
  return changedDeps; // Return the changed dependencies object
}; 