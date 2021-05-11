import { object, array, string, lazy, mixed } from "yup";

import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import MKV, { Utils as MKVUtils } from "../../melosyskodeverk";

const { TIDLIGERE_ENN_FOM, SENERE_ENN_TOM, SKRIV_INN_GYLDIG_DATO, MAA_FYLLES_UT } = KV.Feilmeldinger;

const lagMelding = (panel, undertittel, melding) => ({
  panel,
  undertittel,
  melding,
});

const erIkkeBeslutningLovvalgAnnetLand = (behandlingstema) =>
  behandlingstema !== MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND;

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

const medfolgendeBarn = object().shape({
  fnr: lazy((value) =>
    value
      ? string().erFnrEllerDnr(
          lagMelding(
            KV.Menypunkter.Familieforhold.tittel,
            KV.Menypunkter.Familieforhold.undertitler.barnMedPaReisen,
            "F.nr./d-nr. er ugyldig"
          )
        )
      : mixed()
  ),
});

const soknad = object().when("$behandlingstema", {
  is: erIkkeBeslutningLovvalgAnnetLand,
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
    oppgittAdresseGatenavn: string()
      .nullable()
      .when("$skalOppgittAdresseValideres", {
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
    soknadsperiodeFom: string().erGyldigDato().required(MAA_FYLLES_UT),
    soknadsperiodeTom: string()
      .erGyldigDato()
      .erEtterDatofelt("soknadsperiodeFom")
      .when("$behandlingstema", {
        is: MKVUtils.erUtsendt,
        then: string().required(MAA_FYLLES_UT),
      })
      .nullable(),
    utenlandskIdent: array().of(utenlandskIdent),
    medfolgendeBarn: array().of(medfolgendeBarn),
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
  }),
});

export default soknad;
