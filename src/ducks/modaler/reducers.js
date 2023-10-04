import { STATUS } from "../../services";
import * as Types from "./types";

const modaler = {
  avslagSoknad: "avslagSoknad",
  bekreftValg: "bekreftValg",
  henlegg: "henlegg",
  oppfrisk: "oppfrisk",
};

const initialState = {
  data: {
    [modaler.avslagSoknad]: {
      synlig: false,
    },
    [modaler.henlegg]: {
      synlig: false,
    },
    [modaler.oppfrisk]: {
      synlig: false,
      behandlingUnderOppfriskning: null,
    },
    [modaler.bekreftValg]: {
      synlig: false,
      type: "",
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
  console.log("reducer", action.type, action.data);
  switch (action.type) {
    case Types.OPPDATER_AVSLAG_SOKNAD: {
      return lagNyState(state, action, modaler.avslagSoknad);
    }
    case Types.OPPDATER_BEKREFT_VALG: {
      return lagNyState(state, action, modaler.bekreftValg);
    }
    case Types.OPPDATER_HENLEGG: {
      return lagNyState(state, action, modaler.henlegg);
    }
    case Types.OPPDATER_OPPFRISK: {
      return lagNyState(state, action, modaler.oppfrisk);
    }
    default:
      return state;
  }
}
