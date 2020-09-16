import objectPath from 'objectpath';

import * as KV from '../kodeverk';
import * as Utils from '../utils';

const feltMap = {
  behandlingsgrunnlag: {
    arbeidUtland: {
      foretakNavn: 'Navn',
      foretakOrgnr: 'Org.nr.',
      arbeidUtlandHjemmekontor: 'Arbeid utland hjemmekontor',
      adresse: {
        gatenavn: 'Gateadresse',
        husnummer: 'Husnummer',
        landkode: 'Land',
        postnummer: 'Postnummer',
        poststed: 'Poststed',
        region: 'Region',
      },
    },
    foretakUtland: {
      navn: 'Navn på virksomheten',
      adresse: {
        landkode: 'Land',
      },
    },
    maritimtArbeid: {
      enhetNavn: 'Navn',
    },
    luftfartBaser: {
      hjemmebaseNavn: 'Navn på hjemmebase',
    },
  },
};

const overordnetFeltMap = {
  behandlingsgrunnlag: {
    arbeidUtland: KV.Panel.arbeidssteder.undertitler.arbeidsstedLand,
    foretakUtland: KV.Panel.andreArbeidsforholdUtland.tittel,
    maritimtArbeid: `${KV.Panel.arbeidssteder.undertitler.arbeidsstedOffshore}/${KV.Panel.arbeidssteder.undertitler.arbeidsstedSkip}`,
    luftfartBaser: KV.Panel.arbeidssteder.undertitler.arbeidsstedFly,
  },
};

export const mapBehandlingsgrunnlagpathTilGUI = feltPath => {
  /* eslint-disable no-restricted-globals */

  const pathTokens = objectPath.parse(feltPath);
  const overordnetFeltPath = objectPath.stringify(pathTokens.slice(0, 2));
  const feltPathUtenIndeks = objectPath.stringify(pathTokens.filter(value => !isFinite(value)));

  const panel = Utils._get(overordnetFeltMap, overordnetFeltPath);
  const panelIndex = isFinite(pathTokens[2]) ? parseInt(pathTokens[2], 10) : null;
  const felt = Utils._get(feltMap, feltPathUtenIndeks);

  return {
    panel,
    panelEntryNr: panelIndex + 1,
    felt,
  };
};
