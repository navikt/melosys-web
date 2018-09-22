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
import Vilkarsveileder from '../felles-komponenter/vilkarsveileder/vilkarsveileder';
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
  faktaavklaringOperations,
  faktaavklaringActions,
  faktaavklaringSelectors,
} from '../ducks/faktaavklaring/';

import {
  vurderingOperations,
  vurderingSelectors,
} from '../ducks/vurdering/';

import { formatterDatoTilNorsk } from '../utils/dato';

import { formSelectors } from '../ducks/form/';
import Dialogboks from '../felles-komponenter/dialogboks';

import './saksbehandling.css';
import '../felles-komponenter/skjema/skjema.css';

class Saksbehandling extends Component {
  static propTypes = {
    hentFagsaker: PT.func.isRequired,
    oppfriskFagsaker: PT.func.isRequired,
    hentSoknad: PT.func.isRequired,
    sendSoknad: PT.func.isRequired,
    hentFaktaavklaring: PT.func.isRequired,
    sendFaktaavklaring: PT.func.isRequired,
    hentVurdering: PT.func.isRequired,
    match: PT.object.isRequired,
    history: PT.object.isRequired,
    person: MPT.Person,
    medlemskap: MPT.Medlemskap,
    arbeidsgivereNorge: MPT.ArbeidsgivereNorge,
    inntekt: MPT.Inntekt,
    vurdering: PT.object,
    bekreftelser: MPT.Bekreftelser,
    oppsummering: MPT.Oppsummering,
    soknad: PT.object,
    finansiering: PT.arrayOf(MPT.Kodeverk),
    faktaavklaring: PT.object,
    soknadArbeidsinntekt: PT.object,
    soknadArbeidNorge: MPT.ArbeidNorge,
    handleSubmit: PT.func.isRequired,
    errorSummary: PT.object,
    errorSummaryTitle: PT.string,
    soknadForm: PT.object.isRequired,
    oppdaterSoknad: PT.func.isRequired,
    oppdaterFaktaavklaring: PT.func.isRequired,
    valid: PT.bool.isRequired,
  };

  static defaultProps = {
    person: {},
    medlemskap: {},
    arbeidsgivereNorge: [],
    inntekt: {},
    vurdering: {},
    bekreftelser: [],
    oppsummering: {},
    soknad: {},
    finansiering: [],
    faktaavklaring: {},
    soknadArbeidsinntekt: {},
    soknadArbeidNorge: {},
    errorSummary: {},
    errorSummaryTitle: '',
  };

  state = {
    gyldigePaneler: {},
    visOppfriskDialog: false,
  };

  componentDidMount() {
    const { snr } = this.props.match.params;
    this.props.hentFagsaker(snr).then(response => {
      const { behandlinger } = response.data;
      if (!behandlinger) return false;
      const { oppsummering: { behandlingID } } = behandlinger[0];
      this.props.hentSoknad(behandlingID);
      this.props.hentFaktaavklaring(behandlingID);
      return true;
    });
  }

  componentWillReceiveProps(nextProps) {
    const { syncErrors } = nextProps.soknadForm;

    // Oppdaterer alle paneler og setter grønn hake dersom ingen felter
    // i panelet lenger er ugyldig (ikke validerer).
    this.setState({ gyldigePaneler: Validering.Felles.gyldigePaneler(syncErrors) });
  }

  fattVedtakHandler = () => {
    const bid = this.props.oppsummering.behandlingID;
    const soknad = { soeknadDokument: { ...this.props.soknad.soeknadDokument } };
    const avklaring = { avklaring: { ...this.props.faktaavklaring } };

    if (this.props.valid) {
      this.props.sendSoknad(bid, soknad);
      this.props.sendFaktaavklaring(bid, avklaring);
    }
  };

  overstyrSubmit = event => {
    event.preventDefault();

    this.props.oppdaterSoknad(this.props.soknadForm.values);
    this.props.oppdaterFaktaavklaring(this.props.soknadForm.values);
  };

  oppfriskSaksopplysninger = () => {
    const { behandlingID } = this.props.oppsummering;

    this.props.oppfriskFagsaker(behandlingID).then(response => {
      if (response.ok) {
        this.skjulOppfriskBekreftelse();
        this.props.history.push('/');
      }
    });
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
                <Vilkarsveileder
                  beOmVurderingHandler={() => {
                    /* eslint no-alert:off */
                    alert('Ikke implementert');
                  }}
                  fattVedtakHandler={this.fattVedtakHandler} />
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
  vurdering: vurderingSelectors.VurderingSelector(state),
  bekreftelser: fagsakSelectors.BekreftelserSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  faktaavklaring: faktaavklaringSelectors.FaktaavklaringSelector(state),
  forretningsValidering: formSelectors.ForretningsValideringSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  soknadArbeidsinntekt: soknadSelectors.ArbeidsinntektSelector(state),
  soknadArbeidNorge: soknadSelectors.ArbeidNorgeSelector(state),
  initialValues: {
    utenlandskID: soknadSelectors.PersonOpplysningerSelector(state).utenlandskID,
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
    faktaavklaringBostedLand: faktaavklaringSelectors.FaktaavklaringBostedSelector(state).bostedLand,
    faktaavklaringBostedBegrunnelser: faktaavklaringSelectors.FaktaavklaringBostedSelector(state).bostedBegrunnelser,
    faktaavklaringBostedNorgeUtland: faktaavklaringSelectors.FaktaavklaringBostedNorgeUtlandSelector(state),
    faktaavklaringOppholdsLand: faktaavklaringSelectors.FaktaavklaringOppholdSelector(state).land,
    faktaavklaringPeriodeFraOgMed: formatterDatoTilNorsk(faktaavklaringSelectors.FaktaavklaringOppholdPeriodeSelector(state).fom),
    faktaavklaringPeriodeTilOgMed: formatterDatoTilNorsk(faktaavklaringSelectors.FaktaavklaringOppholdPeriodeSelector(state).tom),
    faktaavklaringSysselsettingType: faktaavklaringSelectors.FaktaavklaringSysselsettingSelector(state).sysselsettingType,
    faktaavklaringIkkeYrkesaktivType: faktaavklaringSelectors.FaktaavklaringIkkeYrkesaktivSelector(state).ikkeYrkesaktivType,
    faktaavklaringAnsattINorskSelskap: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).ansattINorskSelskap,
    faktaavklaringErstatterTidligereUtsendt: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).erstatterTidligereUtsendt,
    faktaavklaringUtsendingMindreEnn24Mnd: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).utsendingMindreEnn24Mnd,
    faktaavklaringForetakDriverINorge: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).foretakDriverINorge,
    faktaavklaringHarForutgaendeMedlemskap: faktaavklaringSelectors.FaktaavklaringForutgaendeMedlemskapSelector(state).harForutgaendeMedlemskap,
    faktaavklaringForutgaendeMedlemskapBegrunnelser: faktaavklaringSelectors.FaktaavklaringForutgaendeMedlemskapSelector(state).forutgaendeMedlemskapBegrunnelser,
    faktaavklaringArbeidKnyttetTilVirksomhetUtlandet: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).arbeidKnyttetTilVirksomhetUtlandet,
    faktaavklaringSammeTypeVirksomhet: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).sammeTypeVirksomhet,
    faktaavklaringYrkesaktivitetType: faktaavklaringSelectors.FaktaavklaringYrkesaktivitetSelector(state).yrkesaktivitetType,
    faktaavklaringAntallLand: faktaavklaringSelectors.FaktaavklaringYrkesaktivitetFordelingSelector(state).antallLand,
    faktaavklaringAktivitetINorge: faktaavklaringSelectors.FaktaavklaringVirksomhetSelector(state).aktivitetINorge,
    faktaavklaringMarginaltArbeid: faktaavklaringSelectors.FaktaavklaringVirksomhetSelector(state).marginaltArbeid,
    faktaavklaringVekslingMellomLand: faktaavklaringSelectors.FaktaavklaringVirksomhetSelector(state).vekslingMellomLand,
    faktaavklaringAktivitetLand: faktaavklaringSelectors.FaktaavklaringAktivitetSelector(state).aktivitetLand,
    faktaavklaringTjenestemann: faktaavklaringSelectors.FaktaavklaringTjenestemannSelector(state).tjenestemann,
    faktaavklaringValgteArbeidsgivere: faktaavklaringSelectors.FaktaavklaringValgteArbeidsgivereSelector(state),
    faktaavklaringVesentligVirksomhetINorge: (faktaavklaringSelectors.FaktaavklaringVesentligVirksomhetSelector(state).vesentligVirksomhetINorge),
    faktaavklaringVesentligVirksomhetBegrunnelser: faktaavklaringSelectors.FaktaavklaringVesentligVirksomhetSelector(state).vesentligVirksomhetBegrunnelser,
    faktaavklaringForretningsstedLand: faktaavklaringSelectors.FaktaavklaringForretningsstedSelector(state).land,
    faktaavklaringForretningsstedAntallArbeidsgivere: faktaavklaringSelectors.FaktaavklaringForretningsstedSelector(state).antallArbeidsgivere,
    faktaavklaringForretningsstedFordelingArbeidsgivere: faktaavklaringSelectors.FaktaavklaringForretningsstedSelector(state).fordelingArbeidsgivere,
    vurderingArtikkel: faktaavklaringSelectors.FaktaavklaringVurderingSelector(state).artikkel,
    vurderingBegrunnelser: faktaavklaringSelectors.FaktaavklaringVurderingSelector(state).begrunnelser,
  },
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  oppfriskFagsaker: saksnummer => fagsakOperations.oppfrisk(saksnummer),
  hentSoknad: bid => dispatch(soknadOperations.hent(bid)),
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  hentFaktaavklaring: saksnummer => dispatch(faktaavklaringOperations.hent(saksnummer)),
  sendFaktaavklaring: (bid, dokument) => dispatch(faktaavklaringOperations.send(bid, dokument)),
  hentVurdering: behandlingID => dispatch(vurderingOperations.hent(behandlingID)),
  oppdaterSoknad: values => { dispatch(soknadActions.oppdaterSoknadState(values)); },
  oppdaterFaktaavklaring: values => { dispatch(faktaavklaringActions.oppdaterFaktaavklaringState(values)); },
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
