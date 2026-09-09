import * as Types from "./types";

import { STATUS } from "../../services";
import reducer, { initialState } from "./reducers";

import MKV from "../../melosyskodeverk";

const { DK, DE } = MKV.Koder.landkoder;

interface MockAction {
  type: string;
  data?: any;
  dokument?: any;
}

describe("mottatteOpplysninger reducer", () => {
  it("setter status pending ved action.type PENDING", () => {
    const action: MockAction = {
      type: Types.PENDING,
    };
    const expectedState = {
      status: STATUS.PENDING,
      data: {},
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  it("setter status error ved action.type FEILET", () => {
    const action: MockAction = {
      type: Types.FEILET,
      data: {},
    };
    const expectedState = {
      status: STATUS.ERROR,
      data: {},
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  it("Merger state ved action.type OK", () => {
    const action: MockAction = {
      type: Types.OK,
      data: {
        data: {
          test: "testdata",
        },
      },
    };
    const expectedState = {
      status: STATUS.OK,
      data: {
        data: {
          test: "testdata",
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  it(`oppdaterer Soeknadsland ved action-type ${Types.OPPDATER_SOEKNADSLAND}`, () => {
    const action: MockAction = {
      type: Types.OPPDATER_SOEKNADSLAND,
      data: {
        soeknadsland: {
          landkoder: [],
          flereLandUkjentHvilke: true,
        },
      },
    };
    const expectedState = {
      status: initialState.status,
      data: {
        data: {
          soeknadsland: {
            landkoder: [],
            flereLandUkjentHvilke: true,
          },
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  it("Oppdaterer periode ved action.type OPPDATER_PERIODE", () => {
    (initialState.data as any).data = {
      ...(initialState.data as any).data,
      bosted: {},
    };

    const action: MockAction = {
      type: Types.OPPDATER_PERIODE,
      data: {
        periode: {
          fom: "dato1",
          tom: "dato2",
        },
      },
    };
    const expectedState = {
      status: STATUS.NOT_STARTED,
      data: {
        data: {
          periode: {
            fom: "dato1",
            tom: "dato2",
          },
          bosted: {},
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  it("Oppdaterer mottatteOpplysninger ved action.type OPPDATER_MOTTATTE_OPPLYSNINGER", () => {
    const action: MockAction = {
      type: Types.OPPDATER_MOTTATTE_OPPLYSNINGER,
      dokument: {
        inntektNorskIPerioden: "1",
        inntektUtenlandskIPerioden: "2",
        inntektNaeringIPerioden: "12345",
        inntektNaturalFribil: "4",
        inntektNaturalFribolig: "5",
        inntektNaturalIAnnet: "6",
        inntektErInnrapporteringspliktig: true,
        inntektTrygdeavgiftBlirTrukket: true,
        arbeidPaaLand: {
          fysiskeArbeidssteder: [
            {
              adresse: {
                tilleggsnavn: "Storgård",
                gatenavn: "Adresseveien 123",
                husnummerEtasjeLeilighet: "123",
                region: "Brandenburger",
                postboks: "Oslo",
                postnummer: "1234",
                poststed: "Poststedet",
                landkode: DE,
              },
              virksomhetNavn: "EQUINOR",
            },
          ],
          erHjemmekontor: false,
          erFastArbeidssted: null,
        },
        loennOgGodtgjoerelse: {
          norskArbgUtbetalerLoenn: false,
          erArbeidstakerAnsattHelePerioden: true,
          utlArbgUtbetalerLoenn: true,
          bruttoLoennPerMnd: "7000.12",
          bruttoLoennUtlandPerMnd: "14000",
          mottarNaturalytelser: true,
          samletVerdiNaturalytelser: "",
          erArbeidsgiveravgiftHelePerioden: true,
          erTrukketTrygdeavgift: false,
          utlArbTilhoererSammeKonsern: null,
        },
        arbeidssituasjonOgOevrig: {
          harLoennetArbeidMinstEnMndFoerUtsending: true,
          beskrivelseArbeidSisteMnd: "Kjøring av oppvaskmaskin, rengjøring av gulv",
          harAndreArbeidsgivereIUtsendingsperioden: true,
          beskrivelseAnnetArbeid: null,
          erSkattepliktig: null,
          mottarYtelserNorge: true,
          mottarYtelserUtlandet: false,
        },
        juridiskArbeidsgiverNorge: {
          antallAnsatte: "12345",
          antallAdmAnsatte: "12345",
          andelOmsetningINorge: "12345.50",
          andelOppdragINorge: "12345.50",
          andelRekruttertINorge: "12345.3456",
          andelKontrakterINorge: "12345.00",
          antallUtsendte: "12345",
          ekstraArbeidsgivere: [],
          erOffentligVirksomhet: true,
        },
        utenlandsoppdraget: {
          erUtsendelseForOppdragIUtlandet: true,
          erAnsattForOppdragIUtlandet: false,
          erFortsattAnsattEtterOppdraget: null,
          erDrattPaaEgetInitiativ: true,
          erErstatningTidligereUtsendte: null,
          samletUtsendingsperiode: {
            fom: "01.02.2019",
            tom: "01.02.2020",
          },
        },
        arbeidsgiverBekrefterUtsendelse: true,
        arbeidstakerAnsattUnderUtsendelsen: true,
        erstatterArbeidstakerenUtsendte: true,
        arbeidstakerTidligereUtsendt24Mnd: true,
        arbeidsgiverBetalerArbeidsgiveravgift: true,
        trygdeavgiftTrukketGjennomSkatt: true,
        trygdeavgiftTrukketGjennomSkattDato: "11.11.11",
        oppholdUtlandFom: "11.11.11",
        oppholdUtlandTom: "11.11.11",
        oppholdsland: [],
        ektefelleEllerBarnINorge: "test",
        studentSemester: "test",
        studentFinansieringKode: "test",
        arbeidsforholdUtland: [
          {
            uuid: "12ff23dc4",
            navn: "Abcdef",
            orgnr: "123456789",
            selvstendigNaeringsvirksomhet: false,
            adresse: {
              tilleggsnavn: null,
              gatenavn: null,
              husnummerEtasjeLeilighet: null,
              region: null,
              postboks: null,
              postnummer: null,
              poststed: null,
              landkode: null,
            },
          },
        ],
        selvstendigNaeringsvirksomhetUtland: [
          {
            uuid: "12ff23dc4",
            navn: "fedcba",
            orgnr: "123456789",
            selvstendigNaeringsvirksomhet: true,
            adresse: {
              tilleggsnavn: null,
              gatenavn: null,
              husnummerEtasjeLeilighet: null,
              region: null,
              postboks: null,
              postnummer: null,
              poststed: null,
              landkode: null,
            },
          },
        ],
        intensjonOmRetur: true,
        antallMaanederINorge: 11,
        oppgittAdresseTilleggsnavn: "Storgård",
        oppgittAdresseGatenavn: "12345",
        oppgittAdresseHusnummerEtasjeLeilighet: "12345",
        oppgittAdresseRegion: "12345",
        oppgittAdressePostboks: "Oslo",
        oppgittAdressePostnummer: "12345",
        oppgittAdressePoststed: "12345",
        oppgittAdresseLand: "12345",
        arbeidsstedOffshore: [
          {
            enhetNavn: "12345",
            fartsomradeKode: null,
            flaggLandkode: null,
            innretningLandkode: "12345",
            territorialfarvann: null,
            innretningstype: "PLATTFORM",
          },
        ],
        arbeidsstedSkip: [
          {
            enhetNavn: "12345",
            fartsomradeKode: "12345",
            flaggLandkode: "12345",
            innretningLandkode: null,
            territorialfarvann: "12345",
            innretningstype: null,
            yrke: "Kaptein",
          },
        ],
        arbeidsstedFly: [
          {
            hjemmebaseNavn: "Gardermoen",
            hjemmebaseLand: MKV.Koder.landkoder.NO,
            typeFlyvninger: MKV.Koder.flyvningstyper.NASJONAL,
          },
        ],
        representantIUtlandet: {
          representantNavn: "Representant I Danmark",
          adresselinjer: ["Adresselinje 1", "Adresselinje 2"],
        },
        soknadsland: {
          landkoder: [DK],
          flereLandUkjentHvilke: true,
        },
        soknadsperiodeFom: "11.11.11",
        soknadsperiodeTom: "11.11.11",
        erSelvstendig: true,
        selvstendigForetak: [
          {
            orgnr: "12345",
            fortsetterEtterArbeidIUtlandet: true,
          },
        ],
        medfolgendeBarn: [
          {
            uuid: "2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d",
            fnr: "31031779459",
            navn: "BRÅKETE GYNGEHEST",
            relasjonsrolle: "BARN",
          },
        ],
        medfolgendeEktefelleSamboer: [
          {
            uuid: "416c97d5-fd1d-4eff-952c-edc42aeb40a0",
            fnr: "08029828362",
            navn: "UTVIKLER OPTIMISTISK",
            relasjonsrolle: "EKTEFELLE_SAMBOER",
          },
        ],
        overgangsregelbestemmelser: [
          {
            kode: "FO_1408_1971_ART14_2_A",
            term: "Rfo. 1408/1971 artikkel 14 nr. 2 bokstav a",
          },
        ],
        trygdedekning: "Full dekning",
      },
    };

    const expectedState = {
      status: STATUS.NOT_STARTED,
      data: {
        data: {
          loennOgGodtgjoerelse: {
            norskArbgUtbetalerLoenn: false,
            erArbeidstakerAnsattHelePerioden: true,
            utlArbgUtbetalerLoenn: true,
            bruttoLoennPerMnd: 7000.12,
            bruttoLoennUtlandPerMnd: 14000,
            mottarNaturalytelser: true,
            samletVerdiNaturalytelser: null,
            erArbeidsgiveravgiftHelePerioden: true,
            erTrukketTrygdeavgift: false,
            utlArbTilhoererSammeKonsern: null,
          },
          utenlandsoppdraget: {
            erUtsendelseForOppdragIUtlandet: true,
            erAnsattForOppdragIUtlandet: false,
            erFortsattAnsattEtterOppdraget: null,
            erDrattPaaEgetInitiativ: true,
            erErstatningTidligereUtsendte: null,
            samletUtsendingsperiode: {
              fom: "2019-02-01",
              tom: "2020-02-01",
            },
          },
          arbeidPaaLand: {
            fysiskeArbeidssteder: [
              {
                adresse: {
                  tilleggsnavn: "Storgård",
                  gatenavn: "Adresseveien 123",
                  husnummerEtasjeLeilighet: "123",
                  region: "Brandenburger",
                  postboks: "Oslo",
                  postnummer: "1234",
                  poststed: "Poststedet",
                  landkode: DE,
                },
                virksomhetNavn: "EQUINOR",
              },
            ],
            erHjemmekontor: false,
            erFastArbeidssted: null,
          },
          juridiskArbeidsgiverNorge: {
            antallAnsatte: 12345,
            antallAdmAnsatte: 12345,
            andelOmsetningINorge: 12345.5,
            andelOppdragINorge: 12345.5,
            andelRekruttertINorge: 12345.3456,
            andelKontrakterINorge: 12345,
            antallUtsendte: 12345,
            ekstraArbeidsgivere: [],
            erOffentligVirksomhet: true,
          },
          arbeidssituasjonOgOevrig: {
            harLoennetArbeidMinstEnMndFoerUtsending: true,
            beskrivelseArbeidSisteMnd: "Kjøring av oppvaskmaskin, rengjøring av gulv",
            harAndreArbeidsgivereIUtsendingsperioden: true,
            beskrivelseAnnetArbeid: null,
            erSkattepliktig: null,
            mottarYtelserNorge: true,
            mottarYtelserUtlandet: false,
          },
          arbeidsgiversBekreftelse: {
            arbeidsgiverBekrefterUtsendelse: true,
            arbeidstakerAnsattUnderUtsendelsen: true,
            erstatterArbeidstakerenUtsendte: true,
            arbeidstakerTidligereUtsendt24Mnd: true,
            arbeidsgiverBetalerArbeidsgiveravgift: true,
            trygdeavgiftTrukketGjennomSkatt: true,
            trygdeavgiftTrukketGjennomSkattDato: "2011-11-11",
          },
          oppholdUtland: {
            oppholdsPeriode: {
              fom: "2011-11-11",
              tom: "2011-11-11",
            },
            oppholdslandkoder: [],
            ektefelleEllerBarnINorge: null,
            studentSemester: null,
            studentFinansieringKode: null,
          },
          foretakUtland: [
            {
              uuid: "12ff23dc4",
              navn: "Abcdef",
              orgnr: "123456789",
              selvstendigNaeringsvirksomhet: false,
              adresse: {
                tilleggsnavn: null,
                gatenavn: null,
                husnummerEtasjeLeilighet: null,
                region: null,
                postboks: null,
                postnummer: null,
                poststed: null,
                landkode: null,
              },
            },
            {
              uuid: "12ff23dc4",
              navn: "fedcba",
              orgnr: "123456789",
              selvstendigNaeringsvirksomhet: true,
              adresse: {
                tilleggsnavn: null,
                gatenavn: null,
                husnummerEtasjeLeilighet: null,
                region: null,
                postboks: null,
                postnummer: null,
                poststed: null,
                landkode: null,
              },
            },
          ],
          bosted: {
            intensjonOmRetur: null,
            antallMaanederINorge: 11,
            oppgittAdresse: {
              tilleggsnavn: "Storgård",
              gatenavn: "12345",
              husnummerEtasjeLeilighet: "12345",
              region: "12345",
              postboks: "Oslo",
              postnummer: "12345",
              poststed: "12345",
              landkode: "12345",
            },
          },
          maritimtArbeid: [
            {
              enhetNavn: "12345",
              fartsomradeKode: null,
              flaggLandkode: null,
              innretningLandkode: "12345",
              territorialfarvann: null,
              innretningstype: "PLATTFORM",
            },
            {
              enhetNavn: "12345",
              fartsomradeKode: "12345",
              flaggLandkode: "12345",
              innretningLandkode: null,
              territorialfarvann: "12345",
              innretningstype: null,
              yrke: "Kaptein",
            },
          ],
          luftfartBaser: [
            {
              hjemmebaseNavn: "Gardermoen",
              hjemmebaseLand: MKV.Koder.landkoder.NO,
              typeFlyvninger: MKV.Koder.flyvningstyper.NASJONAL,
            },
          ],
          soeknadsland: {
            landkoder: [DK],
            flereLandUkjentHvilke: true,
          },
          periode: {
            fom: "2011-11-11",
            tom: "2011-11-11",
          },
          representantIUtlandet: {
            representantNavn: "Representant I Danmark",
            adresselinjer: ["Adresselinje 1", "Adresselinje 2"],
            representantLand: "DK",
          },
          selvstendigArbeid: {
            erSelvstendig: true,
            selvstendigForetak: [
              {
                orgnr: "12345",
                fortsetterEtterArbeidIUtlandet: true,
              },
            ],
          },
          personOpplysninger: {
            medfolgendeFamilie: [
              {
                uuid: "2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d",
                fnr: "31031779459",
                navn: "BRÅKETE GYNGEHEST",
                relasjonsrolle: "BARN",
              },
              {
                uuid: "416c97d5-fd1d-4eff-952c-edc42aeb40a0",
                fnr: "08029828362",
                navn: "UTVIKLER OPTIMISTISK",
                relasjonsrolle: "EKTEFELLE_SAMBOER",
              },
            ],
          },
          overgangsregelbestemmelser: [
            {
              kode: "FO_1408_1971_ART14_2_A",
              term: "Rfo. 1408/1971 artikkel 14 nr. 2 bokstav a",
            },
          ],
          ytterligereInformasjon: undefined,
          trygdedekning: "Full dekning",
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });
});
