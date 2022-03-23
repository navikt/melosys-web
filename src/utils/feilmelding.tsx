import React from "react";
import * as Utils from "./index";

export function syncErrorsTilFeilmelding(
  syncErrors: { [key: string]: { melding: string; _error: { melding: string } } },
  tittel: string = "Følgende feil ble funnet"
) {
  if (Utils._isEmpty(syncErrors)) return null;

  const keyArray = Object.keys(syncErrors);

  if (keyArray.length === 1) {
    const syncError = syncErrors[keyArray[0]];
    return <p>{Utils._isObject(syncError._error) ? syncError._error.melding : syncError.melding}</p>;
  }

  return (
    <>
      <p>{tittel}</p>
      <ul>
        {keyArray.map((key) => {
          const syncError = syncErrors[key];
          return <li>{Utils._isObject(syncError._error) ? syncError._error.melding : syncError.melding}</li>;
        })}
      </ul>
    </>
  );
}
