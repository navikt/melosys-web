import objectPath from "objectpath";

import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";

const feltMap = {
  behandlingsgrunnlag: {
    arbeidPaaLand: {
      fysiskeArbeidssteder: {
        virksomhetNavn: "Navn",
        adresse: {
          gatenavn: "Gateadresse",
          husnummer: "Husnummer",
          landkode: "Land",
          postnummer: "Postnummer",
          poststed: "Poststed",
          region: "Region",
        },
      },
      erHjemmekontor: "Hjemmekontor",
      erFastArbeidssted: "Fast arbeidssted",
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
    arbeidPaaLand: KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedLand,
    foretakUtland: KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
    maritimtArbeid: `${KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedOffshore}/${KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedSkip}`,
    luftfartBaser: KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedFly,
  },
};

const hentIndexPosisjonFraOverordnetFeltPath = (overordnetFeltPath: string) => {
  if (overordnetFeltPath === "behandlingsgrunnlag.arbeidPaaLand") return 3;
  return 2;
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

  const indexPosisjon = hentIndexPosisjonFraOverordnetFeltPath(overordnetFeltPath);
  const index = !isNaN(Number(pathTokens[indexPosisjon])) ? parseInt(pathTokens[indexPosisjon], 10) : null;

  const felt = Utils._get(feltMap, feltPathUtenIndeks);

  return {
    menypunkt: menypunkt || null,
    entryNr: index !== null ? index + 1 : null,
    felt: felt || null,
  };
};

export default mapBehandlingsgrunnlagpathTilMenypunkt;
