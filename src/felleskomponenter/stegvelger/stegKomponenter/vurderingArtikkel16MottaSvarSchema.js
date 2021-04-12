import { object, string } from "yup";

import * as Utils from "../../../utils";

import MKV from "../../../melosyskodeverk";

const { DELVIS_INNVILGELSE } = MKV.Koder.anmodningsperiodesvartyper;

const UGYLDIG_PERIODE = { melding: "Endret periode er utenfor opprinnelig periode" };

const artikkel16_motta_svar = object().shape({
  endretPeriode: object().when("$anmodningsperiodeSvarType", {
    is: DELVIS_INNVILGELSE,
    then: object().shape({
      fom: string()
        .test("Er innenfor soknadsperiode", UGYLDIG_PERIODE, (value, { options }) => {
          const { soknadsperiode } = options.context;

          return Utils.dato.erIPeriode(
            soknadsperiode.fom,
            soknadsperiode.tom,
            Utils.dato.formatterDatoTilISO(value),
            "[]"
          );
        })
        .erGyldigDato({ melding: "Ugyldig dato" })
        .required({ melding: "dato kreves" }),
      tom: string()
        .test("Er innenfor soknadsperiode", UGYLDIG_PERIODE, (value, { options }) => {
          const { soknadsperiode } = options.context;

          return Utils.dato.erIPeriode(
            soknadsperiode.fom,
            soknadsperiode.tom,
            Utils.dato.formatterDatoTilISO(value),
            "[]"
          );
        })
        .erGyldigDato({ melding: "Ugyldig dato" })
        .required({ melding: "dato kreves" }),
    }),
  }),
});

export default artikkel16_motta_svar;
