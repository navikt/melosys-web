import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';
import * as API from '../../services/api';

import { erGyldigDnr, erGyldigFnr } from '../skjema/validering/generisk/person';
import { beregnAlder } from '../../utils/dato';

import './medfolgendeAndre.css';

class MedfolgendeAndre extends Component {
  state = { person: {}, visSpinner: false }

  componentDidUpdate(prevProps) {
    if (prevProps.medfolgendeAndre === this.props.medfolgendeAndre) { return; }
    const { medfolgendeAndre } = this.props;

    this.resetLocalState();

    if (erGyldigFnr(medfolgendeAndre) || erGyldigDnr(medfolgendeAndre)) {
      this.visSpinner();
      API.Personer.hentPerson(medfolgendeAndre).then((response = {}) => {
        this.setState({ person: response });
        this.skjulSpinner();
      });
    }
  }

  resetLocalState = () => this.setState({ person: {} })
  visSpinner = () => this.setState({ visSpinner: true });
  skjulSpinner = () => setTimeout(() => this.setState({ visSpinner: false }), 1000);

  render () {
    const { sammensattNavn, foedselsdato } = this.state.person;

    const funnetPerson = sammensattNavn ? (
      <div className="medfolgendeAndre__person">
        {sammensattNavn} ({beregnAlder(foedselsdato)})
      </div>
    ) : null;
    const spinner = this.state.visSpinner ? <Nav.NavFrontendSpinner type="S" /> : null;

    return (
      <div className="medfolgendeAndre">
        <Nav.Fieldset legend="Medfølgende:">
          <div>Søker følger med et familiemedlem som utfører arbeid i landet.</div>
          <div className="medfolgendeAndre__wrapper">
            <Skjema.Input
              bredde="M"
              feltNavn="medfolgendeAndre"
              label="Fødselsnummer eller D-nummer"
            />
            { spinner }
          </div>
          { funnetPerson }
        </Nav.Fieldset>
      </div>
    );
  }
}

MedfolgendeAndre.propTypes = {
  medfolgendeAndre: PT.string,
};

MedfolgendeAndre.defaultProps = {
  medfolgendeAndre: '',
};

const mapStateToProps = state => ({
  medfolgendeAndre: getFormValues('soknad')(state).medfolgendeAndre,
});

export default connect(mapStateToProps)(MedfolgendeAndre);
