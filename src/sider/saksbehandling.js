import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PT from 'prop-types';
import * as Nav from '../utils/navFrontend';
import './saksbehandling.css';
import Vilkarsvurdering from '../felles-komponenter/vilkarsveileder/vilkarsveileder';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import Arbeidsforholdene from '../felles-komponenter/arbeidsforholdene';
import OrganisasjonerNorge from '../felles-komponenter/organisasjonerNorge';
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
  MedlemsskapSelector,
  ArbeidsforholdeneSelector,
  InntektSoknadenSelector,
  BekreftelserSelector,
  OppsummeringSelector,
  PermisjonerSelector,
} from '../ducks/fagsaker';

import * as MPT from '../proptypes';

class Saksbehandling extends Component {
  static propTypes = {
    hentFagsaker: PT.func.isRequired,
    match: PT.object.isRequired,
    person: MPT.Person,
    organisasjoner: MPT.Organisasjoner,
    medlemsskap: MPT.Medlemskap,
    arbeidsforholdene: MPT.Arbeidsforholdene,
    inntekt: MPT.Inntekt,
    bekreftelser: MPT.Bekreftelser,
    oppsummering: MPT.Oppsummering,
    permisjoner: MPT.Permisjoner,
  }

  static defaultProps = {
    person: {},
    organisasjoner: [],
    medlemsskap: {},
    arbeidsforholdene: [],
    inntekt: {},
    bekreftelser: [],
    oppsummering: {},
    permisjoner: [],
  };

  componentDidMount() {
    const { fnr } = this.props.match.params;
    this.props.hentFagsaker(fnr);
  }

  render() {
    const {
      person,
      organisasjoner,
      medlemsskap,
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
              <Vilkarsvurdering />
              <Personopplysninger person={person} />
              <Tilleggsopplysninger />
              {permisjoner && <Permisjoner permisjoner={permisjoner} />}
              {arbeidsforholdene && <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />}
              {organisasjoner && <OrganisasjonerNorge organisasjoner={organisasjoner} />}
              {medlemsskap && <Medlemskap medlemsskap={medlemsskap} />}
              {inntekt && <Inntekt inntekt={inntekt} />}
              {bekreftelser && <Bekreftelser bekreftelser={bekreftelser} />}
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
  medlemsskap: MedlemsskapSelector(state),
  arbeidsforholdene: ArbeidsforholdeneSelector(state),
  inntekt: InntektSoknadenSelector(state),
  bekreftelser: BekreftelserSelector(state),
  oppsummering: OppsummeringSelector(state),
  permisjoner: PermisjonerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: fnr => dispatch(hentFagsaker(fnr)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
