import React, { useEffect, useState } from "react";
import StegLinje from "../../felleskomponenter/stegLinje";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import StegFane from "../../felleskomponenter/stegFane";
import { UnntakMedlemskap, VurderingInngang } from "./stegKomponenter";
import * as Utils from "../../utils";

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

interface StegVelgerProps {
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger: () => void;
  annenBehandlingOppfriskes: boolean;
}

const StegVelger = ({
  annenBehandlingOppfriskes,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
}: StegVelgerProps) => {
  const [aktivtStegIndex, setAktivtStegIndex] = useState(0);
  const [aktuelleSteg, setAktuellesteg] = useState<AktueltSteg[]>([]);
  console.log(annenBehandlingOppfriskes);

  const oppdaterStatus = (stegId: string) => (isSchemaValid: boolean) => {
    setAktuellesteg(
      aktuelleSteg?.map((steg: any) =>
        steg.id === stegId ? { ...steg, status: isSchemaValid ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET } : steg
      )
    );
  };

  const bekreft = () => {
    setAktuellesteg(
      aktuelleSteg?.map((steg: any) => ({ ...steg, aktivtSteg: steg.stegPosisjon === aktivtStegIndex + 1 }))
    );
  };

  const tilbake = () => {
    setAktuellesteg(
      aktuelleSteg?.map((steg: any) => ({ ...steg, aktivtSteg: steg.stegPosisjon === aktivtStegIndex - 1 }))
    );
  };

  useEffect(() => {
    setAktuellesteg([
      {
        id: "1",
        stegPosisjon: 0,
        status: FANE_STATUS.UBEHANDLET,
        aktivtSteg: true,
        vedtakSteg: false,
        tittel: "Inngang",
        komponent: VurderingInngang,
        handlers: {
          bekreft,
          tilbake,
          innhentRegisteropplysninger: lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
        },
      },
      {
        id: "2",
        stegPosisjon: 1,
        status: FANE_STATUS.UBEHANDLET,
        aktivtSteg: false,
        vedtakSteg: false,
        tittel: "Unntak medlemskap",
        komponent: UnntakMedlemskap,
      },
    ]);
    console.log("jojo");
  }, []);

  const handleKlikk = (stegIndex: number) => {
    setAktivtStegIndex(stegIndex);
    setAktuellesteg(aktuelleSteg?.map((steg: any) => ({ ...steg, aktivtSteg: steg.stegPosisjon === stegIndex })));
  };

  return (
    <div className="stegvelger panelSeksjon">
      {!Utils._isEmpty(aktuelleSteg) && (
        <div>
          {/* eslint-disable-next-line no-return-assign */}
          <StegLinje steg={aktuelleSteg} stegKlikk={handleKlikk} />
          {aktuelleSteg.map((steg) => (
            <StegFane faneData={steg} id={steg.id} key={steg.id} rest={{ oppdaterStatus: oppdaterStatus(steg.id) }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StegVelger;
