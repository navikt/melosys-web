import React from "react";
import { FormErrors } from "redux-form";
import * as Utils from "./index";

export function syncErrorsTilFeilmelding(
  syncErrors: { [key: string]: { melding?: string; _error?: { melding: string } } } | FormErrors<any>,
  tittel: string = "Følgende feil ble funnet"
) {
  if (Utils._isEmpty(syncErrors)) return null;

  const finnFeilmelding = (feil: any): any => {
    if (Utils._isString(feil?.melding)) {
      return <li key={feil.melding}>{feil.melding}</li>;
    }

    if (Utils._isObject(feil)) {
      return (
        Object.keys(feil)
          // @ts-ignore
          .map((key) => finnFeilmelding(feil[key]))
      );
    }
    return <li key="Noe gikk galt">Noe gikk galt</li>;
  };

  return (
    <>
      <p>{tittel}</p>
      <ul>
        {Object.keys(syncErrors).map((key) => {
          const syncError = syncErrors[key];
          return finnFeilmelding(syncError);
        })}
      </ul>
    </>
  );
}
