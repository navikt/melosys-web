import React from "react";
import * as Utils from "./index";

export function syncErrorsTilFeilmelding(
  syncErrors: { [key: string]: { melding?: string; _error?: { melding: string } } },
  tittel: string = "Følgende feil ble funnet"
) {
  if (Utils._isEmpty(syncErrors)) return null;

  return (
    <>
      <p>{tittel}</p>
      <ul>
        {Object.keys(syncErrors).map((key) => {
          const syncError = syncErrors[key];
          return <li key={key}>{Utils._isObject(syncError._error) ? syncError._error.melding : syncError.melding}</li>;
        })}
      </ul>
    </>
  );
}
