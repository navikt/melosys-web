import React, { useState } from "react";
import * as Utils from "../../utils";
import StegLinje from "../../felleskomponenter/stegLinje";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import StegFane from "../../felleskomponenter/stegFane";
import VurderingUnntakMedlemskap from "./vurderingUnntakMedlemskap";
import VurderingInngang from "./vurderingInngang";

interface AktueltSteg {
  id: string;
  tittel: string;
  stegPosisjon: number;
  aktivtSteg?: boolean;
  vedtakSteg?: boolean;
  komponent: any;
  status: string;
  handlers?: object;
  data?: object;
}

interface StegvelgerProps {
  oppfriskOgLastInnSaksopplysninger: () => void;
}

const initialVurderingInngangSteg = {
  id: "1",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  tittel: "Inngang",
  komponent: VurderingInngang,
};

const initialVurderingUnntakMedlemskapSteg = {
  id: "2",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  tittel: "Unntak medlemskap",
  komponent: VurderingUnntakMedlemskap,
};

const Stegvelger = ({ oppfriskOgLastInnSaksopplysninger }: StegvelgerProps) => {
  const [aktuelleSteg, setAktuellesteg] = useState<AktueltSteg[]>([initialVurderingInngangSteg]);
  const aktivtStegIndex = aktuelleSteg?.findIndex((steg) => steg.aktivtSteg);

  const oppdaterStatus = (stegId: string) => (isSchemaValid: boolean) => {
    let nyeSteg = aktuelleSteg;
    const erInngangSteg = stegId === initialVurderingInngangSteg.id;
    const viserUnntakMedlemskapSteg = aktuelleSteg.find((steg) => steg.id === initialVurderingUnntakMedlemskapSteg.id);

    if (erInngangSteg && isSchemaValid && !viserUnntakMedlemskapSteg) {
      nyeSteg.push(initialVurderingUnntakMedlemskapSteg);
    }

    if (erInngangSteg && !isSchemaValid && viserUnntakMedlemskapSteg) {
      nyeSteg = nyeSteg.filter((steg) => steg.id !== initialVurderingUnntakMedlemskapSteg.id);
    }

    setAktuellesteg(
      nyeSteg?.map((steg: AktueltSteg) =>
        steg.id === stegId ? { ...steg, status: isSchemaValid ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET } : steg
      )
    );
  };

  const aktuelleStegMedNyttAktivtSteg = (stegIndex: number) =>
    aktuelleSteg?.map((steg: AktueltSteg) => ({ ...steg, aktivtSteg: steg.stegPosisjon === stegIndex }));

  const bekreft = () => {
    setAktuellesteg(aktuelleStegMedNyttAktivtSteg(aktivtStegIndex + 1));
  };

  const tilbake = () => {
    setAktuellesteg(aktuelleStegMedNyttAktivtSteg(aktivtStegIndex - 1));
  };

  const handleKlikk = (stegIndex: number) => {
    setAktuellesteg(aktuelleStegMedNyttAktivtSteg(stegIndex));
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
                oppfriskOgLastInnSaksopplysninger,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Stegvelger;
