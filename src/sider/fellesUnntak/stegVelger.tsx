import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import StegLinje from "../../felleskomponenter/stegLinje";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import { navigeringOperations } from "../../ducks/navigering";
import StegFane from "../../felleskomponenter/stegFane";
import { UnntakMedlemskap, VurderingInngang } from "./stegKomponenter";

interface AktueltSteg {
  id: any;
  tittel: string;
  stegPosisjon: number;
  aktivtSteg?: boolean;
  vedtakSteg?: boolean;
  komponent: any;
  status: string;
  handlers?: object;
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
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  console.log(annenBehandlingOppfriskes);
  console.log(dispatch);
  console.log(navigeringOperations);
  const oppdaterStatus = (stegId: string) => (isSchemaValid: boolean) => {
    console.log("NÅ OPPDATERER VI STATUS");
    console.log("Aktuelle steg NÅ: ", aktuelleSteg);

    const nyeAktuelleSteg = aktuelleSteg?.map((steg: any) =>
      steg.id === stegId ? { ...steg, status: isSchemaValid ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET } : steg
    );
    console.log("AKTUELLE STEG x2: ", nyeAktuelleSteg);

    setAktuellesteg(nyeAktuelleSteg);
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
          oppdaterStatus: (isSchemaValid: boolean) => oppdaterStatus("1")(isSchemaValid),
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

  console.log("aktuelleSteg: ", aktuelleSteg);

  const handleKlikk = (stegIndex: number) => {
    setAktivtStegIndex(stegIndex);
    setAktuellesteg(aktuelleSteg?.map((steg: any) => ({ ...steg, aktivtSteg: steg.stegPosisjon === stegIndex })));
  };

  return (
    <div className="stegvelger panelSeksjon">
      <div>
        {/* eslint-disable-next-line no-return-assign */}
        <StegLinje steg={aktuelleSteg} stegKlikk={handleKlikk} />
        {aktuelleSteg.map((steg) => (
          <StegFane faneData={steg} id={steg.id} key={steg.id} />
        ))}
      </div>
    </div>
  );
};

export default StegVelger;
