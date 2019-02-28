import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { reduxForm } from 'redux-form';
import * as MKV from 'melosys-kodeverk';

import * as Validering from '../../soknad-komponenter/skjema/validering';
import * as MPT from '../../proptypes/';

import ArbeidsgivereNorge from '../../soknad-komponenter/arbeidsgivereNorge';
import ArbeidUtland from '../../soknad-komponenter/arbeidutland';
import Bosted from '../../soknad-komponenter/bosted';
import ForetakUtland from '../../soknad-komponenter/foretakutland';
import Inntekt from '../../soknad-komponenter/inntektUtland';
import MaritimtArbeid from '../../soknad-komponenter/maritimtArbeid';
import Medlemskap from '../../soknad-komponenter/medlemskap';
import OppholdPeriode from '../../soknad-komponenter/oppholdPeriode';
import Personopplysninger from '../../soknad-komponenter/personopplysninger';
import SelvstendigArbeid from '../../soknad-komponenter/selvstendigarbeid';
import UtsendendeArbeidsgiver from '../../soknad-komponenter/utsendendeArbeidsgiver';
import Stegvelger from '../../soknad-komponenter/stegvelger';
import HenlagtInformasjon from '../../soknad-komponenter/stegErstatter/henlagtInformasjon';
import VirksomhetNorge from '../../soknad-komponenter/virksomhetNorge';

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
import { behandlingsresultatSelectors } from '../../ducks/behandlingsresultat/';
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
    const { oppfriskSaksopplysninger, sendSoknad, soknad } = this.props;
    const { behandlingID } = this.props.oppsummering;
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
      behandlingsresultat,
      fagsakStatusKode,
    } = this.props;

    if (Object.keys(soknadForm).length === 0 || Object.keys(soknad).length === 0) { return null; }
    const { values: soknadVerdier } = soknadForm;

    const { behandlingID } = this.props.oppsummering;
    if (!behandlingID) {
      return null;
    }

    const { henleggelsegrunnKode, henleggelseFritekst } = behandlingsresultat;
    const visHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
    const visStegVelger = !visHenlagtSak;
    return (
      <form name="soknad" id="soknad" onSubmit={this.overstyrSubmit}>
        { visHenlagtSak &&
          <HenlagtInformasjon
            begrunnelse={henleggelsegrunnKode}
            fritekst={henleggelseFritekst} />
        }
        { visStegVelger &&
          <Stegvelger
            lagreVilkarHandler={this.props.lagreVilkarHandler}
            lagreAvklartefaktaHandler={this.props.lagreAvklartefaktaHandler}
            lagreLovvalgsperioderHandler={this.props.lagreLovvalgsperioderHandler}
            lagreBehandlingerHandler={this.props.lagreBehandlingerHandler}
            lagreAllData={this.props.lagreAllData}
            fatteVedtakHandler={this.fatteVedtakHandler}
            lagreSoknadHandler={this.lagreSoknadHandler}
            oppdaterLokalSoknadHandler={this.oppdaterLokalSoknadHandler}
            begrunnelser={MKV.KTObjects.begrunnelser}
            landkoder={MKV.KTObjects.landkoder}
          />
        }
        <Personopplysninger />
        <OppholdPeriode lagreSoknadOgOppfriskSaksopplysninger={this.lagreSoknadOgOppfriskSaksopplysninger} />
        <Bosted erValidert={this.state.gyldigePaneler.bosted} />
        <ArbeidsgivereNorge />
        <ForetakUtland />
        <SelvstendigArbeid soknadVerdier={soknadVerdier} />
        <UtsendendeArbeidsgiver soknadVerdier={soknadVerdier} />
        <ArbeidUtland />
        <VirksomhetNorge />
        <MaritimtArbeid />
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
        {inntekt && <Inntekt soknadArbeidsinntekt={soknadArbeidsinntekt} />}
      </form>
    );
  }
}

Saksopplysninger.propTypes = {
  alleRelevantePersoner: PT.arrayOf(MPT.Person),
  avklartefakta: PT.array.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  fagsakStatusKode: PT.string.isRequired,
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
  syncErrors: PT.object,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAvklartefaktaHandler: PT.func.isRequired,
  lagreLovvalgsperioderHandler: PT.func.isRequired,
  lagreBehandlingerHandler: PT.func.isRequired,
  lagreAllData: PT.func.isRequired,
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
  syncErrors: {},
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  medlemskap: fagsakSelectors.MedlemskapSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  inntekt: fagsakSelectors.InntektSoknadenSelector(state),
  bekreftelser: fagsakSelectors.BekreftelserSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
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
    utsendteNeste12Mnd: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).utsendteNeste12Mnd),
    antallAdmAnsatte: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte),
    antallAnsatte: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAnsatte),
    andelOmsetningINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge),
    andelOppdragINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOppdragINorge),
    andelKontrakterINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge),
    arbeidstakereRekruttertILand: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).arbeidstakereRekruttertILand,
    oppdragsKontrakterIHovedsakInngaattILand: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).oppdragsKontrakterIHovedsakInngaattILand,
    ekstraArbeidsgivere: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
    oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
    oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
    oppholdsland: soknadSelectors.OppholdUtlandSelector(state).oppholdslandKoder,
    forutgaendeBostedINorge: soknadSelectors.OppholdUtlandSelector(state).forutgaendeBostedINorge,
    arbeidUtland: soknadSelectors.ArbeidUtlandSelector(state),
    sammeAdresseSomArbeidsgiver: soknadSelectors.OppholdUtlandSelector(state).sammeAdresseSomArbeidsgiver,
    ektefelleEllerBarnINorge: soknadSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: soknadSelectors.OppholdUtlandSelector(state).studentSemester,
    erSelvstendig: soknadSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: soknadSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    familiesBosted: soknadSelectors.BostedSelector(state).familiesBostedLandKode,
    antallMaanederINorge: soknadSelectors.BostedSelector(state).antallMaanederINorge,
    EOSBarnetrygdFraNAV: soknadSelectors.BostedSelector(state).EOSBarnetrygdFraNAV,
    adresseIUtlandet: soknadSelectors.BostedSelector(state).adresseIUtlandet,
    maritimtArbeid: soknadSelectors.MaritimtArbeidSelector(state),
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
      yrkesgruppe: avklartefaktaSelectors.Yrkesgruppe(state),
      yrkesaktivitetAntallLand: avklartefaktaSelectors.YrkesaktivitetAntallLand(state),
      yrkesaktivitet: avklartefaktaSelectors.Yrkesaktivitet(state),
      arbeidsgivere: avklartefaktaSelectors.ArbeidsgivereSelector(state),
      sokkelEllerSkip: avklartefaktaSelectors.SokkelEllerSkipSelector(state),
      sokkelSkipKonklusjon: avklartefaktaSelectors.ArbeidSokkelSkipSelector(state),
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
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  oppdaterSoknad: values => { dispatch(soknadActions.oppdaterSoknadState(values)); },
});

const SaksopplysningerForm = reduxForm({
  form: 'soknad',
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Felles.byggValidering(values, props),
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
