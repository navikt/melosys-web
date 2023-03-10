import { object, string, array } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const INNGILGELSESRESULTAT_FELT_KREVES = { melding: "Du må velge innvilgelsesresultat" };
const TRYGDEDEKNING_FELT_KREVES = { melding: "Du må velge trygdedekning" };

const erPeriodeTidligereEnnMottattDato = (medlemskapsperiode, mottaksdato) => {
  return (
    Utils.dato.erGyldigPeriode(medlemskapsperiode.fomDato, Utils.dato.formatterDatoTilNorsk(mottaksdato)) &&
    Utils.dato.erGyldigPeriode(medlemskapsperiode.tomDato, Utils.dato.formatterDatoTilNorsk(mottaksdato))
  );
};

const ugyldigeInnvilgelsesResultater = (medlemskapsperioder, mottaksdato) => {
  if (!medlemskapsperioder) return false;
  return (
    medlemskapsperioder.every(
      (medlemskapsperiode) => medlemskapsperiode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT
    ) ||
    medlemskapsperioder.find(
      (medlemskapsperiode) =>
        !erPeriodeTidligereEnnMottattDato(medlemskapsperiode, mottaksdato) &&
        medlemskapsperiode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT
    )
  );
};

const erFeilAktivPaaPerioder = (medlemskapsperioder) =>
  medlemskapsperioder && medlemskapsperioder.some((medlemskapsperiode) => !!medlemskapsperiode.feil);

const erPeriodeSisteMedlemskapsperiode = (id, formValues) => {
  const medlemskapsperioder = formValues?.medlemskapsperioder || [];
  return medlemskapsperioder[medlemskapsperioder.length - 1]?.id?.toString() === id;
};

const åpenTomNårIkkeSistePeriodeTest = {
  name: "Åpen sluttdato ved etterfølgende perioder",
  message: "Sluttdato må fylles ut når det finnes etterfølgende perioder",
  test: (tomDato, schema) => {
    const erSisteMedlemskapsperiode = erPeriodeSisteMedlemskapsperiode(schema.parent.id, schema.from[1].value);
    return !(!erSisteMedlemskapsperiode && Utils._isEmpty(tomDato));
  },
};

const utenforSøknadsperioden = {
  name: "Utenfor søknadsperioden",
  message: "Utenfor søknadsperioden",
  test: (tomDato, schema) => {
    const tomDatoFraSoknadsperiode = schema.options.context.soknadsperiode.tom;
    const erSisteMedlemskapsperiode = erPeriodeSisteMedlemskapsperiode(schema.parent.id, schema.from[1].value);

    return Utils._isEmpty(tomDato)
      ? !erSisteMedlemskapsperiode || Utils._isEmpty(tomDatoFraSoknadsperiode)
      : Utils.dato.vaskInputDato(tomDato) &&
          (Utils._isEmpty(tomDatoFraSoknadsperiode) ||
            Utils.dato.erGyldigPeriode(tomDato, Utils.dato.formatterDatoTilNorsk(tomDatoFraSoknadsperiode)));
  },
};

const vurdering_perioder = object().shape({
  medlemskapsperioder: array()
    .of(
      object().shape({
        id: string().required(),
        arbeidsland: string(),
        fomDato: string().erGyldigDato().erInnenforSoknadsperioden().required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .erEtterDatofelt("fomDato")
          .test(utenforSøknadsperioden)
          .test(åpenTomNårIkkeSistePeriodeTest)
          .nullable(),
        bestemmelse: string(),
        innvilgelsesResultat: string().required(INNGILGELSESRESULTAT_FELT_KREVES),
        trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES),
        medlemskapstype: string(),
      })
    )
    .min(1),
  ikkeStottetIMelosys: string().when(["medlemskapsperioder", "$mottaksdato"], {
    is: ugyldigeInnvilgelsesResultater,
    then: string().required(),
  }),
  feilAktivPaaPerioder: string().when("medlemskapsperioder", {
    is: erFeilAktivPaaPerioder,
    then: string().required(),
  }),
});

export default vurdering_perioder;
