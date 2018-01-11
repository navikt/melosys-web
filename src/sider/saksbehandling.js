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
import UtsendendeArbeidsgiver from '../felles-komponenter/utsendendeArbeidsgiver';
import ArbeidsgiverUtland from '../felles-komponenter/arbeidsgiverUtland';
import OppholdUtland from '../felles-komponenter/oppholdUtland';
import Inntekt from '../felles-komponenter/inntekt';
import Bekreftelser from '../felles-komponenter/bekreftelser';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideKommentarer from '../felles-komponenter/sideKommentarer';

import {
  hentFagsaker,
  PersonSelector,
  MedlemskapSelector,
  ArbeidsforholdeneSelector,
  InntektSoknadenSelector,
  BekreftelserSelector,
  OppsummeringSelector,
} from '../ducks/fagsaker';

import {
  hentSoknad,
  sendSoknad,
  oppdaterSoknadState,
  SoknadSelector,
  ArbeidsinntektSelector,
  ArbeidNorgeSelector,
  OppholdUtlandSelector,
  ArbeidsgiversBekreftelseSelector,
} from '../ducks/soknad';

import {
  hentFaktaavklaring,
  sendFaktaavklaring,
} from '../ducks/faktaavklaring';

import {
  hentVurdering,
} from '../ducks/vurdering';

import { boolTilStreng } from '../utils/utils';

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
    hentFaktaavklaring: PT.func.isRequired,
    hentVurdering: PT.func.isRequired,
    match: PT.object.isRequired,
    person: MPT.Person,
    medlemskap: MPT.Medlemskap,
    arbeidsforholdene: MPT.Arbeidsforholdene,
    inntekt: MPT.Inntekt,
    bekreftelser: MPT.Bekreftelser,
    oppsummering: MPT.Oppsummering,
    soknad: PT.object,
    soknadArbeidsinntekt: PT.object,
    soknadOppholdUtland: MPT.OppholdUtland,
    soknadArbeidNorge: MPT.ArbeidNorge,
    handleSubmit: PT.func.isRequired,
    errorSummary: PT.object,
    errorSummaryTitle: PT.string,
    soknadForm: PT.object.isRequired,
  };

  static defaultProps = {
    person: {},
    medlemskap: {},
    arbeidsforholdene: [],
    inntekt: {},
    bekreftelser: [],
    oppsummering: {},
    soknad: {},
    soknadArbeidsinntekt: {},
    soknadOppholdUtland: {},
    soknadArbeidNorge: {},
    errorSummary: {},
    errorSummaryTitle: '',
  };

  state = {
    gyldigePaneler: {},
    hentetSoknad: false,
    hentetFaktaavklaring: false,
    hentetVurdering: false,
  };

  componentDidMount() {
    const { snr } = this.props.match.params;
    this.props.hentFagsaker(snr);
  }

  componentWillReceiveProps(nextProps) {
    const { syncErrors } = nextProps.soknadForm;
    const { behandlingID } = nextProps.oppsummering;
    // Oppdaterer alle paneler og setter grønn hake dersom ingen felter
    // i panelet lenger er ugyldig (ikke validerer).
    this.setState({ gyldigePaneler: gyldigePaneler(syncErrors) });

    if (behandlingID && !this.state.hentetSoknad) {
      this.props.hentSoknad(behandlingID);
      this.setState({ hentetSoknad: true });
    }

    if (behandlingID && !this.state.hentetFaktaavklaring) {
      this.props.hentFaktaavklaring(behandlingID);
      this.setState({ hentetFaktaavklaring: true });
    }

    if (behandlingID && !this.state.hentetVurdering) {
      this.props.hentVurdering(behandlingID);
      this.setState({ hentetVurdering: true });
    }
  }

  fattVedtakHandler = () => {
    this.props.sendSoknad(this.props.soknad);
  }

  /* eslint-disable */
  lagreOgLukk = () => { alert('Ikke implementert'); }
  avslaSoknad = () => { alert('Ikke implementert'); }
  /* eslint-enable */

  render() {
    const {
      person,
      medlemskap,
      arbeidsforholdene,
      inntekt,
      bekreftelser,
      oppsummering,
      soknadArbeidsinntekt,
      soknadOppholdUtland,
      handleSubmit,
      errorSummary,
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
              <form name="soknad" id="soknad" onSubmit={handleSubmit}>
                <Vilkarsveileder
                  person={person}
                  arbeidsforholdene={arbeidsforholdene}
                  fattVedtakHandler={this.fattVedtakHandler} />
                {errorSummary}
                {person && <Personopplysninger person={person} />}
                {arbeidsforholdene && <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />}
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
  person: PersonSelector(state),
  medlemskap: MedlemskapSelector(state),
  arbeidsforholdene: ArbeidsforholdeneSelector(state),
  inntekt: InntektSoknadenSelector(state),
  bekreftelser: BekreftelserSelector(state),
  oppsummering: OppsummeringSelector(state),
  soknad: SoknadSelector(state),
  soknadForm: SoknadenFormSelector(state),
  soknadArbeidsinntekt: ArbeidsinntektSelector(state),
  soknadOppholdUtland: OppholdUtlandSelector(state),
  soknadArbeidNorge: ArbeidNorgeSelector(state),
  initialValues: {
    inntektNorskIPerioden: ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaeringIPerioden: ArbeidsinntektSelector(state).inntektNaeringIPerioden,
    arbeidsgiverBekrefterUtsendelse: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBekrefterUtsendelse),
    arbeidstakerAnsattUnderUtsendelsen: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).arbeidstakerAnsattUnderUtsendelsen),
    erstatterArbeidstakerenUtsendte: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).erstatterArbeidstakerenUtsendte),
    arbeidstakerTidligereUtsendt24Mnd: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).arbeidstakerTidligereUtsendt24Mnd),
    arbeidsgiverBetalerArbeidsgiveravgift: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBetalerArbeidsgiveravgift),
    trygdeavgiftTrukketGjennomSkatt: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkatt),
    trygdeavgiftTrukketGjennomSkattDato: ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato,
    studentIEOS: OppholdUtlandSelector(state).studentIEOS,
    studentSkole: OppholdUtlandSelector(state).studentSkole,
    studentSemester: OppholdUtlandSelector(state).studentSemester,
    studieLand: OppholdUtlandSelector(state).studieLand,
    studentFinansiering: OppholdUtlandSelector(state).studentFinansiering,
    kontaktNavn: ArbeidNorgeSelector(state).kontaktNavn,
    kontaktEpost: ArbeidNorgeSelector(state).kontaktEpost,
    fullmektigFirma: ArbeidNorgeSelector(state).fullmektigFirma,
    fullmektigAdresse: ArbeidNorgeSelector(state).fullmektigAdresse,
    valgteArbeidsforhold: ArbeidNorgeSelector(state).valgteArbeidsforhold,
  },
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(hentFagsaker(saksnummer)),
  hentSoknad: saksnummer => dispatch(hentSoknad(saksnummer)),
  sendSoknad: dokument => dispatch(sendSoknad(dokument)),
  hentFaktaavklaring: saksnummer => dispatch(hentFaktaavklaring(saksnummer)),
  sendFaktaavklaring: dokument => dispatch(sendFaktaavklaring(dokument)),
  hentVurdering: behandlingID => dispatch(hentVurdering(behandlingID)),
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
