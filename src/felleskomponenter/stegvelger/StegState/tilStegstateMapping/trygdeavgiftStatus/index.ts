import type { StegData } from "../../../stegMotor/typer";

export const trygdeavgiftStatusType = "trygdeavgiftStatus";

// Lagrer status uten å publisere til Redux (oppdaterRedux: false)
// Dette forhindrer unødvendige re-renders som ville resette komponentens state
export const lagTrygdeavgiftStatus = (isValid: boolean): StegData => ({
  felt: trygdeavgiftStatusType,
  oppdaterRedux: false, // KRITISK: false for å unngå re-render som resetter komponenten
  type: trygdeavgiftStatusType,
  innhold: isValid,
});
