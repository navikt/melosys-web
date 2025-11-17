import { konverterEnkelDataTilStegData, slettEnkelData } from "../enkelData";

export const trygdeavgiftStatusType = "trygdeavgiftStatus";

export const slettTrygdeavgiftStatus = (felt) => slettEnkelData(felt, trygdeavgiftStatusType);

// Lagrer status uten å publisere til Redux (oppdaterRedux: false)
// Dette forhindrer unødvendige re-renders som ville resette komponentens state
export const lagTrygdeavgiftStatus = (isValid) => ({
  felt: trygdeavgiftStatusType,
  oppdaterRedux: false, // KRITISK: false for å unngå re-render som resetter komponenten
  type: trygdeavgiftStatusType,
  innhold: isValid,
});

export const konverterTrygdeavgiftStatusTilStegData = (status) =>
  konverterEnkelDataTilStegData(status, trygdeavgiftStatusType);
