import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { reduxForm } from 'redux-form';

import * as Validering from '../felles-komponenter/skjema/validering';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import ArbeidsgivereNorge from '../felles-komponenter/arbeidsgivereNorge';
import ArbeidUtland from '../felles-komponenter/arbeidUtland';
import Bekreftelser from '../felles-komponenter/bekreftelser';
import Bosted from '../felles-komponenter/bosted';
import Inntekt from '../felles-komponenter/inntektUtland';
import Medlemskap from '../felles-komponenter/medlemskap';
import OppholdUtland from '../felles-komponenter/oppholdUtland';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import ForetakUtland from '../felles-komponenter/foretakUtland';
import MaritimtArbeid from '../felles-komponenter/maritimtArbeid';
import SelvstendigArbeid from '../felles-komponenter/selvstendigArbeid';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideKommentarer from '../felles-komponenter/sideKommentarer';
import UtsendendeArbeidsgiver from '../felles-komponenter/utsendendeArbeidsgiver';
import Stegvelger from '../felles-komponenter/stegvelger/index';
import VirksomhetNorge from '../felles-komponenter/virksomhetNorge';

import {
  fagsakOperations,
  fagsakSelectors,
} from '../ducks/fagsaker/';

import {
  soknadOperations,
  soknadActions,
  soknadSelectors,
} from '../ducks/soknad/';

import {
  avklartefaktaOperations,
  avklartefaktaActions,
  avklartefaktaSelectors,
} from '../ducks/avklartefakta/';

import { vilkarSelectors } from '../ducks/vilkar';

import { formatterDatoTilNorsk } from '../utils/dato';

import { formSelectors } from '../ducks/form/';
import Dialogboks from '../felles-komponenter/dialogboks';

import './saksbehandling.css';
import '../felles-komponenter/skjema/skjema.css';

class Saksbehandling extends Component {
  static propTypes = {
    arbeidsgivereNorge: MPT.ArbeidsgivereNorge,
    avklartefakta: PT.object,
    bekreftelser: MPT.Bekreftelser,
    handleSubmit: PT.func.isRequired,
    hentFagsaker: PT.func.isRequired,
    hentSoknad: PT.func.isRequired,
    hentAvklartefakta: PT.func.isRequired,
    history: PT.object.isRequired,
    inntekt: MPT.Inntekt,
    match: PT.object.isRequired,
    medlemskap: MPT.Medlemskap,
    oppdaterAvklartefakta: PT.func.isRequired,
    oppdaterSoknad: PT.func.isRequired,
    oppfriskFagsaker: PT.func.isRequired,
    oppsummering: MPT.Oppsummering,
    person: MPT.Person,
    sendSoknad: PT.func.isRequired,
    sendAvklartefakta: PT.func.isRequired,
    soknad: PT.object,
    soknadArbeidsinntekt: PT.object,
    soknadForm: PT.object.isRequired,
    valid: PT.bool.isRequired,
    vilkar: PT.array,
  };

  static defaultProps = {
    arbeidsgivereNorge: [],
    avklartefakta: {},
    bekreftelser: [],
    inntekt: {},
    medlemskap: {},
    oppsummering: {},
    person: {},
    soknad: {},
    soknadArbeidsinntekt: {},
    vilkar: [],
  };

  state = {
    gyldigePaneler: {},
    visOppfriskDialog: false,
  };

  async componentDidMount() {
    const { hentFagsaker, hentSoknad, hentAvklartefakta } = this.props;
    const { snr } = this.props.match.params;
    const response = await hentFagsaker(snr);
    const { behandlinger } = response.data;
    if (!behandlinger) return false;
    const { oppsummering: { behandlingID } } = behandlinger[0];
    await hentSoknad(behandlingID);
    await hentAvklartefakta(behandlingID);
    return true;
  }

  componentWillReceiveProps(nextProps) {
    const { syncErrors } = nextProps.soknadForm;

    // Oppdaterer alle paneler og setter grønn hake dersom ingen felter
    // i panelet lenger er ugyldig (ikke validerer).
    this.setState({ gyldigePaneler: Validering.Felles.gyldigePaneler(syncErrors) });
  }

  fattVedtakHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const soknad = { soeknadDokument: { ...this.props.soknad.soeknadDokument } };
    const avklaring = { avklaring: { ...this.props.avklartefakta } };
    const { valid, sendSoknad, sendAvklartefakta } = this.props;
    if (valid) {
      await sendSoknad(bid, soknad);
      await sendAvklartefakta(bid, avklaring);
    }
  };

  lagreAvklartefaktaHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const avklaring = { behandlingID: bid, avklaring: { ...this.props.avklartefakta } };
    const { valid, sendAvklartefakta } = this.props;
    if (valid) {
      await sendAvklartefakta(bid, avklaring);
    }
  };

  overstyrSubmit = async event => {
    event.preventDefault();

    const { oppdaterSoknad, oppdaterAvklartefakta, soknadForm } = this.props;
    await oppdaterSoknad(soknadForm.values);
    await oppdaterAvklartefakta(soknadForm.values);
  };

  oppfriskSaksopplysninger = async () => {
    const { oppfriskFagsaker } = this.props;
    const { behandlingID } = this.props.oppsummering;
    const response = await oppfriskFagsaker(behandlingID);
    if (response.ok) {
      this.skjulOppfriskBekreftelse();
      this.props.history.push('/');
    }
  };

  visOppfriskBekreftelse = () => {
    this.setState({ visOppfriskDialog: true });
  };

  skjulOppfriskBekreftelse = () => {
    this.setState({ visOppfriskDialog: false });
  };

  /* eslint-disable */
  lagreOgLukk = () => { alert('Ikke implementert'); };
  /* eslint-enable */

  render() {
    const {
      person,
      medlemskap,
      arbeidsgivereNorge,
      inntekt,
      bekreftelser,
      oppsummering,
      soknadArbeidsinntekt,
      soknadForm,
    } = this.props;

    const { values: soknadVerdier } = soknadForm;

    if (!soknadVerdier) return null;

    if (!person || !person.fnr) {
      return null;
    }

    return (
      <div className="saksbehandling">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <form name="soknad" id="soknad" onSubmit={this.overstyrSubmit}>
                <Stegvelger
                  lagreVedtakHandler={this.lagreVedtakHandler}
                  lagreAvklartefaktaHandler={this.lagreAvklartefaktaHandler}
                />
                {person && <Personopplysninger person={person} />}
                <Bosted erValidert={this.state.gyldigePaneler.bosted} />
                {arbeidsgivereNorge && <ArbeidsgivereNorge arbeidsgivereNorge={arbeidsgivereNorge} />}
                <SelvstendigArbeid soknadVerdier={soknadVerdier} />
                <UtsendendeArbeidsgiver soknadVerdier={soknadVerdier} />
                <ArbeidUtland />
                <ForetakUtland />
                <VirksomhetNorge />
                <MaritimtArbeid soknadVerdier={soknadVerdier} />
                {medlemskap && <Medlemskap medlemskap={medlemskap} />}
                {inntekt && <Inntekt soknadArbeidsinntekt={soknadArbeidsinntekt} />}
                {bekreftelser && <Bekreftelser bekreftelser={bekreftelser} erValidert={this.state.gyldigePaneler.bekreftelser} />}
                <OppholdUtland />
              </form>
            </Nav.Column>
            <Nav.Column xs="5">
              <SideOppsummering
                oppsummering={oppsummering}
                oppfriskSaksopplysningerHandle={this.visOppfriskBekreftelse}
                lagreOgLukkHandle={this.lagreOgLukk}
              />
              <SideDialog />
              <SideKommentarer />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
        <Dialogboks
          tittel="Vil du oppdatere registeropplysninger?"
          tekst="Oppdatering av registeropplysning kan ta noe tid. Du vil derfor bli sendt tilbake til oppgavelisten hvor du kan journalføre eller behandle en annen sak i mellomtiden."
          bekreft={this.oppfriskSaksopplysninger}
          avbryt={this.skjulOppfriskBekreftelse}
          synlig={this.state.visOppfriskDialog}
        />
      </div>
    );
  }
}

/** Mapper både fast tekst inn til de forskjellige panelene i tillegg til å
 * mappe verdier fra søknaden (soknad) ut til Redux Form via initialValue.
 * @param state
 */
const mapStateToProps = state => ({
  person: fagsakSelectors.PersonSelector(state),
  medlemskap: fagsakSelectors.MedlemskapSelector(state),
  arbeidsgivereNorge: fagsakSelectors.ArbeidsgivereNorgeSelector(state),
  inntekt: fagsakSelectors.InntektSoknadenSelector(state),
  bekreftelser: fagsakSelectors.BekreftelserSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
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
    oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
    oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
    oppholdsland: soknadSelectors.OppholdUtlandSelector(state).oppholdslandKoder,
    forutgaendeBostedINorge: soknadSelectors.OppholdUtlandSelector(state).harForutgaendeBostedINorge,
    arbeidUtland: soknadSelectors.ArbeidUtlandSelector(state),
    sammeAdresseSomArbeidsgiver: soknadSelectors.OppholdUtlandSelector(state).sammeAdresseSomArbeidsgiver,
    ektefelleEllerBarnINorge: soknadSelectors.OppholdUtlandSelector(state).harEktefelleEllerBarnINorge,
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
    avklartefaktaBostedLand: avklartefaktaSelectors.AvklartefaktaBostedSelector(state).bostedLand,
    avklartefaktaBostedNorgeUtland: avklartefaktaSelectors.AvklartefaktaBostedNorgeUtlandSelector(state),
    avklartefaktaOppholdsLand: avklartefaktaSelectors.AvklartefaktaOppholdSelector(state).land,
    avklartefaktaPeriodeFraOgMed: formatterDatoTilNorsk(avklartefaktaSelectors.AvklartefaktaOppholdPeriodeSelector(state).fom),
    avklartefaktaPeriodeTilOgMed: formatterDatoTilNorsk(avklartefaktaSelectors.AvklartefaktaOppholdPeriodeSelector(state).tom),
    avklartefaktaSysselsettingType: avklartefaktaSelectors.AvklartefaktaSysselsettingSelector(state).sysselsettingType,
    avklartefaktaIkkeYrkesaktivType: avklartefaktaSelectors.AvklartefaktaIkkeYrkesaktivSelector(state).ikkeYrkesaktivType,
    avklartefaktaAnsattINorskSelskap: avklartefaktaSelectors.AvklartefaktaUtsendingSelector(state).ansattINorskSelskap,
    avklartefaktaErstatterTidligereUtsendt: avklartefaktaSelectors.AvklartefaktaUtsendingSelector(state).erstatterTidligereUtsendt,
    avklartefaktaUtsendingMindreEnn24Mnd: avklartefaktaSelectors.AvklartefaktaUtsendingSelector(state).utsendingMindreEnn24Mnd,
    avklartefaktaForetakDriverINorge: avklartefaktaSelectors.AvklartefaktaUtsendingSelector(state).foretakDriverINorge,
    avklartefaktaForutgaendeMedlemskapBegrunnelser: avklartefaktaSelectors.AvklartefaktaForutgaendeMedlemskapSelector(state).forutgaendeMedlemskapBegrunnelser,
    avklartefaktaArbeidKnyttetTilVirksomhetUtlandet: avklartefaktaSelectors.AvklartefaktaUtsendingSelector(state).arbeidKnyttetTilVirksomhetUtlandet,
    avklartefaktaSammeTypeVirksomhet: avklartefaktaSelectors.AvklartefaktaUtsendingSelector(state).sammeTypeVirksomhet,
    avklartefaktaYrkesaktivitetType: avklartefaktaSelectors.AvklartefaktaYrkesaktivitetSelector(state).yrkesaktivitetType,
    avklartefaktaAntallLand: avklartefaktaSelectors.AvklartefaktaYrkesaktivitetFordelingSelector(state).antallLand,
    avklartefaktaAktivitetINorge: avklartefaktaSelectors.AvklartefaktaVirksomhetSelector(state).aktivitetINorge,
    avklartefaktaMarginaltArbeid: avklartefaktaSelectors.AvklartefaktaVirksomhetSelector(state).marginaltArbeid,
    avklartefaktaVekslingMellomLand: avklartefaktaSelectors.AvklartefaktaVirksomhetSelector(state).vekslingMellomLand,
    avklartefaktaAktivitetLand: avklartefaktaSelectors.AvklartefaktaAktivitetSelector(state).aktivitetLand,
    avklartefaktaTjenestemann: avklartefaktaSelectors.AvklartefaktaTjenestemannSelector(state).tjenestemann,
    avklartefaktaValgteArbeidsgivere: avklartefaktaSelectors.AvklartefaktaValgteArbeidsgivereSelector(state),
    vilkar: {
      vesentligVirksomhet: (vilkarSelectors.vesentligVirksomhetSelector(state).oppfylt),
      vesentligVirksomhetBegrunnelser: (vilkarSelectors.vesentligVirksomhetSelector(state).begrunnelseKoder),
      forutgaendeMedlemskap: (vilkarSelectors.forutgaendeMedlemskap(state).oppfylt),
      forutgaendeMedlemskapBegrunnelser: (vilkarSelectors.forutgaendeMedlemskap(state).begrunnelseKoder),
      bosattINorge: (vilkarSelectors.bosattINorge(state).oppfylt),
      bosattINorgeBegrunnelser: (vilkarSelectors.bosattINorge(state).begrunnelseKoder),
    },
    avklartefaktaForretningsstedLand: avklartefaktaSelectors.AvklartefaktaForretningsstedSelector(state).land,
    avklartefaktaForretningsstedAntallArbeidsgivere: avklartefaktaSelectors.AvklartefaktaForretningsstedSelector(state).antallArbeidsgivere,
    avklartefaktaForretningsstedFordelingArbeidsgivere: avklartefaktaSelectors.AvklartefaktaForretningsstedSelector(state).fordelingArbeidsgivere,
    vurderingLovvalg: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
    vurderingBegrunnelser: avklartefaktaSelectors.AvklartefaktaVurderingSelector(state).begrunnelser,
  },
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  oppfriskFagsaker: saksnummer => fagsakOperations.oppfrisk(saksnummer),
  hentSoknad: bid => dispatch(soknadOperations.hent(bid)),
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  hentAvklartefakta: saksnummer => dispatch(avklartefaktaOperations.hent(saksnummer)),
  sendAvklartefakta: (bid, dokument) => dispatch(avklartefaktaOperations.send(bid, dokument)),
  oppdaterSoknad: values => { dispatch(soknadActions.oppdaterSoknadState(values)); },
  oppdaterAvklartefakta: values => { dispatch(avklartefaktaActions.oppdaterAvklartefaktaState(values)); },
});

const SaksbehandlingForm = reduxForm({
  form: 'soknad',
  enableReinitialize: true,
  destroyOnUnmount: false,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Felles.byggValidering(values, props),
})(Saksbehandling);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksbehandlingForm));
