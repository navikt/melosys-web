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
}

const StegVelger = () => {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tilForsiden = () => dispatch(navigeringOperations.tilForsiden());

  // const [aktivtStegIndex, setAktivtStegIndex] = useState(0);
  const [aktuelleSteg, setAktuellesteg] = useState<AktueltSteg[]>([
    {
      id: "1",
      stegPosisjon: 0,
      status: FANE_STATUS.OK,
      aktivtSteg: true,
      vedtakSteg: false,
      tittel: "Inngang",
      komponent: VurderingInngang,
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

  const handleKlikk = (aktivtStegIndex: number) => {
    setAktuellesteg(aktuelleSteg?.map((steg: any) => ({ ...steg, aktivtSteg: steg.stegPosisjon === aktivtStegIndex })));
  };
  return (
    <div className="stegvelger panelSeksjon">
      <div>
        {/* eslint-disable-next-line no-return-assign */}
        <StegLinje steg={aktuelleSteg} stegKlikk={handleKlikk} />
        {aktuelleSteg.map((steg) => (
          <StegFane faneData={steg} id={steg.id} />
        ))}
      </div>
    </div>
  );
};

export default StegVelger;
