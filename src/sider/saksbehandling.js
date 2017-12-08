import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { validForm } from 'react-redux-form-validation';

import {
  gyldigePaneler,
  feltGrupper,
  alleFeltNavn,
  alleValideringer,
} from '../utils/panelFelter';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import Vilkarsveileder from '../felles-komponenter/vilkarsveileder/vilkarsveileder';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import Arbeidsforholdene from '../felles-komponenter/arbeidsforholdene';
import OrganisasjonerNorge from '../felles-komponenter/organisasjonerNorge';
import ArbeidsgiverUtland from '../felles-komponenter/arbeidsgiverUtland';
import OppholdUtland from '../felles-komponenter/oppholdUtland';
import Inntekt from '../felles-komponenter/inntekt';
import Permisjoner from '../felles-komponenter/permisjoner';
import Bekreftelser from '../felles-komponenter/bekreftelser';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideKommentarer from '../felles-komponenter/sideKommentarer';

import {
  hentFagsaker,
  PersonSelector,
  OrganisasjonSelector,
  MedlemskapSelector,
  ArbeidsforholdeneSelector,
  InntektSoknadenSelector,
  BekreftelserSelector,
  OppsummeringSelector,
  PermisjonerSelector,
} from '../ducks/fagsaker';

import {
  hentSoknad,
  sendSoknad,
  oppdaterSoknadState,
  SoknadSelector,
  ArbeidsinntektSelector,
  OppholdUtlandSelector,
  ArbeidsgiversBekreftelseSelector,
} from '../ducks/soknad';

import {
  SoknadenFormSelector,
} from '../ducks/form';

import './saksbehandling.css';
import '../felles-komponenter/skjema/skjema.css';

class Saksbehandling extends Component {
  static propTypes = {
    hentFagsaker: PT.func.isRequired,
    hentSoknad: PT.func.isRequired,
    sendSoknad: PT.func.isRequired,
    match: PT.object.isRequired,
    person: MPT.Person,
    organisasjoner: MPT.Organisasjoner,
    medlemskap: MPT.Medlemskap,
    arbeidsforholdene: MPT.Arbeidsforholdene,
    inntekt: MPT.Inntekt,
    bekreftelser: MPT.Bekreftelser,
    oppsummering: MPT.Oppsummering,
    permisjoner: MPT.Permisjoner,
    soknad: PT.object,
    soknadArbeidsinntekt: PT.object,
    soknadOppholdUtland: MPT.OppholdUtland,
    handleSubmit: PT.func.isRequired,
    errorSummary: PT.object,
    errorSummaryTitle: PT.string,
    soknadForm: PT.object.isRequired,
  };

  static defaultProps = {
    person: {},
    organisasjoner: [],
    medlemskap: {},
    arbeidsforholdene: [],
    inntekt: {},
    bekreftelser: [],
    oppsummering: {},
    permisjoner: [],
    soknad: {},
    soknadArbeidsinntekt: {},
    soknadOppholdUtland: {},
    errorSummary: {},
    errorSummaryTitle: '',
  };

  state = { gyldigePaneler: {} };

  componentDidMount() {
    const { snr } = this.props.match.params;
    this.props.hentFagsaker(snr);
    this.props.hentSoknad(snr);
  }

  componentWillReceiveProps(nextProps) {
    const { syncErrors } = nextProps.soknadForm;
    // Oppdaterer alle paneler og setter grønn hake dersom ingen felter
    // i panelet lenger er ugyldig (ikke validerer).
    this.setState({ gyldigePaneler: gyldigePaneler(syncErrors) });
  }

  fattVedtakHandler = () => {
    this.props.sendSoknad(this.props.soknad);
  }

  render() {
    const {
      person,
      organisasjoner,
      medlemskap,
      arbeidsforholdene,
      inntekt,
      bekreftelser,
      oppsummering,
      permisjoner,
      soknadArbeidsinntekt,
      soknadOppholdUtland,
      handleSubmit,
      errorSummary,
    } = this.props;

    if (!person || !person.fnr) {
      return null;
    }

    return (
      <div className="saksbehandling">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <form name="soknad" id="soknad" onSubmit={handleSubmit}>
                <Vilkarsveileder
                  person={person}
                  arbeidsforholdene={arbeidsforholdene}
                  fattVedtakHandler={this.fattVedtakHandler} />
                {errorSummary}
                {person && <Personopplysninger person={person} />}
                {permisjoner && <Permisjoner permisjoner={permisjoner} />}
                {arbeidsforholdene && <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />}
                {organisasjoner && <OrganisasjonerNorge organisasjoner={organisasjoner} />}
                <OppholdUtland oppholdUtland={soknadOppholdUtland} />
                <ArbeidsgiverUtland />
                {medlemskap && <Medlemskap medlemskap={medlemskap} />}
                {inntekt && <Inntekt inntekt={inntekt} soknadArbeidsinntekt={soknadArbeidsinntekt} />}
                {bekreftelser && <Bekreftelser bekreftelser={bekreftelser} erValidert={this.state.gyldigePaneler.bekreftelser} />}
                <Tilleggsopplysninger />
              </form>
            </Nav.Column>
            <Nav.Column xs="5">
              {oppsummering && <SideOppsummering oppsummering={oppsummering} />}
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
  person: PersonSelector(state),
  organisasjoner: OrganisasjonSelector(state),
  medlemskap: MedlemskapSelector(state),
  arbeidsforholdene: ArbeidsforholdeneSelector(state),
  inntekt: InntektSoknadenSelector(state),
  bekreftelser: BekreftelserSelector(state),
  oppsummering: OppsummeringSelector(state),
  permisjoner: PermisjonerSelector(state),
  soknad: SoknadSelector(state),
  soknadForm: SoknadenFormSelector(state),
  soknadArbeidsinntekt: ArbeidsinntektSelector(state),
  soknadOppholdUtland: OppholdUtlandSelector(state),
  initialValues: {
    inntektNorskIPerioden: ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaeringIPerioden: ArbeidsinntektSelector(state).inntektNaeringIPerioden,
    arbeidsgiverBekrefterUtsendelse: ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBekrefterUtsendelse,
    arbeidstakerAnsattUnderUtsendelsen: ArbeidsgiversBekreftelseSelector(state).arbeidstakerAnsattUnderUtsendelsen,
    erstatterArbeidstakerenUtsendte: ArbeidsgiversBekreftelseSelector(state).erstatterArbeidstakerenUtsendte,
    arbeidstakerTidligereUtsendt24Mnd: ArbeidsgiversBekreftelseSelector(state).arbeidstakerTidligereUtsendt24Mnd,
    arbeidsgiverBetalerArbeidsgiveravgift: ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBetalerArbeidsgiveravgift,
    trygdeavgiftTrukketGjennomSkatt: ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkatt,
    trygdeavgiftTrukketGjennomSkattDato: ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato,
    studentIEOS: OppholdUtlandSelector(state).studentIEOS,
    studentSkole: OppholdUtlandSelector(state).studentSkole,
    studentSemester: OppholdUtlandSelector(state).studentSemester,
    studieLand: OppholdUtlandSelector(state).studieLand,
    studentFinansiering: OppholdUtlandSelector(state).studentFinansiering,
  },
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(hentFagsaker(saksnummer)),
  hentSoknad: saksnummer => dispatch(hentSoknad(saksnummer)),
  sendSoknad: dokument => dispatch(sendSoknad(dokument)),
  onSubmit: values => dispatch(oppdaterSoknadState(values)),
});

const SaksbehandlingForm = validForm({
  form: 'soknad',
  enableReinitialize: true,
  destroyOnUnmount: false,
  errorSummaryTitle: 'Følgende må vurderes eller oppgis:',
  fields: alleFeltNavn(feltGrupper),
  validate: alleValideringer(feltGrupper),
})(Saksbehandling);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksbehandlingForm));
