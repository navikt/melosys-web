import { array, object, string } from "yup";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { harIkkeLovligSluttDato } from "./komponenter/feilmeldinger";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const INNGILGELSESRESULTAT_FELT_KREVES = { melding: "Du må velge innvilgelsesresultat" };
const TRYGDEDEKNING_FELT_KREVES = { melding: "Du må velge trygdedekning" };

const erFeilPaaPerioder = (medlemskapsperioder) => medlemskapsperioder?.some((periode) => !!periode.feil);

const erPeriodeSisteMedlemskapsperiode = (periodeId, formValues) => {
  const medlemskapsperioder = formValues?.medlemskapsperioder || [];
  return medlemskapsperioder[medlemskapsperioder.length - 1]?.periodeId?.toString() === periodeId;
};

const åpenTomNårIkkeSistePeriodeTest = {
  name: "Åpen sluttdato ved etterfølgende perioder",
  message: { melding: "Sluttdato må fylles ut når det finnes etterfølgende perioder" },
  test: (tomDato, schema) => {
    const erSisteMedlemskapsperiode = erPeriodeSisteMedlemskapsperiode(schema.parent.periodeId, schema.from[1].value);
    return !(!erSisteMedlemskapsperiode && Utils._isEmpty(tomDato));
  },
};

const utenforSøknadsperioden = {
  name: "Utenfor søknadsperioden",
  message: { melding: "Utenfor søknadsperioden" },
  test: (tomDato, schema) => {
    if (Utils._isEmpty(tomDato) || !Utils.dato.vaskInputDato(tomDato)) return true;

    const sluttdatoFraSoknadsperiode = schema.options.context.soknadsperiode.tom;
    return (
      Utils._isEmpty(sluttdatoFraSoknadsperiode) ||
      Utils.dato.erGyldigPeriode(tomDato, Utils.dato.formatterDatoTilNorsk(sluttdatoFraSoknadsperiode))
    );
  },
};

const tomDatoPåkrevd = {
  name: "Påkrevd felt",
  message: { ...MAA_FYLLES_UT },
  test: (tomDato, schema) => {
    const { soknadsland } = schema.options.context;
    return !harIkkeLovligSluttDato(schema.from[1].value.medlemskapsperioder, soknadsland);
  },
};

const vurdering_perioder = object().shape({
  medlemskapsperioder: array()
    .of(
      object().shape({
        periodeId: string().required(),
        fomDato: string().erGyldigDato().erInnenforSoknadsperioden().required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .erEtterDatofelt("fomDato")
          .test(utenforSøknadsperioden)
          .test(åpenTomNårIkkeSistePeriodeTest)
          .test(tomDatoPåkrevd),
        innvilgelsesResultat: string().required(INNGILGELSESRESULTAT_FELT_KREVES),
        trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES),
      })
    )
    .min(1),
  feilPaaPerioder: string().when("medlemskapsperioder", {
    is: erFeilPaaPerioder,
    then: string().required(),
  }),
});

export default vurdering_perioder;
