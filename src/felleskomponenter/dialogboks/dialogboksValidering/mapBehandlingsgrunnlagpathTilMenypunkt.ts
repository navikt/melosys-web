import objectPath from "objectpath";

import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";

const feltMap = {
  behandlingsgrunnlag: {
    arbeidUtland: {
      foretakNavn: "Navn",
      foretakOrgnr: "Org.nr.",
      arbeidUtlandHjemmekontor: "Arbeid utland hjemmekontor",
      adresse: {
        gatenavn: "Gateadresse",
        husnummer: "Husnummer",
        landkode: "Land",
        postnummer: "Postnummer",
        poststed: "Poststed",
        region: "Region",
      },
    },
    foretakUtland: {
      navn: "Navn på virksomheten",
      adresse: {
        landkode: "Land",
      },
    },
    maritimtArbeid: {
      enhetNavn: "Navn",
    },
    luftfartBaser: {
      hjemmebaseNavn: "Navn på hjemmebase",
    },
  },
};

const overordnetFeltMap = {
  behandlingsgrunnlag: {
    arbeidUtland: KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedLand,
    foretakUtland: KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
    maritimtArbeid: `${KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedOffshore}/${KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedSkip}`,
    luftfartBaser: KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedFly,
  },
};

const mapBehandlingsgrunnlagpathTilMenypunkt = (
  feltPath: string
): {
  menypunkt: string | null;
  entryNr: number | null;
  felt: string | null;
} => {
  /* eslint-disable no-restricted-globals */

  const pathTokens = objectPath.parse(feltPath);
  const overordnetFeltPath = objectPath.stringify(pathTokens.slice(0, 2));
  const feltPathUtenIndeks = objectPath.stringify(pathTokens.filter((value) => isNaN(Number(value))));

  const menypunkt = Utils._get(overordnetFeltMap, overordnetFeltPath);
  const index = !isNaN(Number(pathTokens[2])) ? parseInt(pathTokens[2], 10) : null;
  const felt = Utils._get(feltMap, feltPathUtenIndeks);

  return {
    menypunkt: menypunkt || null,
    entryNr: index !== null ? index + 1 : null,
    felt: felt || null,
  };
};

export default mapBehandlingsgrunnlagpathTilMenypunkt;
