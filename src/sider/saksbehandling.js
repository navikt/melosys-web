import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { validForm } from 'react-redux-form-validation';
import * as Skjema from '../felles-komponenter/skjema';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import Vilkarsveileder from '../felles-komponenter/vilkarsveileder/vilkarsveileder';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import Arbeidsforholdene from '../felles-komponenter/arbeidsforholdene';
import OrganisasjonerNorge from '../felles-komponenter/organisasjonerNorge';
import ArbeidsgiverUtland from '../felles-komponenter/arbeidsgiverUtland';
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
  ArbeidsgiversBekreftelse,
} from '../ducks/soknad';

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
    handleSubmit: PT.func.isRequired,
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
  };

  componentDidMount() {
    const { snr } = this.props.match.params;
    this.props.hentFagsaker(snr);
    this.props.hentSoknad(snr);
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
      handleSubmit,
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
                {person && <Personopplysninger person={person} />}
                {permisjoner && <Permisjoner permisjoner={permisjoner} />}
                {arbeidsforholdene && <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />}
                {organisasjoner && <OrganisasjonerNorge organisasjoner={organisasjoner} />}
                <ArbeidsgiverUtland />
                {medlemskap && <Medlemskap medlemskap={medlemskap} />}
                {inntekt && <Inntekt inntekt={inntekt} soknadArbeidsinntekt={soknadArbeidsinntekt} />}
                {bekreftelser && <Bekreftelser bekreftelser={bekreftelser} />}
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
  soknadArbeidsinntekt: ArbeidsinntektSelector(state),
  initialValues: {
    inntektNorskIPerioden: ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaeringIPerioden: ArbeidsinntektSelector(state).inntektNaeringIPerioden,
    arbeidsgiverBekrefterUtsendelse: ArbeidsgiversBekreftelse(state).arbeidsgiverBekrefterUtsendelse,
    arbeidstakerAnsattUnderUtsendelsen: ArbeidsgiversBekreftelse(state).arbeidstakerAnsattUnderUtsendelsen,
    erstatterArbeidstakerenUtsendte: ArbeidsgiversBekreftelse(state).erstatterArbeidstakerenUtsendte,
    arbeidstakerTidligereUtsendt24Mnd: ArbeidsgiversBekreftelse(state).arbeidstakerTidligereUtsendt24Mnd,
    arbeidsgiverBetalerArbeidsgiveravgift: ArbeidsgiversBekreftelse(state).arbeidsgiverBetalerArbeidsgiveravgift,
    trygdeavgiftTrukketGjennomSkatt: ArbeidsgiversBekreftelse(state).trygdeavgiftTrukketGjennomSkatt,
    trygdeavgiftTrukketGjennomSkattDato: ArbeidsgiversBekreftelse(state).trygdeavgiftTrukketGjennomSkattDato,
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
  validate: {
    inntektNorskIPerioden: [Skjema.Validering.kunTall],
    inntektUtenlandskIPerioden: [Skjema.Validering.kunTall],
    inntektNaeringIPerioden: [Skjema.Validering.kunTall],
    // arbeidsgiverBekrefterUtsendelse: [Skjema.Validering.erPakrevet],
    trygdeavgiftTrukketGjennomSkattDato: [Skjema.Validering.erPakrevet],
  },
})(Saksbehandling);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksbehandlingForm));
