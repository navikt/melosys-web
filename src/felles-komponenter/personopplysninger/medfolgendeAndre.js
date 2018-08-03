import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';
import * as API from '../../services/api';

import { erGyldigDnr, erGyldigFnr } from '../skjema/validering/generisk/person';
import { alder } from '../../utils/dato';

class MedfolgendeAndre extends Component {
  state = { person: {} }

  componentDidUpdate(prevProps) {
    if (prevProps.medfolgendeAndre === this.props.medfolgendeAndre) { return; }
    const { medfolgendeAndre } = this.props;

    if (erGyldigFnr(medfolgendeAndre) || erGyldigDnr(medfolgendeAndre)) {
      API.Personer.hentPerson(medfolgendeAndre).then((response = {}) => {
        this.setState({ person: response });
      });
    }
  }

  render () {
    const { sammensattNavn, foedselsdato } = this.state.person;

    const funnetPerson = sammensattNavn ? <div>{sammensattNavn} ({alder(foedselsdato)})</div> : null;

    return (
      <div>
        <Nav.Fieldset legend="Medfølgende:">
          <div>Søker følger med et familiemedlem som utfører arbeid i landet.</div>
          <Skjema.Input
            bredde="M"
            feltNavn="medfolgendeAndre"
            label="Fødselsnummer eller D-nummer"
          />
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
