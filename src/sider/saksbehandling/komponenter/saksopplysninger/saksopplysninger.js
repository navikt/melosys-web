import React, { Component, Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { reduxForm } from 'redux-form';
import * as MKV from 'melosys-kodeverk';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Validering from '../../../../felleskomponenter/skjema/validering';
import * as MPT from '../../../../proptypes';

import ArbeidsgivereNorge from '../arbeidsgivereNorge';
import ArbeidUtland from '../arbeidutland';
import ForetakUtland from '../foretakutland';
import Inntekt from '../inntektUtland';
import MaritimtArbeid from '../maritimtArbeid';
import Medlemskap from '../../../../felleskomponenter/medlemskap';
import Soknadsperiode from '../soknadsperiode';
import Personopplysninger from '../personopplysninger';
import SelvstendigArbeid from '../selvstendigarbeid';
import Stegvelger from '../stegvelger';
import HenlagtInformasjon from '../stegErstatter/henlagtInformasjon';
import VirksomhetNorge from '../virksomhetNorge';
import FullmektigPanel from '../fullmektig';
import Kontantytelser from '../kontantytelser';

import { fagsakSelectors } from '../../../../ducks/fagsaker';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { behandlingsperioderSelectors } from '../../../../ducks/behandlingsperioder';
import { saksopplysningerOperations, saksopplysningerSelectors } from '../../../../ducks/saksopplysninger';
import {
  soknadOperations,
  soknadActions,
  soknadSelectors,
} from '../../../../ducks/soknad';

import { avklartefaktaSelectors } from '../../../../ducks/avklartefakta';
import { vilkarSelectors } from '../../../../ducks/vilkar';
import { behandlingsresultatSelectors } from '../../../../ducks/behandlingsresultat';
import { formSelectors } from '../../../../ducks/form';
import { formatterDatoTilNorsk } from '../../../../utils/dato';


class Saksopplysninger extends Component {
  lagreSoknadHandler = async () => {
    const {
      behandlingID, valid, sendSoknad, soknad,
    } = this.props;
    if (valid) {
      await sendSoknad(behandlingID, soknad);
    }
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };

  oppdaterLokalSoknadHandler = () => {
    const { oppdaterSoknad, soknadForm, inngangForm } = this.props;
    oppdaterSoknad({ ...soknadForm.values, ...inngangForm.values });
  };

  lagreSoknadOgOppfriskSaksopplysninger = async () => {
    const {
      behandlingID, oppfriskSaksopplysninger, sendSoknad, soknad,
    } = this.props;
    await sendSoknad(behandlingID, soknad);
    await oppfriskSaksopplysninger(behandlingID);
    this.props.blokkerInnholdMedOppfriskSpinner();
  };

  render () {
    const {
      redigerbart,
      behandlingID,
      medlemskap,
      soknadArbeidsinntekt,
      soknadForm,
      soknad,
      behandlingsresultat,
      fagsakStatusKode,
    } = this.props;

    if (Utils._isNil(redigerbart)) return null;
    if (Object.keys(soknadForm).length === 0 || Object.keys(soknad).length === 0) { return null; }
    const { values: soknadVerdier } = soknadForm;

    if (!behandlingID) {
      return null;
    }

    const visHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
    const visStegVelger = !visHenlagtSak;
    return (
      <Fragment>
        { visHenlagtSak &&
          <HenlagtInformasjon
            behandlingsresultat={behandlingsresultat} />
        }
        { visStegVelger &&
          <Stegvelger
            behandlingID={behandlingID}
            lagreVilkarHandler={this.props.lagreVilkarHandler}
            lagreAvklartefaktaHandler={this.props.lagreAvklartefaktaHandler}
            lagreLovvalgsperioderHandler={this.props.lagreLovvalgsperioderHandler}
            lagreAnmodningsperioderHandler={this.props.lagreAnmodningsperioderHandler}
            oppdaterOgLagreBehandlingerHandler={this.props.oppdaterOgLagreBehandlingerHandler}
            lagreAllData={this.props.lagreAllData}
            fatteVedtakHandler={this.fatteVedtakHandler}
            lagreSoknadHandler={this.lagreSoknadHandler}
            oppdaterLokalSoknadHandler={this.oppdaterLokalSoknadHandler}
            begrunnelser={MKV.KTObjects.begrunnelser}
            landkoder={MKV.KTObjects.landkoder}
          />
        }
        <form name="soknad" id="soknad" onSubmit={this.overstyrSubmit}>
          <Personopplysninger />
          <Soknadsperiode lagreSoknadOgOppfriskSaksopplysninger={this.lagreSoknadOgOppfriskSaksopplysninger} />
          <ArbeidsgivereNorge />
          <ForetakUtland />
          <SelvstendigArbeid soknadVerdier={soknadVerdier} />
          <FullmektigPanel />
          <ArbeidUtland />
          <VirksomhetNorge />
          <MaritimtArbeid />
          {medlemskap && <Medlemskap medlemskap={medlemskap} />}
          <Inntekt soknadArbeidsinntekt={soknadArbeidsinntekt} />
          <Kontantytelser />
        </form>
      </Fragment>
    );
  }
}

Saksopplysninger.propTypes = {
  redigerbart: PT.bool,
  behandlingID: PT.number.isRequired,
  alleRelevantePersoner: PT.arrayOf(MPT.Behandlinger.Saksopplysninger.Person),
  avklartefakta: MPT.AvklartefaktaListe.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  fagsakStatusKode: PT.string.isRequired,
  handleSubmit: PT.func.isRequired,
  match: PT.object.isRequired,
  medlemskap: MPT.Medlemskap,
  oppdaterSoknad: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  sjekkOppfriskningStatus: PT.func.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person,
  sendSoknad: PT.func.isRequired,
  soknad: MPT.Soknad,
  soknadArbeidsinntekt: PT.object,
  soknadForm: PT.object.isRequired,
  inngangForm: PT.object,
  valid: PT.bool.isRequired,
  vurdering: PT.object,
  syncErrors: PT.object,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAvklartefaktaHandler: PT.func.isRequired,
  lagreLovvalgsperioderHandler: PT.func.isRequired,
  lagreAnmodningsperioderHandler: PT.func.isRequired,
  oppdaterOgLagreBehandlingerHandler: PT.func.isRequired,
  lagreAllData: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  redigerbart: null,
  alleRelevantePersoner: [],
  medlemskap: {},
  person: {},
  soknad: {},
  soknadArbeidsinntekt: {},
  vurdering: {},
  syncErrors: {},
  inngangForm: {},
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  bekreftelser: behandlingerSelectors.BekreftelserSelector(state),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  forretningsValidering: formSelectors.ForretningsValideringSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  inngangForm: formSelectors.InngangFormSelector(state),
  soknadArbeidsinntekt: soknadSelectors.ArbeidsinntektSelector(state),
  initialValues: {
    utenlandskIdent: soknadSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    medfolgendeFamilie: soknadSelectors.PersonOpplysningerSelector(state).medfolgendeFamilie,
    medfolgendeAndre: soknadSelectors.PersonOpplysningerSelector(state).medfolgendeAndre,
    inntektNorskIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaeringIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektNaeringIPerioden,
    inntektNaturalFribolig: soknadSelectors.ArbeidsinntektNaturalytelserSelector(state).friBil,
    inntektNaturalFribil: soknadSelectors.ArbeidsinntektNaturalytelserSelector(state).friBolig,
    inntektNaturalIAnnet: soknadSelectors.ArbeidsinntektNaturalytelserSelector(state).friAnnet,
    inntektErInnrapporteringspliktig: soknadSelectors.ArbeidsinntektSelector(state).inntektErInnrapporteringspliktig,
    inntektTrygdeavgiftBlirTrukket: soknadSelectors.ArbeidsinntektSelector(state).inntektTrygdeavgiftBlirTrukket,
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
    oppgittAdresseLand: soknadSelectors.BostedAdresseSelector(state).landkode,
    utsendteNeste12Mnd: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).utsendteNeste12Mnd) || null,
    antallAdmAnsatte: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte) || null,
    antallAnsatte: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAnsatte) || null,
    andelOmsetningINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge) || null,
    andelOppdragINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOppdragINorge) || null,
    andelKontrakterINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge) || null,
    arbeidstakereRekruttertILand: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).arbeidstakereRekruttertILand,
    oppdragsKontrakterIHovedsakInngaattILand: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).oppdragsKontrakterIHovedsakInngaattILand,
    ekstraArbeidsgivere: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
    oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
    oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
    oppholdsland: soknadSelectors.OppholdUtlandSelector(state).oppholdslandkoder,
    arbeidUtland: soknadSelectors.ArbeidUtlandSelector(state),
    ektefelleEllerBarnINorge: soknadSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: soknadSelectors.OppholdUtlandSelector(state).studentSemester,
    erSelvstendig: soknadSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: soknadSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    antallMaanederINorge: soknadSelectors.BostedSelector(state).antallMaanederINorge,
    EOSBarnetrygdFraNAV: soknadSelectors.BostedSelector(state).EOSBarnetrygdFraNAV,
    maritimtArbeid: soknadSelectors.MaritimtArbeidSelector(state),
    soknadsperiodeFom: formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).fom),
    soknadsperiodeTom: formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).tom),
    foretakUtland: soknadSelectors.ForetakUtlandSelector(state),
    kontaktNavn: soknadSelectors.ArbeidNorgeSelector(state).kontaktNavn,
    kontaktEpost: soknadSelectors.ArbeidNorgeSelector(state).kontaktEpost,
    fullmektigFirma: soknadSelectors.ArbeidNorgeSelector(state).fullmektigFirma,
    fullmektigGateadresse: soknadSelectors.ArbeidNorgeSelector(state).fullmektigGateadresse,
    fullmektigPostnr: soknadSelectors.ArbeidNorgeSelector(state).fullmektigPostnr,
    fullmektigPoststed: soknadSelectors.ArbeidNorgeSelector(state).fullmektigPoststed,
    fullmektigRegion: soknadSelectors.ArbeidNorgeSelector(state).fullmektigRegion,
    fullmektigLand: soknadSelectors.ArbeidNorgeSelector(state).fullmektigLandkode,
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    avklartefakta: {
      soknadsland: avklartefaktaSelectors.Soknadsland(state),
      yrkesgruppe: avklartefaktaSelectors.Yrkesgruppe(state),
      yrkesaktivitetAntallLand: avklartefaktaSelectors.YrkesaktivitetAntallLand(state),
      yrkesaktivitet: avklartefaktaSelectors.Yrkesaktivitet(state),
      virksomheter: avklartefaktaSelectors.VirksomhetSelector(state),
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
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  oppdaterSoknad: values => { dispatch(soknadActions.oppdaterSoknadState(values)); },
});

const SaksopplysningerForm = reduxForm({
  form: KV.Form.SOKNAD,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: Validering.Skjemaer.createValidator(Validering.Skjemaer.saksopplysninger),
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
