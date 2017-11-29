import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PT from 'prop-types';

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
  hentSoknader,
} from '../ducks/soknader';

import './saksbehandling.css';

class Saksbehandling extends Component {
  static propTypes = {
    hentFagsaker: PT.func.isRequired,
    hentSoknader: PT.func.isRequired,
    match: PT.object.isRequired,
    person: MPT.Person,
    organisasjoner: MPT.Organisasjoner,
    medlemskap: MPT.Medlemskap,
    arbeidsforholdene: MPT.Arbeidsforholdene,
    inntekt: MPT.Inntekt,
    bekreftelser: MPT.Bekreftelser,
    oppsummering: MPT.Oppsummering,
    permisjoner: MPT.Permisjoner,
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
  };

  componentDidMount() {
    const { snr } = this.props.match.params;
    this.props.hentFagsaker(snr);
    this.props.hentSoknader(snr);
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
    } = this.props;

    if (!person || !person.fnr) {
      return null;
    }
    return (
      <div className="saksbehandling">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <Vilkarsveileder person={person} arbeidsforholdene={arbeidsforholdene} />
              {person && <Personopplysninger person={person} />}
              {permisjoner && <Permisjoner permisjoner={permisjoner} />}
              {arbeidsforholdene && <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />}
              {organisasjoner && <OrganisasjonerNorge organisasjoner={organisasjoner} />}
              <ArbeidsgiverUtland />
              {medlemskap && <Medlemskap medlemskap={medlemskap} />}
              {inntekt && <Inntekt inntekt={inntekt} />}
              {bekreftelser && <Bekreftelser bekreftelser={bekreftelser} />}
              <Tilleggsopplysninger />
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

const mapStateToProps = state => ({
  person: PersonSelector(state),
  organisasjoner: OrganisasjonSelector(state),
  medlemskap: MedlemskapSelector(state),
  arbeidsforholdene: ArbeidsforholdeneSelector(state),
  inntekt: InntektSoknadenSelector(state),
  bekreftelser: BekreftelserSelector(state),
  oppsummering: OppsummeringSelector(state),
  permisjoner: PermisjonerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(hentFagsaker(saksnummer)),
  hentSoknader: saksnummer => dispatch(hentSoknader(saksnummer)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
