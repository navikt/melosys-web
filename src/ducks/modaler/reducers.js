import { STATUS } from "../../services";
import * as Types from "./types";

const modaler = {
  avslagSoknad: "avslagSoknad",
  avsluttSakSomBortfalt: "avsluttSakSomBortfalt",
  ferdigbehandleSak: "ferdigbehandleSak",
  henlegg: "henlegg",
  oppfrisk: "oppfrisk",
  revurderFagsak: "revurderFagsak",
};

const initialState = {
  data: {
    [modaler.avslagSoknad]: {
      synlig: false,
    },
    [modaler.avsluttSakSomBortfalt]: {
      synlig: false,
    },
    [modaler.henlegg]: {
      synlig: false,
    },
    [modaler.oppfrisk]: {
      synlig: false,
      behandlingUnderOppfriskning: null,
    },
    [modaler.revurderFagsak]: {
      synlig: false,
    },
    [modaler.ferdigbehandleSak]: {
      synlig: false,
    },
  },
  status: STATUS.NOT_STARTED,
};

const lagNyState = (state, action, stateNavn) => ({
  ...state,
  status: STATUS.OK,
  data: {
    ...state.data,
    [stateNavn]: {
      ...state.data[stateNavn],
      ...action.data,
    },
  },
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Types.OPPDATER_AVSLAG_SOKNAD: {
      return lagNyState(state, action, modaler.avslagSoknad);
    }
    case Types.OPPDATER_AVSLUTT_SAK_SOM_BORTFALT: {
      return lagNyState(state, action, modaler.avsluttSakSomBortfalt);
    }
    case Types.OPPDATER_FERDIGBEHANDLE_SAK: {
      return lagNyState(state, action, modaler.ferdigbehandleSak);
    }
    case Types.OPPDATER_HENLEGG: {
      return lagNyState(state, action, modaler.henlegg);
    }
    case Types.OPPDATER_OPPFRISK: {
      return lagNyState(state, action, modaler.oppfrisk);
    }
    case Types.OPPDATER_REVURDER_FAGSAK: {
      return lagNyState(state, action, modaler.revurderFagsak);
    }
    default:
      return state;
  }
}
