import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { reduxForm } from 'redux-form';
import * as MKV from 'melosys-kodeverk';
import * as Utils from '../../utils';
import * as KV from '../../kodeverk';
import * as Validering from '../../soknad-komponenter/skjema/validering';
import * as MPT from '../../proptypes/';

import ArbeidsgivereNorge from '../../soknad-komponenter/arbeidsgivereNorge';
import ArbeidUtland from '../../soknad-komponenter/arbeidutland';
import ForetakUtland from '../../soknad-komponenter/foretakutland';
import Inntekt from '../../soknad-komponenter/inntektUtland';
import MaritimtArbeid from '../../soknad-komponenter/maritimtArbeid';
import Medlemskap from '../../komponenter/medlemskap';
import Soknadsperiode from '../../soknad-komponenter/soknadsperiode';
import Personopplysninger from '../../soknad-komponenter/personopplysninger';
import SelvstendigArbeid from '../../soknad-komponenter/selvstendigarbeid';
import Stegvelger from '../../soknad-komponenter/stegvelger';
import HenlagtInformasjon from '../../soknad-komponenter/stegErstatter/henlagtInformasjon';
import VirksomhetNorge from '../../soknad-komponenter/virksomhetNorge';
import FullmektigPanel from '../../soknad-komponenter/fullmektig';
import Kontantytelser from '../../soknad-komponenter/kontantytelser';

import { fagsakSelectors } from '../../ducks/fagsaker/';
import { behandlingerSelectors } from '../../ducks/behandlinger/';
import { saksopplysningerOperations, saksopplysningerSelectors } from '../../ducks/saksopplysninger';
import {
  soknadOperations,
  soknadActions,
  soknadSelectors,
} from '../../ducks/soknad/';

import { avklartefaktaSelectors } from '../../ducks/avklartefakta/';
import { behandlingsperioderSelectors } from '../../ducks/behandlingsperioder';
import { vilkarSelectors } from '../../ducks/vilkar/';
import { behandlingsresultatSelectors } from '../../ducks/behandlingsresultat/';
import { formSelectors } from '../../ducks/form/';
import { formatterDatoTilNorsk } from '../../utils/dato';
import { lovvalgsperioderSelectors } from '../../ducks/lovvalgsperioder';

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
    const { oppdaterSoknad, soknadForm } = this.props;
    oppdaterSoknad(soknadForm.values);
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
      <form name="soknad" id="soknad" onSubmit={this.overstyrSubmit}>
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
            oppdaterOgLagreBehandlingerHandler={this.props.oppdaterOgLagreBehandlingerHandler}
            lagreAllData={this.props.lagreAllData}
            fatteVedtakHandler={this.fatteVedtakHandler}
            lagreSoknadHandler={this.lagreSoknadHandler}
            oppdaterLokalSoknadHandler={this.oppdaterLokalSoknadHandler}
            begrunnelser={MKV.KTObjects.begrunnelser}
            landkoder={MKV.KTObjects.landkoder}
          />
        }
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
    );
  }
}

Saksopplysninger.propTypes = {
  redigerbart: PT.bool,
  behandlingID: PT.number.isRequired,
  alleRelevantePersoner: PT.arrayOf(MPT.Person),
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
  person: MPT.Person,
  sendSoknad: PT.func.isRequired,
  soknad: MPT.Soknad,
  soknadArbeidsinntekt: PT.object,
  soknadForm: PT.object.isRequired,
  valid: PT.bool.isRequired,
  vurdering: PT.object,
  syncErrors: PT.object,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAvklartefaktaHandler: PT.func.isRequired,
  lagreLovvalgsperioderHandler: PT.func.isRequired,
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
    forutgaendeBostedINorge: soknadSelectors.OppholdUtlandSelector(state).forutgaendeBostedINorge,
    arbeidUtland: soknadSelectors.ArbeidUtlandSelector(state),
    sammeAdresseSomArbeidsgiver: soknadSelectors.OppholdUtlandSelector(state).sammeAdresseSomArbeidsgiver,
    ektefelleEllerBarnINorge: soknadSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: soknadSelectors.OppholdUtlandSelector(state).studentSemester,
    erSelvstendig: soknadSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: soknadSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    familiesBosted: soknadSelectors.BostedSelector(state).familiesBostedLandkode,
    antallMaanederINorge: soknadSelectors.BostedSelector(state).antallMaanederINorge,
    EOSBarnetrygdFraNAV: soknadSelectors.BostedSelector(state).EOSBarnetrygdFraNAV,
    adresseIUtlandet: soknadSelectors.BostedSelector(state).adresseIUtlandet,
    maritimtArbeid: soknadSelectors.MaritimtArbeidSelector(state),
    soknadsland: soknadSelectors.SoknadslandSelector(state),
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
    lovvalgsperiode: {
      unntakFraBestemmelse: lovvalgsperioderSelectors.UnntakFraBestemmelseSelector(state),
    },
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
