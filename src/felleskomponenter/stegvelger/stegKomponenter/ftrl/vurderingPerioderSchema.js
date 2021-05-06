import { object, string, array } from "yup";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";

const FOM_FELT_KREVES = { melding: "Må fylles ut" };
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
    medlemskapsperioder.every((medlemskapsperiode) => medlemskapsperiode.innvilgelsesResultat === KV.Koder.AVSLAATT) ||
    medlemskapsperioder.find(
      (medlemskapsperiode) =>
        !erPeriodeTidligereEnnMottattDato(medlemskapsperiode, mottaksdato) &&
        medlemskapsperiode.innvilgelsesResultat === KV.Koder.AVSLAATT
    )
  );
};

const erFeilAktivPaaPerioder = (medlemskapsperioder) =>
  medlemskapsperioder && medlemskapsperioder.some((medlemskapsperiode) => !!medlemskapsperiode.feil);

const erDatoGyldig = (dato) => (Utils._isEmpty(dato) ? true : Utils.dato.vaskInputDato(dato));

const gyldigDatoTest = {
  name: "Gyldig dato",
  message: "Skriv inn en gyldig dato",
  test: (dato) => erDatoGyldig(dato),
};

const gyldigFomDatoTest = {
  name: "Gyldig fomDato",
  message: "Dato er utenfor søknadsperioden",
  test: (dato, schema) =>
    erDatoGyldig(dato) &&
    Utils.dato.erGyldigPeriode(Utils.dato.formatterDatoTilNorsk(schema.options.context.soknadsperiode.fom), dato),
};

const gyldigTomDatoTest = {
  name: "Gyldig tomDato",
  message: "Dato er utenfor søknadsperioden",
  test: (tomDato, schema) => {
    const tomDatoFraSoknadsperiode = schema.options.context.soknadsperiode.tom;
    const medlemskapsperioder = schema.options.context.formValues?.medlemskapsperioder;
    const erSisteMedlemskapsperiode =
      medlemskapsperioder[medlemskapsperioder.length - 1]?.id.toString() === schema.parent.id;

    return Utils._isEmpty(tomDato)
      ? erSisteMedlemskapsperiode && Utils._isEmpty(tomDatoFraSoknadsperiode)
      : erDatoGyldig(tomDato) &&
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
        fomDato: string().test(gyldigDatoTest).test(gyldigFomDatoTest).required(FOM_FELT_KREVES),
        tomDato: string().test(gyldigDatoTest).test(gyldigTomDatoTest).nullable(),
        bestemmelse: string(),
        innvilgelsesResultat: string().required(INNGILGELSESRESULTAT_FELT_KREVES),
        trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES),
        medlemskapstype: string(),
      })
    )
    .min(1)
    .max(2),
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
