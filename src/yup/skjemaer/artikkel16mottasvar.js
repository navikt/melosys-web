import { object, string } from "yup";

import MKV from "../../melosyskodeverk";

const { INNVILGELSE, DELVIS_INNVILGELSE } = MKV.Koder.anmodningsperiodesvartyper;

const artikkel16_motta_svar = object().shape({
  endretPeriode: object().when("$anmodningsperiodeSvarType", {
    is: (svarType) => svarType === INNVILGELSE || svarType === DELVIS_INNVILGELSE,
    then: object().shape({
      fom: string().required({ melding: "dato kreves" }).erGyldigDato({ melding: "Ugyldig dato" }),
      tom: string().required({ melding: "dato kreves" }).erGyldigDato({ melding: "Ugyldig dato" }),
    }),
  }),
});

export { artikkel16_motta_svar };
