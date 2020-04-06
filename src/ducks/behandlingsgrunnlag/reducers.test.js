import * as Types from './types';

import { STATUS } from '../../services/utils';
import reducer, { initialState } from './reducers';

describe('behandlingsgrunnlag reducer', () => {
  it('setter status pending ved action.type PENDING', () => {
    const action = {
      type: Types.PENDING,
    };
    const expectedState = {
      status: STATUS.PENDING,
      data: {},
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  it('setter status error ved action.type FEILET', () => {
    const action = {
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

  it('Merger state ved action.type OK', () => {
    const action = {
      type: Types.OK,
      data: {
        data: {
          test: 'testdata',
        },
        tilleggsData: {
          testtest: 'testtest',
        },
      },
    };
    const expectedState = {
      status: STATUS.OK,
      data: {
        data: {
          test: 'testdata',
        },
        tilleggsData: {
          testtest: 'testtest',
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  it('Oppdaterer periode ved action.type OPPDATER_PERIODE', () => {
    initialState.data.data = {
      ...initialState.data.data,
      bosted: {},
    };

    const action = {
      type: Types.OPPDATER_PERIODE,
      data: {
        periode: {
          fom: 'dato1',
          tom: 'dato2',
        },
      },
    };
    const expectedState = {
      status: STATUS.NOT_STARTED,
      data: {
        data: {
          periode: {
            fom: 'dato1',
            tom: 'dato2',
          },
          bosted: {},
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });

  it('Oppdaterer behandlingsgrunnlag ved action.type OPPDATER_BEHANDLINGSGRUNNLAG', () => {
    initialState.data = {
      ...initialState.data,
      data: {
        arbeidNorge: {
          arbeidsforholdOpprettholdIHelePerioden: true,
          arbeidsforholdVikarNavn: 'Vikarbyrået AS',
          vikarOrgnr: '22334455',
          flyendePersonellHjemmebase: 'Flybasen Int. Airport, ....',
          kontaktNavn: 'Ola Nordmann',
          kontaktEpost: 'ola.nordmann@fullmektigfirma.no',
        },
      },
    };

    const action = {
      type: Types.OPPDATER_BEHANDLINGSGRUNNLAG,
      dokument: {
        inntektNorskIPerioden: '1',
        inntektUtenlandskIPerioden: '2',
        inntektNaeringIPerioden: '12345',
        inntektNaturalFribil: '4',
        inntektNaturalFribolig: '5',
        inntektNaturalIAnnet: '6',
        inntektErInnrapporteringspliktig: true,
        inntektTrygdeavgiftBlirTrukket: true,
        fullmektigFirma: 'test',
        fullmektigGateadresse: 'test',
        fullmektigPostnr: 'test',
        fullmektigPoststed: 'test',
        fullmektigRegion: 'test',
        fullmektigLand: 'test',
        arbeidUtland: [
          {
            adresse: {
              gatenavn: 'test',
              husnummer: 'test',
              landkode: 'NO',
              postnummer: 'test',
              poststed: 'test',
              region: 'test',
            },
            foretakNavn: 'test',
            foretakOrgnr: '12345',
            arbeidUtlandHjemmekontor: true,
          },
        ],
        antallAnsatte: '12345',
        utsendteNeste12Mnd: '12345',
        antallAdmAnsatte: '12345',
        andelOmsetningINorge: '12345',
        andelOppdragINorge: '12345',
        andelKontrakterINorge: '12345',
        arbeidstakereRekruttertILand: 'DE',
        oppdragsKontrakterIHovedsakInngaattILand: null,
        ekstraArbeidsgivere: [],
        arbeidsgiverBekrefterUtsendelse: true,
        arbeidstakerAnsattUnderUtsendelsen: true,
        erstatterArbeidstakerenUtsendte: true,
        arbeidstakerTidligereUtsendt24Mnd: true,
        arbeidsgiverBetalerArbeidsgiveravgift: true,
        trygdeavgiftTrukketGjennomSkatt: true,
        trygdeavgiftTrukketGjennomSkattDato: '11.11.11',
        oppholdUtlandFom: '11.11.11',
        oppholdUtlandTom: '11.11.11',
        oppholdsland: [],
        ektefelleEllerBarnINorge: 'test',
        studentSemester: 'test',
        studentFinansieringKode: 'test',
        foretakUtland: [
          {
            uuid: '12ff23dc4',
            navn: 'Abcdef',
            orgnr: '123456789',
            selvstendigNaeringsvirksomhet: true,
            adresse: {
              gatenavn: null,
              husnummer: null,
              region: null,
              postnummer: null,
              poststed: null,
              landkode: null,
            },
          },
        ],
        intensjonOmRetur: true,
        antallMaanederINorge: 11,
        EOSBarnetrygdFraNAV: true,
        oppgittAdresseGatenavn: '12345',
        oppgittAdresseHusnummer: '12345',
        oppgittAdresseRegion: '12345',
        oppgittAdressePostnummer: '12345',
        oppgittAdressePoststed: '12345',
        oppgittAdresseLand: '12345',
        maritimtArbeid: [
          {
            enhetNavn: '12345',
            fartsomradeKode: '12345',
            flaggLandkode: '12345',
            installasjonsLandkode: '12345',
            territorialfarvann: '12345',
            foretakNavn: '12345',
            foretakOrgnr: '12345',
          },
        ],
        soknadsland: [],
        soknadsperiodeFom: '11.11.11',
        soknadsperiodeTom: '11.11.11',
        erSelvstendig: true,
        selvstendigForetak: [
          {
            orgnr: '12345',
            fortsetterEtterArbeidIUtlandet: true,
          },
        ],
        utenlandskIdent: '12345',
        medfolgendeFamilie: null,
        medfolgendeAndre: true,
        overgangsregelbestemmelser: [
          {
            kode: 'FO_1408_1971_ART14_2_A',
            term: 'Rfo. 1408/1971 artikkel 14 nr. 2 bokstav a',
          },
        ],
        norskeArbeidsgivere: [],
        ytterligereInformasjon: 'fritekst',
      },
    };

    const expectedState = {
      status: STATUS.NOT_STARTED,
      data: {
        data: {
          arbeidsinntekt: {
            inntektNorskIPerioden: 1,
            inntektUtenlandskIPerioden: 2,
            inntektNaeringIPerioden: null,
            inntektNaturalytelser: {
              friBil: '4',
              friBolig: '5',
              friAnnet: '6',
            },
            inntektErInnrapporteringspliktig: true,
            inntektTrygdeavgiftBlirTrukket: true,
          },
          arbeidNorge: {
            arbeidsforholdOpprettholdIHelePerioden: true,
            arbeidsforholdVikarNavn: 'Vikarbyrået AS',
            vikarOrgnr: '22334455',
            flyendePersonellHjemmebase: 'Flybasen Int. Airport, ....',
            kontaktNavn: 'Ola Nordmann',
            kontaktEpost: 'ola.nordmann@fullmektigfirma.no',
            fullmektigFirma: 'test',
            fullmektigGateadresse: 'test',
            fullmektigPostnr: 'test',
            fullmektigPoststed: 'test',
            fullmektigRegion: 'test',
            fullmektigLandkode: 'test',
          },
          arbeidUtland: [
            {
              adresse: {
                gatenavn: 'test',
                husnummer: 'test',
                landkode: 'NO',
                postnummer: 'test',
                poststed: 'test',
                region: 'test',
              },
              foretakNavn: 'test',
              foretakOrgnr: '12345',
              arbeidUtlandHjemmekontor: true,
            },
          ],
          juridiskArbeidsgiverNorge: {
            antallAnsatte: 12345,
            utsendteNeste12Mnd: 12345,
            antallAdmAnsatte: 12345,
            andelOmsetningINorge: 12345,
            andelOppdragINorge: 12345,
            andelKontrakterINorge: 12345,
            arbeidstakereRekruttertILand: 'DE',
            oppdragsKontrakterIHovedsakInngaattILand: null,
            ekstraArbeidsgivere: [],
          },
          arbeidsgiversBekreftelse: {
            arbeidsgiverBekrefterUtsendelse: true,
            arbeidstakerAnsattUnderUtsendelsen: true,
            erstatterArbeidstakerenUtsendte: true,
            arbeidstakerTidligereUtsendt24Mnd: true,
            arbeidsgiverBetalerArbeidsgiveravgift: true,
            trygdeavgiftTrukketGjennomSkatt: true,
            trygdeavgiftTrukketGjennomSkattDato: '2011-11-11',
          },
          oppholdUtland: {
            oppholdsPeriode: {
              fom: '2011-11-11',
              tom: '2011-11-11',
            },
            oppholdslandkoder: [],
            ektefelleEllerBarnINorge: null,
            studentSemester: null,
            studentFinansieringKode: null,
          },
          foretakUtland: [
            {
              uuid: '12ff23dc4',
              navn: 'Abcdef',
              orgnr: '123456789',
              selvstendigNaeringsvirksomhet: true,
              adresse: {
                gatenavn: null,
                husnummer: null,
                region: null,
                postnummer: null,
                poststed: null,
                landkode: null,
              },
            },
          ],
          bosted: {
            intensjonOmRetur: null,
            antallMaanederINorge: null,
            EOSBarnetrygdFraNAV: true,
            oppgittAdresse: {
              gatenavn: '12345',
              husnummer: '12345',
              region: '12345',
              postnummer: '12345',
              poststed: '12345',
              landkode: '12345',
            },
          },
          maritimtArbeid: [
            {
              enhetNavn: '12345',
              fartsomradeKode: '12345',
              flaggLandkode: '12345',
              installasjonsLandkode: '12345',
              territorialfarvann: '12345',
              foretakNavn: '12345',
              foretakOrgnr: '12345',
            },
          ],
          soeknadsland: {
            landkoder: [],
          },
          periode: {
            fom: '2011-11-11',
            tom: '2011-11-11',
          },
          selvstendigArbeid: {
            erSelvstendig: true,
            selvstendigForetak: [
              {
                orgnr: '12345',
                fortsetterEtterArbeidIUtlandet: true,
              },
            ],
          },
          personOpplysninger: {
            utenlandskIdent: '12345',
            medfolgendeFamilie: [],
            medfolgendeAndre: null,
          },
          overgangsregelbestemmelser: [
            {
              kode: 'FO_1408_1971_ART14_2_A',
              term: 'Rfo. 1408/1971 artikkel 14 nr. 2 bokstav a',
            },
          ],
          norskeArbeidsgivere: [],
          ytterligereInformasjon: 'fritekst',
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });
});
