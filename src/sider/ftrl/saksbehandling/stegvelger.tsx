import React, { useEffect, useState } from "react";
import * as Utils from "../../../utils";
import { FANE_STATUS } from "../../../felleskomponenter/stegvelger/stegMotor";
import StegLinje from "../../../felleskomponenter/stegLinje/stegLinje";
import StegFane from "../../../felleskomponenter/stegFane";
import { hentNesteSteg, initialInngangSteg } from "./initialStegs";

interface AktueltSteg {
  id: string;
  tittel: string;
  stegPosisjon: number;
  status: string;
  aktivtSteg: boolean;
  vedtakSteg: boolean;
  komponent: any;
}

export const Stegvelger = () => {
  const [aktuelleSteg, setAktuellesteg] = useState<AktueltSteg[]>([initialInngangSteg]);
  const [aktivtStegIndex, setAktivtStegIndex] = useState(0);

  useEffect(() => {
    setAktuellesteg(
      aktuelleSteg?.map((steg: AktueltSteg) => ({ ...steg, aktivtSteg: steg.stegPosisjon === aktivtStegIndex }))
    );
  }, [aktivtStegIndex]);

  const oppdaterStatus = (stegId: string) => (isSchemaValid: boolean) => {
    const nyeSteg = aktuelleSteg?.map((steg: AktueltSteg) =>
      steg.id === stegId ? { ...steg, status: isSchemaValid ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET } : steg
    );

    const førsteUgyldigeSteg = nyeSteg.find((steg) => steg.status === FANE_STATUS.UBEHANDLET);

    if (førsteUgyldigeSteg) {
      nyeSteg.length = førsteUgyldigeSteg.stegPosisjon + 1;
    } else {
      const nesteSteg = hentNesteSteg(nyeSteg[nyeSteg.length - 1].stegPosisjon);
      if (nesteSteg) nyeSteg.push(nesteSteg);
    }

    setAktuellesteg(nyeSteg);
  };

  const bekreft = () => {
    setAktivtStegIndex(aktivtStegIndex + 1);
  };

  const tilbake = () => {
    setAktivtStegIndex(aktivtStegIndex - 1);
  };

  const handleKlikk = (stegIndex: number) => {
    setAktivtStegIndex(stegIndex);
  };

  return (
    <div className="stegvelger panelSeksjon">
      {!Utils._isEmpty(aktuelleSteg) && (
        <div>
          <StegLinje steg={aktuelleSteg} stegKlikk={handleKlikk} />
          {aktuelleSteg.map((steg) => (
            <StegFane
              faneData={steg}
              id={steg.id}
              key={steg.id}
              rest={{
                oppdaterStatus: oppdaterStatus(steg.id),
                bekreft,
                tilbake,
                aktivtSteg: steg.aktivtSteg,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
