import { array, boolean, lazy, number, object, string } from "yup";

import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import MKV, { MKVUtils } from "../../melosyskodeverk";

const { TIDLIGERE_ENN_FOM, SENERE_ENN_TOM, SKRIV_INN_GYLDIG_DATO, MAA_FYLLES_UT } = KV.Feilmeldinger;

const lagMelding = (panel, undertittel, melding) => ({
  panel,
  undertittel,
  melding,
});

const lagAndelMellomNullOgHundreMelding = (feltbeskrivelse) =>
  lagMelding(
    KV.Menypunkter.OmVirksomhetenINorge.tittel,
    KV.Menypunkter.OmVirksomhetenINorge.undertitler.samletVirksomhetINorge,
    `Oppgi en andel ${feltbeskrivelse} som er mellom 0 og 100%`
  );
const tomStringTilNull = (value, originalValue) => (originalValue === "" ? null : value);

const skalValidereSoknad = (behandlingstema) =>
  behandlingstema !== MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND;

const skalValidereSoknadsland = (mottatteOpplysningerType) =>
  mottatteOpplysningerType !== MKV.Koder.mottatteopplysningertyper.ANMODNING_ELLER_ATTEST;

const erTrygdeavtaleSak = (sakstype) => sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE;

const erFtrlSak = (sakstype) => sakstype === MKV.Koder.sakstyper.FTRL;

const erTrygdeavtaleEllerFtrl = (sakstype) => erTrygdeavtaleSak(sakstype) || erFtrlSak(sakstype);

const erAltinnsøknad = (mottatteOpplysningerType) =>
  mottatteOpplysningerType === MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;

const hentSoknadsperiodeMeldingtekst = (mottatteOpplysningerType) => {
  const menypunkt = erAltinnsøknad(mottatteOpplysningerType)
    ? KV.Menypunkter.Utenlandsoppdraget.tittel
    : KV.Menypunkter.Periode.tittel;
  const periodeUndertittel = erAltinnsøknad(mottatteOpplysningerType)
    ? KV.Menypunkter.Utenlandsoppdraget.undertitler.periode
    : KV.Menypunkter.Periode.undertitler.periode;

  return { menypunkt, periodeUndertittel };
};

const soknadsperiodeFomSchema = string().when("$mottatteOpplysningerType", (mottatteOpplysningerType) => {
  const { menypunkt, periodeUndertittel } = hentSoknadsperiodeMeldingtekst(mottatteOpplysningerType);

  return string()
    .erGyldigDato(lagMelding(menypunkt, periodeUndertittel, SKRIV_INN_GYLDIG_DATO.melding))
    .required(lagMelding(menypunkt, periodeUndertittel, MAA_FYLLES_UT.melding));
});

const soknadsperiodeTomSchema = string().when("$mottatteOpplysningerType", (mottatteOpplysningerType) => {
  const { menypunkt, periodeUndertittel } = hentSoknadsperiodeMeldingtekst(mottatteOpplysningerType);

  return string()
    .erGyldigDato(lagMelding(menypunkt, periodeUndertittel, SKRIV_INN_GYLDIG_DATO.melding))
    .erEtterDatofelt("soknadsperiodeFom", lagMelding(menypunkt, periodeUndertittel, TIDLIGERE_ENN_FOM.melding))
    .when("$behandlingstema", {
      is: MKVUtils.erUtsendt,
      then: string().required(lagMelding(menypunkt, periodeUndertittel, MAA_FYLLES_UT.melding)),
    })
    .nullable();
});

const utenlandskIdent = object().shape({
  ident: string()
    .nullable()
    .required(
      lagMelding(KV.Menypunkter.Person.tittel, KV.Menypunkter.Person.undertitler.utenlandskID, "Utenlandsk ID kreves")
    ),
  landkode: string()
    .nullable()
    .required(
      lagMelding(
        KV.Menypunkter.Person.tittel,
        KV.Menypunkter.Person.undertitler.utenlandskID,
        "Land for utenlandsk ID kreves"
      )
    ),
});

const erFoerTomTest = {
  name: "erFoerTom",
  message: lagMelding(
    KV.Menypunkter.Utenlandsoppdraget.tittel,
    KV.Menypunkter.Utenlandsoppdraget.undertitler.tilleggsopplysninger,
    SENERE_ENN_TOM.melding
  ),
  test: (value, { options }) =>
    Utils.dato.datoDiffPure(
      Utils.dato.formatterDatoTilISO(value),
      Utils.dato.formatterDatoTilISO(options.parent.tom),
      "days"
    ) <= 0,
};

const erEtterFomTest = {
  name: "erEtterFom",
  message: lagMelding(
    KV.Menypunkter.Utenlandsoppdraget.tittel,
    KV.Menypunkter.Utenlandsoppdraget.undertitler.tilleggsopplysninger,
    TIDLIGERE_ENN_FOM.melding
  ),
  test: (value, { options }) =>
    Utils.dato.datoDiffPure(
      Utils.dato.formatterDatoTilISO(value),
      Utils.dato.formatterDatoTilISO(options.parent.fom),
      "days"
    ) >= 0,
};

const medfolgendeFamilie = object().shape({
  fnr: lazy((value, options) =>
    string()
      .erFnrEllerDnrEllerFødselsdato(
        lagMelding(
          KV.Menypunkter.Familieforhold.tittel,
          erTrygdeavtaleEllerFtrl(options.context.sakstype)
            ? KV.Menypunkter.Familieforhold.undertitler.familieMedPaReisen
            : KV.Menypunkter.Familieforhold.undertitler.barnMedPaReisen,
          "F.nr./d-nr./dato er ugyldig"
        )
      )
      .required(MAA_FYLLES_UT)
  ),
  navn: string()
    .when("fnr", {
      is: (fnr) => Boolean(Utils.dato.vaskInputDato(fnr)),
      then: string().required(MAA_FYLLES_UT),
    })
    .nullable(),
});

const foedestedOgLandSchema = object()
  .nullable()
  .shape({
    foedested: string()
      .required(
        lagMelding(KV.Menypunkter.Person.tittel, KV.Menypunkter.Person.undertitler.foedestedOgLand, "Fødested kreves")
      )
      .erIkkeBlank(
        lagMelding(KV.Menypunkter.Person.tittel, KV.Menypunkter.Person.undertitler.foedestedOgLand, "Fødested kreves")
      ),
    foedeland: string().required(
      lagMelding(KV.Menypunkter.Person.tittel, KV.Menypunkter.Person.undertitler.foedestedOgLand, "Fødeland kreves")
    ),
  });

const soknad = object().when(["$behandlingstema"], {
  is: skalValidereSoknad,
  then: object().shape({
    arbeidsforholdUtland: array().of(
      object().shape({
        navn: string()
          .nullable()
          .required(
            lagMelding(
              KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
              KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdIUtlandet,
              "Navn kreves"
            )
          ),
        orgnr: string()
          .nullable()
          .max(
            25,
            lagMelding(
              KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
              KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdIUtlandet,
              "Registreringsnummer kan ikke være lenger enn 25 tegn"
            )
          ),
      })
    ),
    selvstendigNaeringsvirksomhetUtland: array().of(
      object().shape({
        navn: string()
          .nullable()
          .required(
            lagMelding(
              KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
              KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet,
              "Navn kreves"
            )
          ),
        orgnr: string()
          .nullable()
          .max(
            25,
            lagMelding(
              KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
              KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet,
              "Registreringsnummer kan ikke være lenger enn 25 tegn"
            )
          ),
      })
    ),
    arbeidsstedOffshore: array().of(
      object()
        .shape({
          enhetNavn: string()
            .nullable()
            .required(
              lagMelding(
                KV.Menypunkter.Arbeidssteder.tittel,
                KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedOffshore,
                "Navn kreves"
              )
            ),
        })
        .uniqueProperty(
          "enhetNavn",
          lagMelding(
            KV.Menypunkter.Arbeidssteder.tittel,
            KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedOffshore,
            "Navn på enhet må være unikt"
          )
        )
    ),
    arbeidsstedSkip: array().of(
      object()
        .shape({
          enhetNavn: string()
            .nullable()
            .required(
              lagMelding(
                KV.Menypunkter.Arbeidssteder.tittel,
                KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedSkip,
                "Navn kreves"
              )
            ),
        })
        .uniqueProperty(
          "enhetNavn",
          lagMelding(
            KV.Menypunkter.Arbeidssteder.tittel,
            KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedSkip,
            "Navn på enhet må være unikt"
          )
        )
    ),
    representantIUtlandet: object()
      .when("$sakstype", {
        is: erTrygdeavtaleSak,
        then: object()
          .shape({
            representantNavn: string()
              .required(
                lagMelding(
                  KV.Menypunkter.Arbeidssteder.tittel,
                  KV.Menypunkter.Arbeidssteder.undertitler.representantIUtlandet,
                  "Navn kreves"
                )
              )
              .nullable(),
            adresselinjer: array().of(string()).nullable(),
          })
          .nullable(),
      })
      .nullable(),
    oppgittAdresseGatenavn: string()
      .nullable()
      .when("$skalOppgittAdresseGateadresseValideres", {
        is: true,
        then: string()
          .nullable()
          .required(
            lagMelding(KV.Menypunkter.Person.tittel, KV.Menypunkter.Person.undertitler.annenAdresse, "Gatenavn kreves")
          ),
      }),
    oppgittAdressePostnummer: string()
      .nullable()
      .when("$skalOppgittAdresseValideres", {
        is: true,
        then: string()
          .nullable()
          .required(
            lagMelding(
              KV.Menypunkter.Person.tittel,
              KV.Menypunkter.Person.undertitler.annenAdresse,
              "Postnummer kreves"
            )
          ),
      }),
    oppgittAdressePoststed: string()
      .nullable()
      .when("$skalOppgittAdresseValideres", {
        is: true,
        then: string()
          .nullable()
          .required(
            lagMelding(KV.Menypunkter.Person.tittel, KV.Menypunkter.Person.undertitler.annenAdresse, "Poststed kreves")
          ),
      }),
    oppgittAdresseLand: string()
      .nullable()
      .when("$skalOppgittAdresseValideres", {
        is: true,
        then: string()
          .nullable()
          .required(
            lagMelding(KV.Menypunkter.Person.tittel, KV.Menypunkter.Person.undertitler.annenAdresse, "Land kreves")
          ),
      }),
    soknadsperiodeFom: soknadsperiodeFomSchema,
    soknadsperiodeTom: soknadsperiodeTomSchema,
    utenlandskIdent: array().of(utenlandskIdent),
    medfolgendeBarn: array().of(medfolgendeFamilie),
    medfolgendeEktefelleSamboer: array().of(medfolgendeFamilie),
    foedestedOgLand: foedestedOgLandSchema,
    juridiskArbeidsgiverNorge: object().shape({
      antallAnsatte: number().transform(tomStringTilNull).nullable(),
      antallAdmAnsatte: number().transform(tomStringTilNull).nullable(),
      antallUtsendte: number().transform(tomStringTilNull).nullable(),
      andelRekruttertINorge: number()
        .min(0, lagAndelMellomNullOgHundreMelding("ansatte rekruttert i Norge"))
        .max(100, lagAndelMellomNullOgHundreMelding("ansatte rekruttert i Norge"))
        .transform(tomStringTilNull)
        .nullable(),
      andelOmsetningINorge: number()
        .min(0, lagAndelMellomNullOgHundreMelding("omsetning opptjent i Norge"))
        .max(100, lagAndelMellomNullOgHundreMelding("omsetning opptjent i Norge"))
        .transform(tomStringTilNull)
        .nullable(),
      andelKontrakterINorge: number()
        .min(0, lagAndelMellomNullOgHundreMelding("oppdragskontrakter inngått i Norge"))
        .max(100, lagAndelMellomNullOgHundreMelding("oppdragskontrakter inngått i Norge"))
        .transform(tomStringTilNull)
        .nullable(),
      andelOppdragINorge: number()
        .min(0, lagAndelMellomNullOgHundreMelding("oppdrag utført i Norge"))
        .max(100, lagAndelMellomNullOgHundreMelding("oppdrag utført i Norge"))
        .transform(tomStringTilNull)
        .nullable(),
    }),
    utenlandsoppdraget: object().shape({
      samletUtsendingsperiode: object().shape({
        fom: string()
          .nullable()
          .test(erFoerTomTest)
          .erGyldigDato(
            lagMelding(
              KV.Menypunkter.Utenlandsoppdraget.tittel,
              KV.Menypunkter.Utenlandsoppdraget.undertitler.tilleggsopplysninger,
              SKRIV_INN_GYLDIG_DATO.melding
            )
          ),
        tom: string()
          .nullable()
          .test(erEtterFomTest)
          .erGyldigDato(
            lagMelding(
              KV.Menypunkter.Utenlandsoppdraget.tittel,
              KV.Menypunkter.Utenlandsoppdraget.undertitler.tilleggsopplysninger,
              SKRIV_INN_GYLDIG_DATO.melding
            )
          ),
      }),
    }),
    soknadsland: object().when("$mottatteOpplysningerType", {
      is: skalValidereSoknadsland,
      then: object().shape({
        landkoder: array().when("erUkjenteEllerAlleEosLand", {
          is: (erUkjenteEllerAlleEosLand) => !erUkjenteEllerAlleEosLand,
          then: array().when("$behandlingstema", {
            is: MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
            then: array().min(
              2,
              lagMelding(
                KV.Menypunkter.Utenlandsoppdraget.tittel,
                KV.Menypunkter.Utenlandsoppdraget.undertitler.land,
                "Det er påkrevd med to eller flere land for dette behandlingstemaet"
              )
            ),
            otherwise: array().min(
              1,
              lagMelding(
                KV.Menypunkter.Utenlandsoppdraget.tittel,
                KV.Menypunkter.Utenlandsoppdraget.undertitler.land,
                "Oppgi minst ett søknadsland"
              )
            ),
          }),
        }),
        erUkjenteEllerAlleEosLand: boolean(),
      }),
      otherwise: object().nullable(),
    }),
  }),
});

export default soknad;
