import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PT from 'prop-types';
import * as Nav from '../utils/navFrontend';
import './saksbehandling.css';
import Vilkarsvurdering from '../felles-komponenter/vilkarsvurdering/vilkarsvurdering';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import Arbeidsforhold from '../felles-komponenter/arbeidsforhold';
import OrganisasjonerNorge from '../felles-komponenter/organisasjonerNorge';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideKommentarer from '../felles-komponenter/sideKommentarer';
import {
  hentFagsaker,
  PersonSelector,
  OrganisasjonSelector,
  MedlemsskapSelector,
  ArbeidsforholdSelector,
} from '../ducks/fagsaker';

import * as MPT from '../proptypes';

class Saksbehandling extends Component {
  static propTypes = {
    hentFagsaker: PT.func.isRequired,
    match: PT.object.isRequired,
    person: MPT.Person,
    organisasjoner: MPT.Organisasjoner,
    medlemsskap: MPT.Medlemskap,
    arbeidsforhold: MPT.Arbeidsforhold,
  }

  static defaultProps = {
    person: {},
    organisasjoner: [],
    medlemsskap: {},
    arbeidsforhold: [],
  };

  componentDidMount() {
    const { fnr } = this.props.match.params;
    this.props.hentFagsaker(fnr);
  }

  render() {
    const { person, organisasjoner, medlemsskap, arbeidsforhold } = this.props;
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
              {arbeidsforhold && <Arbeidsforhold arbeidsforhold={arbeidsforhold} />}
              {organisasjoner && <OrganisasjonerNorge organisasjoner={organisasjoner} />}
              {medlemsskap && <Medlemskap medlemsskap={medlemsskap} />}
            </Nav.Column>
            <Nav.Column xs="5">
              <SideOppsummering />
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
  arbeidsforhold: ArbeidsforholdSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: fnr => dispatch(hentFagsaker(fnr)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
