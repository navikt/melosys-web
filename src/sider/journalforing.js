import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';

import Informasjon from '../felles-komponenter/journalforing/informasjon';
import {
  journalforingOperations,
  journalforingSelectors,
} from '../ducks/journalforing/';
import './journalforing.css';
import {fagsakSelectors} from '../ducks/fagsaker';

class Journalforing extends Component {
  static propTypes = {};
  static defaultProps = {};
  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalforingOppgave(journalpostID);
  }

  render() {
    // const { } = this.props;
    return (
      <div className="journalforing">
        <h1>Journalforing</h1>
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="6">
              <Nav.Panel>
                <Informasjon />
              </Nav.Panel>
            </Nav.Column>
            <Nav.Column xs="6">
              <Nav.Panel>
                dokumentvisning her
              </Nav.Panel>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  journalforing: journalforingSelectors.JournalforingSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentJournalforingOppgave: journalpostID => dispatch(journalforingOperations.hentJournalforingOppgave(journalpostID)),
});

export default withRouter(reduxForm({
  form: 'journalforing',
  onSubmit: () => console.log('journalføring sendes'),
})(connect(mapStateToProps, mapDispatchToProps)(Journalforing)));
