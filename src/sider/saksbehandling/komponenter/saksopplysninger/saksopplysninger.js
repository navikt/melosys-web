import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { reduxForm } from 'redux-form';

import MKV from '../../../../melosyskodeverk';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Validering from '../../../../felleskomponenter/skjema/validering';
import * as MPT from '../../../../proptypes';

import ArbeidsgivereNorge from '../../../../felleskomponenter/paneler/arbeidsgivereNorge';
import ArbeidUtland from '../../../../felleskomponenter/paneler/arbeidutland';
import ForetakUtland from '../../../../felleskomponenter/paneler/foretakutland';
import Inntekt from '../../../../felleskomponenter/paneler/inntektUtland';
import MaritimtArbeid from '../../../../felleskomponenter/paneler/maritimtArbeid';
import Medlemskap from '../../../../felleskomponenter/paneler/medlemskap';
import Soknadsperiode from '../../../../felleskomponenter/paneler/soknadsperiode';
import Personopplysninger from '../../../../felleskomponenter/paneler/personopplysninger';
import SelvstendigArbeid from '../../../../felleskomponenter/paneler/selvstendigarbeid';
import Stegvelger from '../../../../felleskomponenter/stegvelger';
import { HenlagtSak, AvslaattSoknad } from '../stegErstatter';
import VirksomhetNorge from '../../../../felleskomponenter/paneler/virksomhetNorge';
import FullmektigPanel from '../../../../felleskomponenter/paneler/fullmektig';
import Kontantytelser from '../../../../felleskomponenter/paneler/kontantytelser';

import { fagsakSelectors } from '../../../../ducks/fagsaker';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { behandlingsperioderSelectors } from '../../../../ducks/behandlingsperioder';
import { redigerbartSelectors } from '../../../../ducks/redigerbart';
import { saksopplysningerOperations, saksopplysningerSelectors } from '../../../../ducks/saksopplysninger';
import {
  behandlingsgrunnlagOperations,
  behandlingsgrunnlagSelectors,
} from '../../../../ducks/behandlingsgrunnlag';

import { avklartefaktaSelectors } from '../../../../ducks/avklartefakta';
import { vilkarSelectors } from '../../../../ducks/vilkar';
import { behandlingsresultatSelectors } from '../../../../ducks/behandlingsresultat';
import { formSelectors } from '../../../../ducks/form';
import { formatterDatoTilNorsk } from '../../../../utils/dato';

import { stegMap } from '../../stegMap';

const Saksopplysninger = props => {
  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const oppdaterLokalSoknadHandler = () => {
    props.oppdaterBehandlingsgrunnlag();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    const {
      behandlingID, oppfriskSaksopplysninger, sendBehandlingsgrunnlag, behandlingsgrunnlag,
    } = props;
    await sendBehandlingsgrunnlag(behandlingID, behandlingsgrunnlag);
    await oppfriskSaksopplysninger(behandlingID);
    props.blokkerInnholdMedOppfriskSpinner();
  };

  const {
    redigerbart,
    behandlingID,
    medlemskap,
    soknadForm,
    behandlingsgrunnlag,
    behandlingsresultat,
    fagsakStatusKode,
    fagsaker,
    tilForsiden,
    visValideringModalDialogHandle,
    oppgittAdresseHarVerdier,
  } = props;


  if (Utils._isNil(redigerbart)) return null;
  if (Object.keys(soknadForm).length === 0 || Object.keys(behandlingsgrunnlag).length === 0) { return null; }
  const { values: soknadVerdier } = soknadForm;

  if (!behandlingID) {
    return null;
  }

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslaattSoknad = behandlingsresultat.behandlingsresultatTypeKode === MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const visStegVelger = !erHenlagtSak && !erAvslaattSoknad;
  return (
    <Fragment>
      { erHenlagtSak &&
      <HenlagtSak behandlingsresultat={behandlingsresultat} />
      }
      {
        visAvslaattSoknad &&
        <AvslaattSoknad behandlingsresultat={behandlingsresultat} />
      }
      { visStegVelger &&
      <Stegvelger
        behandlingID={behandlingID}
        lagreVilkarHandler={props.lagreVilkarHandler}
        lagreAvklartefaktaHandler={props.lagreAvklartefaktaHandler}
        lagreLovvalgsperioderHandler={props.lagreLovvalgsperioderHandler}
        lagreAnmodningsperioderHandler={props.lagreAnmodningsperioderHandler}
        oppdaterOgLagreBehandlingerHandler={props.oppdaterOgLagreBehandlingerHandler}
        lagreAllData={props.lagreAllData}
        oppdaterLokalSoknadHandler={oppdaterLokalSoknadHandler}
        begrunnelser={MKV.KTObjects.begrunnelser}
        landkoder={MKV.KTObjects.landkoder}
        tilForsiden={tilForsiden}
        visValideringModalDialogHandle={visValideringModalDialogHandle}
        stegMap={stegMap}
      />
      }
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
        <Inntekt />
        <Kontantytelser />
      </form>
    </Fragment>
  );
};

Saksopplysninger.propTypes = {
  redigerbart: PT.bool,
  behandlingID: PT.number.isRequired,
  alleRelevantePersoner: PT.arrayOf(MPT.Behandlinger.Saksopplysninger.Person),
  avklartefakta: MPT.AvklartefaktaListe.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  fagsakStatusKode: PT.string.isRequired,
  fagsaker: MPT.Fagsak.isRequired,
  handleSubmit: PT.func.isRequired,
  match: PT.object.isRequired,
  medlemskap: MPT.Medlemskap,
  oppdaterBehandlingsgrunnlag: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  sjekkOppfriskningStatus: PT.func.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person,
  sendBehandlingsgrunnlag: PT.func.isRequired,
  behandlingsgrunnlag: MPT.Behandlingsgrunnlag,
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
  tilForsiden: PT.func.isRequired,
  visValideringModalDialogHandle: PT.func.isRequired,
  oppgittAdresseHarVerdier: PT.bool.isRequired,
};

Saksopplysninger.defaultProps = {
  redigerbart: null,
  alleRelevantePersoner: [],
  medlemskap: {},
  person: {},
  behandlingsgrunnlag: {},
  vurdering: {},
  syncErrors: {},
  inngangForm: {},
};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  fagsaker: fagsakSelectors.FagsakSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  bekreftelser: behandlingerSelectors.BekreftelserSelector(state),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagSelector(state),
  forretningsValidering: formSelectors.ForretningsValideringSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  inngangForm: formSelectors.InngangFormSelector(state),
  oppgittAdresseHarVerdier: formSelectors.SoknadOppgittAdresseHarVerdierSelector(state),
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
      yrkesaktivitetAntallLand: avklartefaktaSelectors.YrkesaktivitetAntallLand(state),
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
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  sendBehandlingsgrunnlag: (bid, dokument) => dispatch(behandlingsgrunnlagOperations.send(bid, dokument)),
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterBehandlingsgrunnlagState()),
});

const SaksopplysningerForm = reduxForm({
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

    return Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.saksopplysninger, settings)(values);
  },
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
