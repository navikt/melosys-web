import React from "react";

/**
 * Hjelpefunksjon for å logge og returnere endrede dependencies i en useEffect.
 * Bruker `Object.is` for sammenligning.
 * @param currentDeps Objekt med nåværende dependencies.
 * @param previousDepsRef Ref-objekt som holder forrige dependencies.
 * @returns Objekt med kun de dependencies som har endret seg.
 */
export const getChangedDependencies = (
  currentDeps: Record<string, any>,
  previousDepsRef: React.MutableRefObject<any>,
) => {
  const changedDeps: Record<string, any> = {};
  if (previousDepsRef.current) {
    // Sammenlign nåværende dependencies med forrige
    Object.keys(currentDeps).forEach((key) => {
      // Bruker Object.is for sammenligning (håndterer NaN, +0/-0 etc.)
      if (!Object.is(currentDeps[key as keyof typeof currentDeps], previousDepsRef.current[key])) {
        changedDeps[key] = {
          prev: previousDepsRef.current[key],
          curr: currentDeps[key as keyof typeof currentDeps],
        };
      }
    });
    // Logg kun hvis det faktisk er endringer
    if (Object.keys(changedDeps).length > 0) {
      console.log("UseEffect Changed Dependencies", changedDeps);
    } else {
      console.log("UseEffect No Changed Dependencies?!");
    }
  } else {
    // Logg alle dependencies ved første kjøring
    console.log("UseEffect First Run Dependencies", currentDeps);
  }

  // Oppdater ref med nåværende dependencies for neste sjekk
  // eslint-disable-next-line no-param-reassign
  previousDepsRef.current = currentDeps;
  // Returner objektet med kun endrede dependencies
  return changedDeps;
};
