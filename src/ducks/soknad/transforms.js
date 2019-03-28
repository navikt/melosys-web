import { strengTilInt } from '../../utils/streng';
// import * as Utils from '../../utils';
import { formatterDatoTilISO } from '../../utils/dato';
import { STATUS } from '../../services/utils';

const merge = (state, soknad) => ({ ...state, data: { ...state.data, soeknadDokument: soknad } });

export const oppdaterOK = (state, action) => {
  const soknadData = action.data;
  const { behandlingID, soeknadDokument } = soknadData;

  return {
    ...state,
    status: STATUS.OK,
    data: {
      behandlingID,
      soeknadDokument,
    },
  };
};

export const oppdaterPeriode = (state, action) => {
  const { oppholdsPeriode } = action.data;

  const soknad = {
    ...state.data.soeknadDokument,
    oppholdUtland: {
      ...state.data.soeknadDokument.oppholdUtland,
      oppholdsPeriode: {
        fom: oppholdsPeriode.fom,
        tom: oppholdsPeriode.tom,
      },
    },
  };

  return merge(state, soknad);
};

const arbeidsInntekt = (state, action) => {
  const { dokument } = action;

  const inntektNorskIPerioden = strengTilInt(dokument.inntektNorskIPerioden);
  const inntektUtenlandskIPerioden = strengTilInt(dokument.inntektUtenlandskIPerioden);
  const inntektNaeringIPerioden = strengTilInt(dokument.inntektNaeringIPerioden);
  return {
    ...state.data.soeknadDokument.arbeidsinntekt,
    inntektNorskIPerioden,
    inntektUtenlandskIPerioden,
    inntektNaeringIPerioden,
  };
};
const arbeidNorge = (state, action) => {
  const { dokument } = action;
  const {
    fullmektigFirma, fullmektigGateadresse, fullmektigPostnr, fullmektigPoststed, fullmektigRegion, fullmektigLand,
  } = dokument;
  return {
    ...state.data.soeknadDokument.arbeidNorge,
    fullmektigFirma,
    fullmektigGateadresse,
    fullmektigPostnr,
    fullmektigPoststed,
    fullmektigRegion,
    fullmektigLand,
  };
};

const juridiskArbeidsgiverNorge = dokument => {
  const {
    antallAnsatte, utsendteNeste12Mnd, antallAdmAnsatte, andelOmsetningINorge, andelOppdragINorge, andelKontrakterINorge,
    arbeidstakereRekruttertILand, oppdragsKontrakterIHovedsakInngaattILand, ekstraArbeidsgivere,
  } = dokument;
  return {
    antallAnsatte,
    utsendteNeste12Mnd,
    antallAdmAnsatte,
    andelOmsetningINorge,
    andelOppdragINorge,
    andelKontrakterINorge,
    arbeidstakereRekruttertILand: arbeidstakereRekruttertILand || null,
    oppdragsKontrakterIHovedsakInngaattILand: oppdragsKontrakterIHovedsakInngaattILand || null,
    ekstraArbeidsgivere: ekstraArbeidsgivere || [],
  };
};
// TODO; Refactor, wrt https://redux.js.org/recipes/structuring-reducers/refactoring-reducer-example
// Continue splitting slices
export const oppdaterSoknad = (state, action) => {
  const { dokument } = action;

  const soknad = {
    ...state.data.soeknadDokument,
    arbeidsinntekt: arbeidsInntekt(state, action),
    arbeidNorge: arbeidNorge(state, action),
    arbeidUtland: dokument.arbeidUtland,
    juridiskArbeidsgiverNorge: juridiskArbeidsgiverNorge(dokument),
    arbeidsgiversBekreftelse: {
      ...state.data.soeknadDokument.arbeidsgiversBekreftelse,
      arbeidsgiverBekrefterUtsendelse: dokument.arbeidsgiverBekrefterUtsendelse,
      arbeidstakerAnsattUnderUtsendelsen: dokument.arbeidstakerAnsattUnderUtsendelsen,
      erstatterArbeidstakerenUtsendte: dokument.erstatterArbeidstakerenUtsendte,
      arbeidstakerTidligereUtsendt24Mnd: dokument.arbeidstakerTidligereUtsendt24Mnd,
      arbeidsgiverBetalerArbeidsgiveravgift: dokument.arbeidsgiverBetalerArbeidsgiveravgift,
      trygdeavgiftTrukketGjennomSkatt: dokument.trygdeavgiftTrukketGjennomSkatt,
      trygdeavgiftTrukketGjennomSkattDato: dokument.trygdeavgiftTrukketGjennomSkattDato ? formatterDatoTilISO(dokument.trygdeavgiftTrukketGjennomSkattDato) : null,
    },
    oppholdUtland: {
      ...state.data.soeknadDokument.oppholdUtland,
      oppholdsPeriode: {
        fom: formatterDatoTilISO(dokument.oppholdUtlandFom),
        tom: formatterDatoTilISO(dokument.oppholdUtlandTom),
      },
      oppholdslandKoder: dokument.oppholdsland,
      sammeAdresseSomArbeidsgiver: dokument.sammeAdresseSomArbeidsgiver,
      ektefelleEllerBarnINorge: null,
      forutgaendeBostedINorge: dokument.forutgaendeBostedINorge,
      studentSemester: null,
      studentFinansieringKode: null,
    },
    foretakUtland: dokument.foretakUtland.filter(foretakUtland => (
      foretakUtland.navn
      && foretakUtland.orgnr
      && foretakUtland.adresse
    )),
    bosted: {
      intensjonOmRetur: null,
      familiesBostedLandKode: dokument.familiesBosted,
      antallMaanederINorge: null,
      EOSBarnetrygdFraNAV: dokument.EOSBarnetrygdFraNAV,
      adresseIUtlandet: dokument.adresseIUtlandet,
      oppgittAdresse: {
        gatenavn: dokument.oppgittAdresseGatenavn,
        husnummer: dokument.oppgittAdresseHusnummer,
        region: dokument.oppgittAdresseRegion,
        postnummer: dokument.oppgittAdressePostnummer,
        poststed: dokument.oppgittAdressePoststed,
        landKode: dokument.oppgittAdresseLand,
      },
    },
    maritimtArbeid: dokument.maritimtArbeid.map(maritimtArbeid => ({
      navn: maritimtArbeid.navn ? maritimtArbeid.navn : null,
      fartsomradeKode: maritimtArbeid.fartsomradeKode ? maritimtArbeid.fartsomradeKode : null,
      flaggLandKode: maritimtArbeid.flaggLandKode ? maritimtArbeid.flaggLandKode : null,
      installasjonsLandKode: maritimtArbeid.installasjonsLandKode ? maritimtArbeid.installasjonsLandKode : null,
      territorialfarvann: maritimtArbeid.territorialfarvann ? maritimtArbeid.territorialfarvann : null,
    })),
    selvstendigArbeid: {
      erSelvstendig: dokument.erSelvstendig,
      selvstendigForetak: dokument.selvstendigForetak,
    },
    personOpplysninger: {
      utenlandskIdent: dokument.utenlandskIdent,
      medfolgendeFamilie: [],
      medfolgendeAndre: null,
    },
  };

  return merge(state, soknad);
};
