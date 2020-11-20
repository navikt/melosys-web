import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as MPT from '../proptypes';
import * as KV from '../kodeverk';

import ArbeidsgivereNorge from './paneler/arbeidsgivereNorge';
import AndreArbeidsforholdNorge from './paneler/andreArbeidsforholdNorge';
import AndreArbeidsforholdUtland from './paneler/andreArbeidsforholdUtland';
import Arbeidssteder from './paneler/arbeidssteder';
import Personopplysninger from './paneler/personopplysninger';
import PeriodeInntektOgFullmektig from './paneler/periodeInntektOgFullmektig';

import { fagsakSelectors } from '../ducks/fagsaker';
import { behandlingsperioderSelectors } from '../ducks/behandlingsperioder';
import { saksopplysningerOperations } from '../ducks/saksopplysninger';
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from '../ducks/behandlingsgrunnlag';
import { avklartefaktaSelectors } from '../ducks/avklartefakta';
import { behandlingerSelectors } from '../ducks/behandlinger';
import { vilkarSelectors } from '../ducks/vilkar';
import { formSelectors } from '../ducks/form';
import { formatterDatoTilNorsk } from '../utils/dato';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../yup';
import { menypanelSelectors } from '../ducks/menypanel';

const Soknadpaneler = ({
  lagreSoknad,
  fagsaker,
  oppgittAdresseHarVerdier,
  startOgVisOppfriskModal,
  visMenypanel,
}) => {
  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    await lagreSoknad();
    startOgVisOppfriskModal();
  };

  return (
    <div>
      { visMenypanel &&
      <form name="soknad" id="soknad" onSubmit={overstyrSubmit}>
        <Personopplysninger oppgittAdresseHarVerdier={oppgittAdresseHarVerdier} />
        {fagsaker && fagsaker.saksnummer &&
          <PeriodeInntektOgFullmektig lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger} />
        }
        <ArbeidsgivereNorge />
        <AndreArbeidsforholdNorge />
        <AndreArbeidsforholdUtland />
        <Arbeidssteder />
      </form>
      }
    </div>
  );
};

Soknadpaneler.propTypes = {
  fagsaker: MPT.Fagsak.isRequired,
  lagreSoknad: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  oppgittAdresseHarVerdier: PT.bool.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  visMenypanel: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  oppgittAdresseHarVerdier: formSelectors.SoknadOppgittAdresseHarVerdierSelector(state),
  fagsaker: fagsakSelectors.FagsakSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  visMenypanel: menypanelSelectors.ErMenypanelSynlig(state),
  initialValues: {
    utenlandskIdent: behandlingsgrunnlagSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    medfolgendeFamilie: behandlingsgrunnlagSelectors.PersonOpplysningerSelector(state).medfolgendeFamilie,
    inntektNorskIPerioden: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaturalFribolig: behandlingsgrunnlagSelectors.ArbeidsinntektNaturalytelserSelector(state).friBil,
    inntektNaturalFribil: behandlingsgrunnlagSelectors.ArbeidsinntektNaturalytelserSelector(state).friBolig,
    inntektNaturalIAnnet: behandlingsgrunnlagSelectors.ArbeidsinntektNaturalytelserSelector(state).friAnnet,
    inntektErInnrapporteringspliktig: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state).inntektErInnrapporteringspliktig,
    inntektTrygdeavgiftBlirTrukket: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state).inntektTrygdeavgiftBlirTrukket,
    arbeidsgiverBekrefterUtsendelse: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBekrefterUtsendelse,
    arbeidstakerAnsattUnderUtsendelsen: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerAnsattUnderUtsendelsen,
    erstatterArbeidstakerenUtsendte: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state).erstatterArbeidstakerenUtsendte,
    arbeidstakerTidligereUtsendt24Mnd: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerTidligereUtsendt24Mnd,
    arbeidsgiverBetalerArbeidsgiveravgift: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBetalerArbeidsgiveravgift,
    trygdeavgiftTrukketGjennomSkatt: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkatt,
    trygdeavgiftTrukketGjennomSkattDato: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato),
    oppgittAdresseGatenavn: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).husnummer,
    oppgittAdresseRegion: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).landkode,
    antallAdmAnsatte: Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte) || null,
    antallAnsatte: Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAnsatte) || null,
    andelOmsetningINorge: Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge) || null,
    andelOppdragINorge: Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOppdragINorge) || null,
    andelKontrakterINorge: Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge) || null,
    ekstraArbeidsgivere: behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
    oppholdUtlandFom: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.OppholdUtlandPeriodeSelector(state).fom),
    oppholdUtlandTom: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.OppholdUtlandPeriodeSelector(state).tom),
    oppholdsland: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).oppholdslandkoder,
    arbeidUtland: behandlingsgrunnlagSelectors.ArbeidUtlandSelector(state),
    arbeidsstedOffshore: behandlingsgrunnlagSelectors.OffshoreArbeidSelector(state),
    arbeidsstedSkip: behandlingsgrunnlagSelectors.SkipArbeidSelector(state),
    arbeidsstedFly: behandlingsgrunnlagSelectors.LuftfartBaserSelector(state),
    ektefelleEllerBarnINorge: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).studentSemester,
    erSelvstendig: behandlingsgrunnlagSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: behandlingsgrunnlagSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    antallMaanederINorge: behandlingsgrunnlagSelectors.BostedSelector(state).antallMaanederINorge,
    EOSBarnetrygdFraNAV: behandlingsgrunnlagSelectors.BostedSelector(state).EOSBarnetrygdFraNAV,
    soknadsperiodeFom: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
    soknadsperiodeTom: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
    soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
    arbeidsforholdUtland: behandlingsgrunnlagSelectors.ArbeidsforholdUtlandSelector(state),
    selvstendigNaeringsvirksomhetUtland: behandlingsgrunnlagSelectors.SelvstendigNaeringsvirksomhetUtlandSelector(state),
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    avklartefakta: {
      soknadsland: avklartefaktaSelectors.Soknadsland(state),
      yrkesgruppe: avklartefaktaSelectors.Yrkesgruppe(state),
      yrkesaktivitet: avklartefaktaSelectors.Yrkesaktivitet(state),
      sokkelSkipKonklusjon: avklartefaktaSelectors.ArbeidSokkelSkipSelector(state),
    },
    vilkar: {
      vesentligVirksomhet: (vilkarSelectors.vesentligVirksomhetSelector(state).oppfylt),
      vesentligVirksomhetBegrunnelser: (vilkarSelectors.vesentligVirksomhetSelector(state).begrunnelseKoder),
      normaltDriverVirksomhet: (vilkarSelectors.normaltDriverVirksomhetSelector(state).oppfylt),
      normaltDriverVirksomhetBegrunnelser: (vilkarSelectors.normaltDriverVirksomhetSelector(state).begrunnelseKoder),
      forutgaendeMedlemskap: (vilkarSelectors.forutgaendeMedlemskap(state).oppfylt),
      forutgaendeMedlemskapBegrunnelser: (vilkarSelectors.forutgaendeMedlemskap(state).begrunnelseKoder),
      art11_3A: vilkarSelectors.art11_3A(state).oppfylt,
      art11_4_1: vilkarSelectors.art11_4_1(state).oppfylt,
      art11_4_2: vilkarSelectors.art11_4_2(state).oppfylt,
      nis: vilkarSelectors.nis(state).oppfylt,
      art12_1: vilkarSelectors.art12_1(state).oppfylt,
      art12_1_begrunnelser: vilkarSelectors.art12_1(state).begrunnelseKoder,
      art12_2: vilkarSelectors.art12_2(state).oppfylt,
      art12_2_begrunnelser: vilkarSelectors.art12_2(state).begrunnelseKoder,
      art16_1: vilkarSelectors.art16_1(state).oppfylt,
      art16_1_begrunnelser: vilkarSelectors.art16_1(state).begrunnelseKoder,
    },
  },
});

const mapDispatchToProps = dispatch => ({
  lagreSoknad: () => dispatch(behandlingsgrunnlagOperations.lagre()),
  oppfriskSaksopplysninger: behandlingID => saksopplysningerOperations.oppfrisk(behandlingID),
});

const SoknadpanelerForm = reduxForm({
  form: KV.Form.SOKNAD,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => {
    const settings = {
      context: {
        skalOppgittAdresseValideres: props.oppgittAdresseHarVerdier,
        behandlingstema: props.behandlingstema,
      },
    };

    return lagYupToReduxformErrorMapper(YupSkjemaer.saksopplysninger, settings)(values);
  },
})(Soknadpaneler);

export default connect(mapStateToProps, mapDispatchToProps)(SoknadpanelerForm);
