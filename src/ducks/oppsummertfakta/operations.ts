import { doThenDispatch } from "../../services/utils";

import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./action";

export function hentOppsummertFakta(behandlingID: number) {
  return doThenDispatch(() => Api.Avklartefakta.hentOppsummering(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagreVirksomheter(behandlingID: number, virksomheter: Api.Avklartefakta.Virksomheter) {
  return doThenDispatch(() => Api.Avklartefakta.lagreVirksomheter(behandlingID, virksomheter), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagreInnbetalingsstatus(behandlingID: number, fullstendigManglendeInnbetaling?: boolean) {
  return doThenDispatch(() => Api.Avklartefakta.lagreInnbetalingsstatus(behandlingID, fullstendigManglendeInnbetaling), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagreArbeidsland(behandlingID: number, arbeidsland: Api.Avklartefakta.Arbeidsland) {
  return doThenDispatch(() => Api.Avklartefakta.lagreArbeidsland(behandlingID, arbeidsland), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagreIkkeYrkesaktivOppholdtype(behandlingID: number, oppholdstype: string) {
  return doThenDispatch(() => Api.Avklartefakta.lagreIkkeYrkesaktivOppholdstype(behandlingID, oppholdstype), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagreIkkeYrkesaktivRelasjontype(behandlingID: number, relasjonstype: string) {
  return doThenDispatch(() => Api.Avklartefakta.lagreIkkeYrkesaktivRelasjonstype(behandlingID, relasjonstype), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagreArbeidssituasjontype(behandlingID: number, arbeidssituasjontype: string) {
  return doThenDispatch(() => Api.Avklartefakta.lagreArbeidssituasjontype(behandlingID, arbeidssituasjontype), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagreUkjentSluttdatoMedlemskapsperiode(behandlingID: number, ukjentSluttdato: boolean) {
  return doThenDispatch(() => Api.Avklartefakta.lagreUkjentSluttdatoMedlemskapsperiode(behandlingID, ukjentSluttdato), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function slettAvklartefakta(behandlingID: number, avklartefaktaType: string) {
  return doThenDispatch(() => Api.Avklartefakta.slettAvklartefakta(behandlingID, avklartefaktaType), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetOppsummertFakta() {
  return Actions.resetOppsummertFakta();
}
