import { STATUS } from '../../services/utils';
import * as Types from './types';

const modaler = {
  avslagSoknad: 'avslagSoknad',
  avsluttSakSomBortfalt: 'avsluttSakSomBortfalt',
  henlegg: 'henlegg',
  oppfrisk: 'oppfrisk',
  oppfriskningBlokkererInnhold: 'oppfriskningBlokkererInnhold',
  validering: 'validering',
  revurderVedtak: 'revurderVedtak',
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
    },
    [modaler.oppfriskningBlokkererInnhold]: {
      synlig: false,
    },
    [modaler.validering]: {
      synlig: false,
    },
    [modaler.revurderVedtak]: {
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

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.OPPDATER_AVSLAG_SOKNAD: {
      return lagNyState(state, action, modaler.avslagSoknad);
    }
    case Types.OPPDATER_AVSLUTT_SAK_SOM_BORTFALT: {
      return lagNyState(state, action, modaler.avsluttSakSomBortfalt);
    }
    case Types.OPPDATER_HENLEGG: {
      return lagNyState(state, action, modaler.henlegg);
    }
    case Types.OPPDATER_OPPFRISK: {
      return lagNyState(state, action, modaler.oppfrisk);
    }
    case Types.OPPDATER_OPPFRISKNING_BLOKKERER_INNHOLD: {
      return lagNyState(state, action, modaler.oppfriskningBlokkererInnhold);
    }
    case Types.OPPDATER_VALIDERING: {
      return lagNyState(state, action, modaler.validering);
    }
    case Types.OPPDATER_REVURDER_VEDTAK: {
      return lagNyState(state, action, modaler.revurderVedtak);
    }
    default:
      return state;
  }
}
