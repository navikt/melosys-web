import { setGlobalDevModeChecks } from "reselect";

// reselect 5 varsler i dev om identitets-selectorer og ustabile input-selectorer. Mange av
// selectorene i ducks er skrevet slik, så sjekkene er slått av inntil de er ryddet opp
// (samme oppførsel som reselect 4).
setGlobalDevModeChecks({ identityFunctionCheck: "never", inputStabilityCheck: "never" });
