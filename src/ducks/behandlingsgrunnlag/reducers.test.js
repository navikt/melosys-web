import * as Types from './types';

import { STATUS } from '../../services/utils';
import reducer, { initialState } from './reducers';

import MKV from '../../melosyskodeverk';

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
      },
    };
    const expectedState = {
      status: STATUS.OK,
      data: {
        data: {
          test: 'testdata',
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
        antallAdmAnsatte: '12345',
        andelOmsetningINorge: '12345',
        andelOppdragINorge: '12345',
        andelRekruttertINorge: '12345',
        andelKontrakterINorge: '12345',
        antallUtsendte: 12345,
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
        arbeidsforholdUtland: [
          {
            uuid: '12ff23dc4',
            navn: 'Abcdef',
            orgnr: '123456789',
            selvstendigNaeringsvirksomhet: false,
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
        selvstendigNaeringsvirksomhetUtland: [
          {
            uuid: '12ff23dc4',
            navn: 'fedcba',
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
        arbeidsstedOffshore: [
          {
            enhetNavn: '12345',
            fartsomradeKode: null,
            flaggLandkode: null,
            installasjonsLandkode: '12345',
            territorialfarvann: null,
            foretakNavn: '12345',
            foretakOrgnr: '12345',
          },
        ],
        arbeidsstedSkip: [
          {
            enhetNavn: '12345',
            fartsomradeKode: '12345',
            flaggLandkode: '12345',
            installasjonsLandkode: null,
            territorialfarvann: '12345',
            foretakNavn: '12345',
            foretakOrgnr: '12345',
          },
        ],
        arbeidsstedFly: [
          {
            hjemmebaseNavn: 'Gardermoen',
            hjemmebaseLand: MKV.Koder.landkoder.NO,
            typeFlyvninger: MKV.Koder.flyvningstyper.NASJONAL,
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
        medfolgendeBarn: [
          {
            fnr: '31031779459',
            navn: 'BRÅKETE GYNGEHEST',
            relasjonsrolle: 'BARN',
          },
        ],
        overgangsregelbestemmelser: [
          {
            kode: 'FO_1408_1971_ART14_2_A',
            term: 'Rfo. 1408/1971 artikkel 14 nr. 2 bokstav a',
          },
        ],
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
            antallAdmAnsatte: 12345,
            andelOmsetningINorge: 12345,
            andelOppdragINorge: 12345,
            andelRekruttertINorge: 12345,
            andelKontrakterINorge: 12345,
            antallUtsendte: 12345,
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
              selvstendigNaeringsvirksomhet: false,
              adresse: {
                gatenavn: null,
                husnummer: null,
                region: null,
                postnummer: null,
                poststed: null,
                landkode: null,
              },
            },
            {
              uuid: '12ff23dc4',
              navn: 'fedcba',
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
              fartsomradeKode: null,
              flaggLandkode: null,
              installasjonsLandkode: '12345',
              territorialfarvann: null,
              foretakNavn: '12345',
              foretakOrgnr: '12345',
            },
            {
              enhetNavn: '12345',
              fartsomradeKode: '12345',
              flaggLandkode: '12345',
              installasjonsLandkode: null,
              territorialfarvann: '12345',
              foretakNavn: '12345',
              foretakOrgnr: '12345',
            },
          ],
          luftfartBaser: [
            {
              hjemmebaseNavn: 'Gardermoen',
              hjemmebaseLand: MKV.Koder.landkoder.NO,
              typeFlyvninger: MKV.Koder.flyvningstyper.NASJONAL,
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
            medfolgendeFamilie: [
              {
                fnr: '31031779459',
                navn: 'BRÅKETE GYNGEHEST',
                relasjonsrolle: 'BARN',
              },
            ],
          },
          overgangsregelbestemmelser: [
            {
              kode: 'FO_1408_1971_ART14_2_A',
              term: 'Rfo. 1408/1971 artikkel 14 nr. 2 bokstav a',
            },
          ],
          ytterligereInformasjon: null,
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(expectedState);
  });
});
