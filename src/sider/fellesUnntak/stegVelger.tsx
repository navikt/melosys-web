import React, { useState } from "react";
import StegLinje from "../../felleskomponenter/stegLinje";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";
import StegFane from "../../felleskomponenter/stegFane";
import { stegMap } from "./stegMap";

interface AktueltSteg {
  id: any;
  tittel: string;
  stegPosisjon: number;
  aktivtSteg?: boolean;
  vedtakSteg?: boolean;
  komponent: any;
  status: string;
  data?: object;
  handlers?: object;
}

// TODO: Er denne komponenten nødvendig? Kan virke som trygdeavtale sin måte å gjøre det på ikke passer inn her.
const StegVelger = () => {
  const aktuelleSteg: AktueltSteg[] = [];
  const vedtakStegErAktivt = aktuelleSteg?.find((steg: AktueltSteg) => steg.vedtakSteg && steg.aktivtSteg);
  const [feilmelding] = useState("Ingenting enda...");

  return (
    <div className="stegvelger panelSeksjon">
      <div>
        <StegLinje steg={aktuelleSteg} stegKlikk={() => console.log("test")} />
        {vedtakStegErAktivt && feilmelding && <Feilmeldinger feilmeldinger={feilmelding} />}
        {aktuelleSteg.map((item: AktueltSteg) => (
          <StegFane id={item.id} key={item.id} faneData={item} />
        ))}
      </div>
    </div>
  );
};

export default StegVelger;
