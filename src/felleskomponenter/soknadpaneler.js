import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as MPT from '../proptypes';
import * as KV from '../kodeverk';

import ArbeidsgivereNorge from './paneler/arbeidsgivereNorge';
import ArbeidUtland from './paneler/arbeidutland';
import ForetakUtland from './paneler/foretakutland';
import Inntekt from './paneler/inntektUtland';
import MaritimtArbeid from './paneler/maritimtArbeid';
import Medlemskap from './paneler/medlemskap';
import Soknadsperiode from './paneler/soknadsperiode';
import Personopplysninger from './paneler/personopplysninger';
import SelvstendigArbeid from './paneler/selvstendigarbeid';
import VirksomhetNorge from './paneler/virksomhetNorge';
import FullmektigPanel from './paneler/fullmektig';
import Kontantytelser from './paneler/kontantytelser';

import { fagsakSelectors } from '../ducks/fagsaker';
import { behandlingerSelectors } from '../ducks/behandlinger';
import { behandlingsperioderSelectors } from '../ducks/behandlingsperioder';
import { saksopplysningerOperations } from '../ducks/saksopplysninger';
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from '../ducks/behandlingsgrunnlag';
import { avklartefaktaSelectors } from '../ducks/avklartefakta';
import { vilkarSelectors } from '../ducks/vilkar';
import { formSelectors } from '../ducks/form';
import { formatterDatoTilNorsk } from '../utils/dato';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../yup';

const Soknadpaneler = ({
  lagreSoknad,
  fagsaker,
  medlemskap,
  soknadArbeidsinntekt,
  soknadForm,
  oppgittAdresseHarVerdier,
  startOgVisOppfriskModal,
}) => {
  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    await lagreSoknad();
    startOgVisOppfriskModal();
  };

  const { values: soknadVerdier } = soknadForm;

  return (
    <form name="soknad" id="soknad" onSubmit={overstyrSubmit}>
      <Personopplysninger oppgittAdresseHarVerdier={oppgittAdresseHarVerdier} />
      <Soknadsperiode lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger} />
      <ArbeidsgivereNorge />
      <ForetakUtland />
      <SelvstendigArbeid soknadVerdier={soknadVerdier} />
      {fagsaker && fagsaker.saksnummer && <FullmektigPanel />}
      <ArbeidUtland />
      <VirksomhetNorge />
      <MaritimtArbeid />
      {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      <Inntekt soknadArbeidsinntekt={soknadArbeidsinntekt} />
      <Kontantytelser />
    </form>
  );
};

Soknadpaneler.propTypes = {
  soknadForm: PT.object,
  fagsaker: MPT.Fagsak.isRequired,
  lagreSoknad: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  medlemskap: MPT.Medlemskap,
  soknadArbeidsinntekt: PT.object,
  behandlingID: PT.number.isRequired,
  oppgittAdresseHarVerdier: PT.bool.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
};

Soknadpaneler.defaultProps = {
  soknadForm: {},
  medlemskap: {},
  soknadArbeidsinntekt: {},
};

const mapStateToProps = state => ({
  oppgittAdresseHarVerdier: formSelectors.SoknadOppgittAdresseHarVerdierSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  fagsaker: fagsakSelectors.FagsakSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  soknadArbeidsinntekt: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state),
  initialValues: {
    utenlandskIdent: behandlingsgrunnlagSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    medfolgendeFamilie: behandlingsgrunnlagSelectors.PersonOpplysningerSelector(state).medfolgendeFamilie,
    medfolgendeAndre: behandlingsgrunnlagSelectors.PersonOpplysningerSelector(state).medfolgendeAndre,
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
    utsendteNeste12Mnd: Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).utsendteNeste12Mnd) || null,
    antallAdmAnsatte: Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte) || null,
    antallAnsatte: Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAnsatte) || null,
    andelOmsetningINorge: Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge) || null,
    andelOppdragINorge: Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOppdragINorge) || null,
    andelKontrakterINorge: Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge) || null,
    arbeidstakereRekruttertILand: behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).arbeidstakereRekruttertILand,
    ekstraArbeidsgivere: behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
    oppholdUtlandFom: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.OppholdUtlandPeriodeSelector(state).fom),
    oppholdUtlandTom: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.OppholdUtlandPeriodeSelector(state).tom),
    oppholdsland: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).oppholdslandkoder,
    arbeidUtland: behandlingsgrunnlagSelectors.ArbeidUtlandSelector(state),
    ektefelleEllerBarnINorge: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).studentSemester,
    erSelvstendig: behandlingsgrunnlagSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: behandlingsgrunnlagSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    antallMaanederINorge: behandlingsgrunnlagSelectors.BostedSelector(state).antallMaanederINorge,
    EOSBarnetrygdFraNAV: behandlingsgrunnlagSelectors.BostedSelector(state).EOSBarnetrygdFraNAV,
    maritimtArbeid: behandlingsgrunnlagSelectors.MaritimtArbeidSelector(state),
    soknadsperiodeFom: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
    soknadsperiodeTom: formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
    soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
    foretakUtland: behandlingsgrunnlagSelectors.ForetakUtlandSelector(state),
    kontaktNavn: behandlingsgrunnlagSelectors.ArbeidNorgeSelector(state).kontaktNavn,
    kontaktEpost: behandlingsgrunnlagSelectors.ArbeidNorgeSelector(state).kontaktEpost,
    fullmektigFirma: behandlingsgrunnlagSelectors.ArbeidNorgeSelector(state).fullmektigFirma,
    fullmektigGateadresse: behandlingsgrunnlagSelectors.ArbeidNorgeSelector(state).fullmektigGateadresse,
    fullmektigPostnr: behandlingsgrunnlagSelectors.ArbeidNorgeSelector(state).fullmektigPostnr,
    fullmektigPoststed: behandlingsgrunnlagSelectors.ArbeidNorgeSelector(state).fullmektigPoststed,
    fullmektigRegion: behandlingsgrunnlagSelectors.ArbeidNorgeSelector(state).fullmektigRegion,
    fullmektigLand: behandlingsgrunnlagSelectors.ArbeidNorgeSelector(state).fullmektigLandkode,
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
    vurderingLovvalg: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
    vurderingBegrunnelser: avklartefaktaSelectors.AvklartefaktaVurderingSelector(state).begrunnelser,
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
      },
    };

    return lagYupToReduxformErrorMapper(YupSkjemaer.saksopplysninger, settings)(values);
  },
})(Soknadpaneler);

export default connect(mapStateToProps, mapDispatchToProps)(SoknadpanelerForm);
