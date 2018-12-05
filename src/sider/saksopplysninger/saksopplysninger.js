import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { reduxForm } from 'redux-form';

import * as Validering from '../../felles-komponenter/skjema/validering';
import * as MPT from '../../proptypes/';

import ArbeidsgivereNorge from '../../felles-komponenter/arbeidsgivereNorge';
import ArbeidUtland from '../../felles-komponenter/arbeidUtland';
import Bosted from '../../felles-komponenter/bosted';
import ForetakUtland from '../../felles-komponenter/foretakUtland';
import Inntekt from '../../felles-komponenter/inntektUtland';
import MaritimtArbeid from '../../felles-komponenter/maritimtArbeid';
import Medlemskap from '../../felles-komponenter/medlemskap';
import OppholdPeriode from '../../felles-komponenter/oppholdPeriode';
import Personopplysninger from '../../felles-komponenter/personopplysninger';
import SelvstendigArbeid from '../../felles-komponenter/selvstendigArbeid';
import UtsendendeArbeidsgiver from '../../felles-komponenter/utsendendeArbeidsgiver';
import Stegvelger from '../../felles-komponenter/stegvelger';
import VirksomhetNorge from '../../felles-komponenter/virksomhetNorge';

import { fagsakSelectors } from '../../ducks/fagsaker/';

import { saksopplysningerOperations, saksopplysningerSelectors } from '../../ducks/saksopplysninger';

import {
  soknadOperations,
  soknadActions,
  soknadSelectors,
} from '../../ducks/soknad/';

import { avklartefaktaSelectors } from '../../ducks/avklartefakta/';

import { behandlingerSelectors } from '../../ducks/behandlinger';

import { vilkarSelectors } from '../../ducks/vilkar/';

import { formSelectors } from '../../ducks/form/';

import { formatterDatoTilNorsk } from '../../utils/dato';

class Saksopplysninger extends Component {
  state = {
    gyldigePaneler: {},
  };

  componentDidUpdate(prevProps) {
    const { syncErrors } = this.props.soknadForm;

    // Oppdaterer alle paneler og setter grønn hake dersom ingen felter
    // i panelet lenger er ugyldig (ikke validerer).
    if (JSON.toString(syncErrors) !== JSON.toString(prevProps.syncErrors)) {
      this.onUpdate(function callback() {
        this.setState({ gyldigePaneler: Validering.Felles.gyldigePaneler(syncErrors) });
      });
    }
  }

  lagreSoknadHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const {
      valid, sendSoknad, soknad,
    } = this.props;
    if (valid) {
      await sendSoknad(bid, soknad);
    }
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };

  oppdaterLokalSoknadHandler = () => {
    const { oppdaterSoknad, soknadForm } = this.props;
    oppdaterSoknad(soknadForm.values);
  };

  lagreSoknadOgOppfriskSaksopplysninger = async () => {
    const { oppfriskSaksopplysninger, sendSoknad } = this.props;
    const { behandlingID } = this.props.oppsummering;
    const { soknad } = this.props;
    await sendSoknad(behandlingID, soknad);
    await oppfriskSaksopplysninger(behandlingID);
    this.props.blokkerInnholdMedOppfriskSpinner();
  };

  render () {
    const {
      medlemskap,
      inntekt,
      soknadArbeidsinntekt,
      soknadForm,
      soknad,
    } = this.props;

    const { behandlingID } = this.props.oppsummering;

    const { values: soknadVerdier } = soknadForm;

    if (Object.keys(soknadForm).length === 0 || Object.keys(soknad).length === 0) { return null; }

    return behandlingID ? (
      <form name="soknad" id="soknad" onSubmit={this.overstyrSubmit}>
        <Stegvelger
          fatteVedtakHandler={this.fatteVedtakHandler}
          lagreSoknadHandler={this.lagreSoknadHandler}
          oppdaterLokalSoknadHandler={this.oppdaterLokalSoknadHandler}
        />
        <Personopplysninger />
        <OppholdPeriode lagreSoknadOgOppfriskSaksopplysninger={this.lagreSoknadOgOppfriskSaksopplysninger} />
        <Bosted erValidert={this.state.gyldigePaneler.bosted} />
        <ArbeidsgivereNorge />
        <SelvstendigArbeid soknadVerdier={soknadVerdier} />
        <UtsendendeArbeidsgiver soknadVerdier={soknadVerdier} />
        <ArbeidUtland />
        <ForetakUtland />
        <VirksomhetNorge />
        <MaritimtArbeid soknadVerdier={soknadVerdier} />
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
        {inntekt && <Inntekt soknadArbeidsinntekt={soknadArbeidsinntekt} />}
      </form>
    ) : null;
  }
}

Saksopplysninger.propTypes = {
  alleRelevantePersoner: PT.arrayOf(MPT.Person),
  avklartefakta: PT.array.isRequired,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  handleSubmit: PT.func.isRequired,
  inntekt: MPT.Inntekt,
  match: PT.object.isRequired,
  medlemskap: MPT.Medlemskap,
  oppdaterSoknad: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  sjekkOppfriskningStatus: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
  person: MPT.Person,
  sendSoknad: PT.func.isRequired,
  soknad: PT.object,
  soknadArbeidsinntekt: PT.object,
  soknadForm: PT.object.isRequired,
  valid: PT.bool.isRequired,
  vurdering: PT.object,
};

Saksopplysninger.defaultProps = {
  alleRelevantePersoner: [],
  inntekt: {},
  medlemskap: {},
  oppsummering: {},
  person: {},
  soknad: {},
  soknadArbeidsinntekt: {},
  vurdering: {},
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  medlemskap: fagsakSelectors.MedlemskapSelector(state),
  inntekt: fagsakSelectors.InntektSoknadenSelector(state),
  bekreftelser: fagsakSelectors.BekreftelserSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  forretningsValidering: formSelectors.ForretningsValideringSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  soknadArbeidsinntekt: soknadSelectors.ArbeidsinntektSelector(state),
  initialValues: {
    utenlandskIdent: soknadSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    medfolgendeFamilie: soknadSelectors.PersonOpplysningerSelector(state).medfolgendeFamilie,
    medfolgendeAndre: soknadSelectors.PersonOpplysningerSelector(state).medfolgendeAndre,
    inntektNorskIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaeringIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektNaeringIPerioden,
    arbeidsgiverBekrefterUtsendelse: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBekrefterUtsendelse,
    arbeidstakerAnsattUnderUtsendelsen: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerAnsattUnderUtsendelsen,
    erstatterArbeidstakerenUtsendte: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).erstatterArbeidstakerenUtsendte,
    arbeidstakerTidligereUtsendt24Mnd: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerTidligereUtsendt24Mnd,
    arbeidsgiverBetalerArbeidsgiveravgift: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBetalerArbeidsgiveravgift,
    trygdeavgiftTrukketGjennomSkatt: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkatt,
    trygdeavgiftTrukketGjennomSkattDato: formatterDatoTilNorsk(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato),
    oppgittAdresseGatenavn: soknadSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummer: soknadSelectors.BostedAdresseSelector(state).husnummer,
    oppgittAdresseRegion: soknadSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostnummer: soknadSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: soknadSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: soknadSelectors.BostedAdresseSelector(state).landKode,
    erBemanningsbyra: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).erBemanningsbyra,
    utsendteNeste12Mnd: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).utsendteNeste12Mnd),
    antallAdmAnsatte: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte),
    antallAdminAnsatteEOS: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdminAnsatteEOS),
    andelOmsetningINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge),
    andelKontrakterINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge),
    utsendtFortsetterArbeidsforholdIUtlandet: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).utsendtFortsetterArbeidsforholdIUtlandet,
    utsendtArbeiderMedKlienter: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).utsendtArbeiderMedKlienter,
    utsendtArbeiderMedKontrakter: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).utsendtArbeiderMedKontrakter,
    ekstraArbeidsgivere: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
    oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
    oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
    oppholdsland: soknadSelectors.OppholdUtlandSelector(state).oppholdslandKoder,
    forutgaendeBostedINorge: soknadSelectors.OppholdUtlandSelector(state).harForutgaendeBostedINorge,
    arbeidUtland: soknadSelectors.ArbeidUtlandSelector(state),
    sammeAdresseSomArbeidsgiver: soknadSelectors.OppholdUtlandSelector(state).sammeAdresseSomArbeidsgiver,
    ektefelleEllerBarnINorge: soknadSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: soknadSelectors.OppholdUtlandSelector(state).studentSemester,
    studieLand: soknadSelectors.OppholdUtlandSelector(state).studieLandKode,
    erSelvstendig: soknadSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: soknadSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    studentFinansiering: soknadSelectors.OppholdUtlandSelector(state).studentFinansiering,
    intensjonOmRetur: soknadSelectors.BostedSelector(state).intensjonOmRetur,
    familiesBosted: soknadSelectors.BostedSelector(state).familiesBostedLandKode,
    antallMaanederINorge: soknadSelectors.BostedSelector(state).antallMaanederINorge,
    EOSBarnetrygdFraNAV: soknadSelectors.BostedSelector(state).EOSBarnetrygdFraNAV,
    adresseIUtlandet: soknadSelectors.BostedSelector(state).adresseIUtlandet,
    maritimType: soknadSelectors.MaritimtArbeidSelector(state).maritimType,
    skipsNavn: soknadSelectors.MaritimtArbeidSelector(state).skipsNavn,
    fartsomrade: soknadSelectors.MaritimtArbeidSelector(state).fartsomrade,
    flaggLand: soknadSelectors.MaritimtArbeidSelector(state).flaggLand,
    installasjonsLand: soknadSelectors.MaritimtArbeidSelector(state).installasjonsLand,
    foretakUtland: soknadSelectors.ForetakUtlandSelector(state),
    kontaktNavn: soknadSelectors.ArbeidNorgeSelector(state).kontaktNavn,
    kontaktEpost: soknadSelectors.ArbeidNorgeSelector(state).kontaktEpost,
    fullmektigFirma: soknadSelectors.ArbeidNorgeSelector(state).fullmektigFirma,
    fullmektigGateadresse: soknadSelectors.ArbeidNorgeSelector(state).fullmektigGateadresse,
    fullmektigPostnr: soknadSelectors.ArbeidNorgeSelector(state).fullmektigPostnr,
    fullmektigPoststed: soknadSelectors.ArbeidNorgeSelector(state).fullmektigPoststed,
    fullmektigRegion: soknadSelectors.ArbeidNorgeSelector(state).fullmektigRegion,
    fullmektigLand: soknadSelectors.ArbeidNorgeSelector(state).fullmektigLandKode,
    tidligeremedlemskap: behandlingerSelectors.tidligereMedlemskap(state),
    avklartefakta: {
      oppholdsland: avklartefaktaSelectors.Oppholdsland(state),
      sysselsetting: avklartefaktaSelectors.Sysselsetting(state),
      yrkesaktivitetAntallLand: avklartefaktaSelectors.YrkesaktivitetAntallLand(state),
      yrkesaktivitet: avklartefaktaSelectors.Yrkesaktivitet(state),
      arbeidsgivere: avklartefaktaSelectors.ArbeidsgivereSelector(state),
    },
    vilkar: {
      vesentligVirksomhet: (vilkarSelectors.vesentligVirksomhetSelector(state).oppfylt),
      vesentligVirksomhetBegrunnelser: (vilkarSelectors.vesentligVirksomhetSelector(state).begrunnelseKoder),
      normaltDriverVirksomhet: (vilkarSelectors.normaltDriverVirksomhetSelector(state).oppfylt),
      normaltDriverVirksomhetBegrunnelser: (vilkarSelectors.normaltDriverVirksomhetSelector(state).begrunnelseKoder),
      forutgaendeMedlemskap: (vilkarSelectors.forutgaendeMedlemskap(state).oppfylt),
      forutgaendeMedlemskapBegrunnelser: (vilkarSelectors.forutgaendeMedlemskap(state).begrunnelseKoder),
      bosattINorge: (vilkarSelectors.bosattINorge(state).oppfylt),
      bosattINorgeBegrunnelser: (vilkarSelectors.bosattINorge(state).begrunnelseKoder),
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
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  oppdaterSoknad: values => { dispatch(soknadActions.oppdaterSoknadState(values)); },
});

const SaksopplysningerForm = reduxForm({
  form: 'soknad',
  enableReinitialize: true,
  destroyOnUnmount: false,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Felles.byggValidering(values, props),
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
