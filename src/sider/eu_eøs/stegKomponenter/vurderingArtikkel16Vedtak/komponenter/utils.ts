import MKV from "../../../../../melosyskodeverk";
import { AnmodningsperiodesvarResDto } from "../../../../../services/modules/anmodningsperioder/svar/svar";
import { Anmodningsperiode } from "../../../../../services/modules/anmodningsperioder";
import { anmodningsperiodesvarSelectors } from "../../../../../ducks/anmodningsperiodesvar";
import { lovvalgsperioderSelectors } from "../../../../../ducks/lovvalgsperioder";
import { anmodningsperioderSelectors } from "../../../../../ducks/anmodningsperioder";
import * as Utils from "../../../../../utils";
import { RootState } from "AppTypes";
import { Periode } from "../../../../../services/modules/types";

export const hentLovvalgsperiode = (
  anmodningsperiodesvar: AnmodningsperiodesvarResDto,
  anmodningsperiode: Anmodningsperiode
): Partial<Periode> => {
  const { anmodningsperiodeSvarType, endretPeriode } = anmodningsperiodesvar;

  if (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE) {
    return {
      fom: anmodningsperiode.fomDato,
      tom: anmodningsperiode.tomDato,
    };
  }
  if (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE) {
    return {
      fom: endretPeriode.fom!!,
      tom: endretPeriode.tom,
    };
  }

  return {
    fom: undefined,
    tom: undefined,
  };
};

export const erLovvalgsperiodeForkortet = (state: RootState) => {
  const anmodningsperiodesvartype = anmodningsperiodesvarSelectors.AnmodningsperiodeSvarTypeSelector(state);
  const lovvalgsperiodeTom = lovvalgsperioderSelectors.TomDatoSelector(state);
  const lovvalgsperiodeFom = lovvalgsperioderSelectors.FomDatoSelector(state);

  if (anmodningsperiodesvartype === MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE) {
    const anmodningsperiodeFom = anmodningsperioderSelectors.FomDatoSelector(state);
    const anmodningsperiodeTom = anmodningsperioderSelectors.TomDatoSelector(state);

    return (
      Utils.dato.datoDiffPure(anmodningsperiodeTom, lovvalgsperiodeTom, "days") !== 0 ||
      Utils.dato.datoDiffPure(anmodningsperiodeFom, lovvalgsperiodeFom, "days") !== 0
    );
  }

  if (anmodningsperiodesvartype === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE) {
    const anmodningsperiodesvarFom = anmodningsperiodesvarSelectors.EndretPeriodeFomSelector(state);
    const anmodningsperiodesvarTom = anmodningsperiodesvarSelectors.EndretPeriodeTomSelector(state);

    return (
      Utils.dato.datoDiffPure(anmodningsperiodesvarTom, lovvalgsperiodeTom, "days") !== 0 ||
      Utils.dato.datoDiffPure(anmodningsperiodesvarFom, lovvalgsperiodeFom, "days") !== 0
    );
  }

  return false;
};
