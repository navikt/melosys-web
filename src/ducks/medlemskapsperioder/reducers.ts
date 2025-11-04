import { StateSection } from "AppTypes";
import { STATUS } from "../../services";
import * as Api from "../../services/api";
import * as Types from "./types";

export const initialState: StateSection<Types.Data> = {
  data: {},
  status: STATUS.NOT_STARTED,
};

const finnIndexTilPeriode = (
  perioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Avgiftspliktigperiode[],
  action: Types.OkSlettMedlemskapsperiodeAction | Types.OkOppdaterMedlemskapsperiodeAction,
) => perioder?.findIndex((periode) => periode.id === action.data.id);

export default function reducer(state = initialState, action: Types.Action): StateSection<Types.Data> {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK_MEDLEMSKAPSPERIODE: {
      return {
        ...state,
        status: STATUS.OK,
        data: {
          ...state.data,
          medlemskapsperioder: action.data,
        },
      };
    }
    case Types.OK_OPPRETT_MEDLEMSKAPSPERIODE: {
      return {
        ...state,
        status: STATUS.OK,
        data: {
          ...state.data,
          medlemskapsperioder: [...(state.data.medlemskapsperioder ?? []), action.data],
        },
      };
    }
    case Types.OK_OPPDATER_MEDLEMSKAPSPERIODE: {
      const medlemskapsperioder = [...(state.data.medlemskapsperioder ?? [])];
      const oppdatertPeriodeId = finnIndexTilPeriode(medlemskapsperioder, action);
      if (oppdatertPeriodeId !== -1) medlemskapsperioder[oppdatertPeriodeId] = action.data;
      return {
        ...state,
        status: STATUS.OK,
        data: {
          ...state.data,
          medlemskapsperioder,
        },
      };
    }
    case Types.OK_SLETT_MEDLEMSKAPSPERIODE: {
      const medlemskapsperioder = [...(state.data.medlemskapsperioder ?? [])];
      const slettetPeriodeId = finnIndexTilPeriode(medlemskapsperioder, action);
      if (slettetPeriodeId !== -1) medlemskapsperioder.splice(slettetPeriodeId, 1);
      return {
        ...state,
        status: STATUS.OK,
        data: {
          ...state.data,
          medlemskapsperioder,
        },
      };
    }
    case Types.OK_SLETT_ALLE_MEDLEMSKAPSPERIODER: {
      return {
        ...state,
        status: STATUS.OK,
        data: {
          ...state.data,
          medlemskapsperioder: [],
        },
      };
    }
    case Types.RESET:
      return { ...initialState };
    default:
      return state;
  }
}
