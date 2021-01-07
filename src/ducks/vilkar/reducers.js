/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */
import MKV from "../../melosyskodeverk";

import { STATUS } from "../../services/utils";

import * as Types from "./types";
import * as Constants from "./constants";

const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
};

const vilkarTilObjekt = (vilkaar, oppfylt, begrunnelseKoder, begrunnelseFritekst, begrunnelseFritekstEngelsk) =>
  oppfylt === undefined || oppfylt === null
    ? null
    : {
        vilkaar,
        oppfylt: oppfylt === "true" || oppfylt,
        begrunnelseKoder: begrunnelseKoder || [],
        begrunnelseFritekst: begrunnelseFritekst || null,
        begrunnelseFritekstEngelsk: begrunnelseFritekstEngelsk || null,
      };

const velgArt16Objekt = (art16avslag, art16anmodning) => art16avslag || art16anmodning;

const hentIkkeSkrivbareVilkaarData = (state) =>
  Constants.VILKAAR_FRONTEND_MANGLER_SKRIVETILGANG_TIL.map((v) =>
    state.data.find((enkeltVilkaar) => enkeltVilkaar.vilkaar === v)
  ).filter((v) => v != null);

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    case Types.RESET: {
      const IKKE_SKRIVBARE_VILKAAR_DATA = hentIkkeSkrivbareVilkaarData(state);
      const data = [...initialState.data, ...IKKE_SKRIVBARE_VILKAAR_DATA];

      return {
        ...initialState,
        data,
      };
    }
    case Types.OPPDATER_VILKAR: {
      // Gjennomgå alle vilkår som kan være satt. Dersom de er 'undefined', vil det si at
      // saksbehandler ikke har vært innom denne vurderingen og kanskje aldri kommer tid. Siden
      // det da ikke er et vilkår som er vurdert, skal det heller ikke inn i modellen eller sendes backend.
      /* eslint-disable max-len */
      const vilkarArray = [
        vilkarTilObjekt(
          MKV.Koder.vilkaar.ART12_1_FORUTGAAENDE_MEDLEMSKAP,
          action.data.vilkar.forutgaendeMedlemskap,
          action.data.vilkar.forutgaendeMedlemskap_begrunnelser
        ),
        vilkarTilObjekt(
          MKV.Koder.vilkaar.ART12_1_VESENTLIG_VIRKSOMHET,
          action.data.vilkar.vesentligVirksomhet,
          action.data.vilkar.vesentligVirksomhet_begrunnelser
        ),
        vilkarTilObjekt(
          MKV.Koder.vilkaar.ART12_2_NORMALT_DRIVER_VIRKSOMHET,
          action.data.vilkar.normaltDriverVirksomhet,
          action.data.vilkar.normaltDriverVirksomhet_begrunnelser
        ),
        vilkarTilObjekt(MKV.Koder.vilkaar.FTRL_2_12_UNNTAK_TURISTSKIP, action.data.vilkar.nis),
        vilkarTilObjekt(
          MKV.Koder.vilkaar.FO_883_2004_ART12_1,
          action.data.vilkar.art12_1,
          action.data.vilkar.art12_1_begrunnelser
        ),
        vilkarTilObjekt(
          MKV.Koder.vilkaar.FO_883_2004_ART12_2,
          action.data.vilkar.art12_2,
          action.data.vilkar.art12_2_begrunnelser
        ),
        velgArt16Objekt(
          vilkarTilObjekt(
            MKV.Koder.vilkaar.FO_883_2004_ART16_1,
            action.data.vilkar.art16_1_avslag,
            action.data.vilkar.art16_1_avslag_begrunnelser,
            action.data.vilkar.art16_1_avslag_begrunnelser_fritekst
          ),
          vilkarTilObjekt(
            MKV.Koder.vilkaar.FO_883_2004_ART16_1,
            action.data.vilkar.art16_1_anmodning,
            action.data.vilkar.art16_1_anmodning_begrunnelser,
            action.data.vilkar.art16_1_anmodning_begrunnelser_fritekst,
            action.data.vilkar.art16_1_anmodning_begrunnelser_fritekst_engelsk
          )
        ),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART11_3A, action.data.vilkar.art11_3A),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART11_4_1, action.data.vilkar.art11_4_1),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART11_4_2, action.data.vilkar.art11_4_2),
        vilkarTilObjekt(
          MKV.Koder.vilkaar.FTRL_2_8_FORUTGÅENDE_TRYGDETID,
          action.data.vilkar.FTRL_2_8_FORUTGÅENDE_TRYGDETID,
          action.data.vilkar.FTRL_2_8_FORUTGÅENDE_TRYGDETID_begrunnelser
        ),
        vilkarTilObjekt(
          MKV.Koder.vilkaar.FTRL_2_8_NÆR_TILKNYTNING_NORGE,
          action.data.vilkar.FTRL_2_8_NÆR_TILKNYTNING_NORGE,
          action.data.vilkar.FTRL_2_8_NÆR_TILKNYTNING_NORGE_begrunnelser
        ),
      ].filter((vilkar) => vilkar !== null);

      const IKKE_SKRIVBARE_VILKAAR_DATA = hentIkkeSkrivbareVilkaarData(state);
      const data = [...vilkarArray, ...IKKE_SKRIVBARE_VILKAAR_DATA];

      return {
        ...state,
        data,
      };
    }
    default:
      return state;
  }
}
