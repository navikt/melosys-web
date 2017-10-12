import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Container, Row, Column } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import * as MPT from '../proptypes';
import { STATUS } from '../services/utils';
import {
  hentSaksopplysninger,
  PersonSelector,
  ArbeidsforholdSelector,
} from '../ducks/saksopplysninger';
import './saksbehandling.css';

import Vilkarsvurdering from '../felles-komponenter/vilkarsvurdering/vilkarsvurdering';

class Saksbehandling extends Component {
  static propTypes = {
    match: PT.any.isRequired,
    hentSaksopplysninger: PT.func.isRequired,
    person: MPT.PersonPropType.isRequired,
    arbeidsforhold: PT.arrayOf(MPT.ArbeidsforholdPropType),
    status: PT.string,
  };

  static defaultProps = {
    person: {
      fnr: '',
    },
    arbeidsforhold: [],
    status: STATUS.NOT_STARTED,
  };

  componentDidMount() {
    const { fnr } = this.props.match.params;
    this.props.hentSaksopplysninger(fnr);
  }

  render() {
    return (
      <div className="saksbehandling">
        <Container fluid>
          <Row>
            <Column xs="7">
              <Vilkarsvurdering />
            </Column>
            <Column xs="5">
              <Panel className="saksbehandling__soknadSammendrag">
                <Row>
                  <Column xs="12" md="6">
                    <Undertittel className="soknadSammendrag__header">Søknad om A1</Undertittel>
                  </Column>
                  <Column xs="12" md="6">
                    <Knapp>Behandlingsmeny</Knapp>
                  </Column>
                </Row>
              </Panel>
            </Column>
          </Row>
        </Container>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  person: PersonSelector(state),
  arbeidsforhold: ArbeidsforholdSelector(state),
  status: state.status,
});

const mapDispatchToProps = dispatch => ({
  hentSaksopplysninger: fnr => dispatch(hentSaksopplysninger(fnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Saksbehandling);
