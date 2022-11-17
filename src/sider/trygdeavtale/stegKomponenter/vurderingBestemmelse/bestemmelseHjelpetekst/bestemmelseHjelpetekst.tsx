import React from "react";
import MKV from "../../../../../melosyskodeverk";
import * as Hjelpetekster from "./hjelpetekster";

const BestemmelseHjelpetekst = ({ bestemmelse }: { bestemmelse?: string }) => {
  if (!bestemmelse) return null;

  const { USA_ART5_2, USA_ART5_4, USA_ART5_5, USA_ART5_6 } =
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_trygdeavtale_usa;
  const { UK_ART6_1, UK_ART6_5, UK_ART7_3, UK_ART8_2 } =
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_trygdeavtale_uk;
  const { CAN_ART6_2, CAN_ART6_2_JF8, CAN_ART7, CAN_ART7_JF8, CAN_ART9, CAN_ART10 } =
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_trygdeavtale_ca;

  const hjelpeteksterTilBestemmelse = () => {
    switch (bestemmelse) {
      case UK_ART6_1:
        return Hjelpetekster.hjelpeteksterUkArt61;
      case UK_ART6_5:
        return Hjelpetekster.hjelpeteksterUkArt65;
      case UK_ART7_3:
        return Hjelpetekster.hjelpeteksterUkArt73;
      case UK_ART8_2:
        return Hjelpetekster.hjelpeteksterUkArt82;

      case USA_ART5_2:
        return Hjelpetekster.hjelpeteksterUsArt52;
      case USA_ART5_4:
        return Hjelpetekster.hjelpeteksterUsArt54;
      case USA_ART5_5:
        return Hjelpetekster.hjelpeteksterUsArt55;
      case USA_ART5_6:
        return Hjelpetekster.hjelpeteksterUsArt56;

      case CAN_ART6_2:
      case CAN_ART6_2_JF8:
        return Hjelpetekster.hjelpeteksterCaArt62;
      case CAN_ART7:
      case CAN_ART7_JF8:
        return Hjelpetekster.hjelpeteksterCaArt7;
      case CAN_ART9:
        return Hjelpetekster.hjelpeteksterCaArt9;
      case CAN_ART10:
        return Hjelpetekster.hjelpeteksterCaArt10;

      default:
        return [];
    }
  };

  const ikkeKravOmTidsbegrensning = [UK_ART6_5, UK_ART7_3, UK_ART8_2, USA_ART5_5, CAN_ART10].includes(bestemmelse);

  return (
    <div className="bestemmelse-hjelpetekst">
      <b>Følgende vilkår må være oppfylt</b>
      <ul>
        {hjelpeteksterTilBestemmelse().map((hjelpetekst) => (
          <li key={hjelpetekst}>{hjelpetekst}</li>
        ))}
      </ul>
      {ikkeKravOmTidsbegrensning && <p>Det er ikke krav om at arbeidsperioden/utsendingen er tidsbegrenset.</p>}
    </div>
  );
};

export default BestemmelseHjelpetekst;
