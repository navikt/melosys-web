import { createContext, useContext } from "react";
import { useWatch } from "react-hook-form";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import sendBrevSchema from "./sendBrevSchema";
import { SendBrevFormValues, SyncErrors } from "./types";

// Skjemaet valideres løpende fra verdiene (ikke via resolver), fordi feltfeilene er nestet per brevfelt
// og fordi gyldigheten styrer hva som vises (f.eks. mottakertabellen) før brukeren har forsøkt å sende.
// Mapperen lages ved kall fordi sendBrevSchema er udefinert under modulinnlastingen (sirkulær import via brevMottaker).
export const validerSendBrev = (verdier: SendBrevFormValues) =>
  lagYupToReduxformErrorMapper(sendBrevSchema)(verdier) as SyncErrors;

interface SendBrevValidering {
  feil: SyncErrors;
  // Feltfeil vises først når brukeren har forsøkt å sende brevet
  visFeil: boolean;
}

export const SendBrevValideringKontekst = createContext<SendBrevValidering>({ feil: {}, visFeil: false });

export const useSendBrevValidering = () => useContext(SendBrevValideringKontekst);

export const useSendBrevVerdier = () => useWatch<SendBrevFormValues>() as SendBrevFormValues;
