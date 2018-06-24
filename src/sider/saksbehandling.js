import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { reduxForm } from 'redux-form';

import * as PanelFelter from '../utils/panelFelter';
import * as Validering from '../felles-komponenter/skjema/validering';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import Vilkarsveileder from '../felles-komponenter/vilkarsveileder/vilkarsveileder';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import ArbeidsgivereNorge from '../felles-komponenter/arbeidsgivereNorge';
import UtsendendeArbeidsgiver from '../felles-komponenter/utsendendeArbeidsgiver';
import ArbeidsgiverUtland from '../felles-komponenter/arbeidsgiverUtland';
import OppholdUtland from '../felles-komponenter/oppholdUtland';
import Inntekt from '../felles-komponenter/inntektUtland';
import Bosted from '../felles-komponenter/bosted';
import Bekreftelser from '../felles-komponenter/bekreftelser';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideKommentarer from '../felles-komponenter/sideKommentarer';

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

import { boolTilStreng } from '../utils/streng';
import { formatterDatoTilNorsk } from '../utils/dato';

import { formSelectors } from '../ducks/form/';

import './saksbehandling.css';
import '../felles-komponenter/skjema/skjema.css';

class Saksbehandling extends Component {
  static propTypes = {
    hentFagsaker: PT.func.isRequired,
    hentSoknad: PT.func.isRequired,
    sendSoknad: PT.func.isRequired,
    hentFaktaavklaring: PT.func.isRequired,
    sendFaktaavklaring: PT.func.isRequired,
    hentVurdering: PT.func.isRequired,
    match: PT.object.isRequired,
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
    soknadOppholdUtland: MPT.OppholdUtland,
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
    soknadOppholdUtland: {},
    soknadArbeidNorge: {},
    errorSummary: {},
    errorSummaryTitle: '',
  };

  state = {
    gyldigePaneler: {},
  };

  componentDidMount() {
    const { snr } = this.props.match.params;
    this.props.hentFagsaker(snr).then(response => {
      const { behandlinger = [] } = response.data;
      const { oppsummering: { behandlingID } } = behandlinger[0];
      this.props.hentSoknad(behandlingID);
      this.props.hentFaktaavklaring(behandlingID);
      this.props.hentVurdering(behandlingID);
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
    const soknad = { soknadDokument: { ...this.props.soknad.soknadDokument } };
    const avklaring = { avklaring: { ...this.props.faktaavklaring } };

    if (this.props.valid) {
      this.props.sendSoknad(bid, soknad);
      this.props.sendFaktaavklaring(bid, avklaring);
    }
  }

  beOmVurdering = () => {
    const { behandlingID } = this.props.oppsummering;
    if (this.props.valid) {
      this.props.hentVurdering(behandlingID);
    }
  }

  overstyrSubmit = event => {
    event.preventDefault();

    this.props.oppdaterSoknad(this.props.soknadForm.values);
    this.props.oppdaterFaktaavklaring(this.props.soknadForm.values);
  }

  /* eslint-disable */
  lagreOgLukk = () => { alert('Ikke implementert'); }
  avslaSoknad = () => { alert('Ikke implementert'); }
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
      soknadOppholdUtland,
      soknadForm,
    } = this.props;

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
                  beOmVurderingHandler={this.beOmVurdering}
                  fattVedtakHandler={this.fattVedtakHandler} />
                {person && <Personopplysninger person={person} />}
                <Bosted erValidert={this.state.gyldigePaneler.bosted} />
                {arbeidsgivereNorge && <ArbeidsgivereNorge arbeidsgivereNorge={arbeidsgivereNorge} />}
                <UtsendendeArbeidsgiver />
                <OppholdUtland oppholdUtland={soknadOppholdUtland} soknadForm={soknadForm} />
                <ArbeidsgiverUtland />
                {medlemskap && <Medlemskap medlemskap={medlemskap} />}
                {inntekt && <Inntekt soknadArbeidsinntekt={soknadArbeidsinntekt} />}
                {bekreftelser && <Bekreftelser bekreftelser={bekreftelser} erValidert={this.state.gyldigePaneler.bekreftelser} />}
                <Tilleggsopplysninger />
              </form>
            </Nav.Column>
            <Nav.Column xs="5">
              {oppsummering && <SideOppsummering oppsummering={oppsummering} avslaSoknadHandle={this.avslaSoknad} lagreOgLukkHandle={this.lagreOgLukk} />}
              <SideDialog />
              <SideKommentarer />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
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
  soknadOppholdUtland: soknadSelectors.OppholdUtlandSelector(state),
  soknadArbeidNorge: soknadSelectors.ArbeidNorgeSelector(state),
  initialValues: {
    inntektNorskIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaeringIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektNaeringIPerioden,
    arbeidsgiverBekrefterUtsendelse: boolTilStreng(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBekrefterUtsendelse),
    arbeidstakerAnsattUnderUtsendelsen: boolTilStreng(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerAnsattUnderUtsendelsen),
    erstatterArbeidstakerenUtsendte: boolTilStreng(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).erstatterArbeidstakerenUtsendte),
    arbeidstakerTidligereUtsendt24Mnd: boolTilStreng(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerTidligereUtsendt24Mnd),
    arbeidsgiverBetalerArbeidsgiveravgift: boolTilStreng(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBetalerArbeidsgiveravgift),
    trygdeavgiftTrukketGjennomSkatt: boolTilStreng(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkatt),
    trygdeavgiftTrukketGjennomSkattDato: formatterDatoTilNorsk(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato),
    oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
    oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
    forutgaendeBostedINorge: boolTilStreng(soknadSelectors.OppholdUtlandSelector(state).forutgaendeBostedINorge),
    sammeAdresseSomArbeidsgiver: boolTilStreng(soknadSelectors.OppholdUtlandSelector(state).sammeAdresseSomArbeidsgiver),
    ektefelleEllerBarn: boolTilStreng(soknadSelectors.OppholdUtlandSelector(state).ektefelleEllerBarn),
    studentSemester: soknadSelectors.OppholdUtlandSelector(state).studentSemester,
    studieLand: soknadSelectors.OppholdUtlandSelector(state).studieLand,
    studentFinansiering: soknadSelectors.OppholdUtlandSelector(state).studentFinansiering,
    intensjonOmRetur: boolTilStreng(soknadSelectors.BostedSelector(state).intensjonOmRetur),
    familiesBosted: soknadSelectors.BostedSelector(state).familiesBosted,
    antallMaanederINorge: soknadSelectors.BostedSelector(state).antallMaanederINorge,
    kontaktNavn: soknadSelectors.ArbeidNorgeSelector(state).kontaktNavn,
    kontaktEpost: soknadSelectors.ArbeidNorgeSelector(state).kontaktEpost,
    fullmektigFirma: soknadSelectors.ArbeidNorgeSelector(state).fullmektigFirma,
    fullmektigAdresse: soknadSelectors.ArbeidNorgeSelector(state).fullmektigAdresse,
    faktaavklaringOppholdsLand: faktaavklaringSelectors.FaktaavklaringOppholdSelector(state).land,
    faktaavklaringPeriodeFraOgMed: formatterDatoTilNorsk(faktaavklaringSelectors.FaktaavklaringOppholdPeriodeSelector(state).fom),
    faktaavklaringPeriodeTilOgMed: formatterDatoTilNorsk(faktaavklaringSelectors.FaktaavklaringOppholdPeriodeSelector(state).tom),
    faktaavklaringSysselsettingType: faktaavklaringSelectors.FaktaavklaringSysselsettingSelector(state).sysselsettingType,
    faktaavklaringAnsattINorskSelskap: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).ansattINorskSelskap,
    faktaavklaringErstatterTidligereUtsendt: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).erstatterTidligereUtsendt,
    faktaavklaringUtsendingMindreEnn24Mnd: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).utsendingMindreEnn24Mnd,
    faktaavklaringForetakDriverINorge: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).foretakDriverINorge,
    faktaavklaringHarForutgaendeMedlemskap: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).harForutgaendeMedlemskap,
    faktaavklaringArbeidKnyttetTilVirksomhetUtlandet: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).arbeidKnyttetTilVirksomhetUtlandet,
    faktaavklaringSammeTypeVirksomhet: faktaavklaringSelectors.FaktaavklaringUtsendingSelector(state).sammeTypeVirksomhet,
    faktaavklaringAnsattISektor: faktaavklaringSelectors.FaktaavklaringSektorSelector(state).ansattISektor,
    faktaavklaringAntallLand: faktaavklaringSelectors.FaktaavklaringYrkesaktivitetFordelingSelector(state).antallLand,
    faktaavklaringAktivitetINorge: faktaavklaringSelectors.FaktaavklaringVirksomhetSelector(state).aktivitetINorge,
    faktaavklaringMarginaltArbeid: faktaavklaringSelectors.FaktaavklaringVirksomhetSelector(state).marginaltArbeid,
    faktaavklaringVekslingMellomLand: faktaavklaringSelectors.FaktaavklaringVirksomhetSelector(state).vekslingMellomLand,
    faktaavklaringAktivitetLand: faktaavklaringSelectors.FaktaavklaringAktivitetSelector(state).aktivitetLand,
    faktaavklaringBostedslandSnarvei: faktaavklaringSelectors.FaktaavklaringBostedSnarveiSelector(state),
    faktaavklaringBostedsland: faktaavklaringSelectors.FaktaavklaringBostedSelector(state).land,
    faktaavklaringTjenestemann: faktaavklaringSelectors.FaktaavklaringTjenestemannSelector(state).tjenestemann,
    faktaavklaringValgteArbeidsforhold: faktaavklaringSelectors.FaktaavklaringValgteArbeidsforholdSelector(state),
    faktaavklaringForretningsstedLand: faktaavklaringSelectors.FaktaavklaringForretningsstedSelector(state).land,
    faktaavklaringForretningsstedAntallArbeidsgivere: faktaavklaringSelectors.FaktaavklaringForretningsstedSelector(state).antallArbeidsgivere,
    faktaavklaringForretningsstedFordelingArbeidsgivere: faktaavklaringSelectors.FaktaavklaringForretningsstedSelector(state).fordelingArbeidsgivere,
  },
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
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
  updateUnregisteredFields: true,
  fields: PanelFelter.alleFeltNavn(PanelFelter.feltGrupper),
  validate: (values, props) => Validering.Felles.byggValidering(values, props),
})(Saksbehandling);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksbehandlingForm));
