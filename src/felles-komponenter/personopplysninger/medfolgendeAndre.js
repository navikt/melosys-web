import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';
import * as Api from '../../services/api';
import * as MPT from '../../proptypes';

import { erGyldigDnr, erGyldigFnr } from '../skjema/validering/generisk/person';
import { beregnAlder } from '../../utils/dato';

import './medfolgendeAndre.css';

class MedfolgendeAndre extends Component {
  state = { fnr: '', person: {}, visSpinner: false };

  componentDidMount() {
    this.sjekkMedfolgende({});
  }

  componentDidUpdate(prevProps) {
    this.sjekkMedfolgende(prevProps);
  }

  inntastetFnrHandle = event => {
    const { value } = event.currentTarget;
    this.setState({ fnr: value });
  };

  sokHandle = () => {
    const { fnr } = this.state;
    const { sjekkPerson } = this.props;

    if (erGyldigFnr(fnr) || erGyldigDnr(fnr)) {
      sjekkPerson(fnr);
    }
  };

  sjekkMedfolgende = async prevProps => {
    if (prevProps.medfolgendeAndre === this.props.medfolgendeAndre) { return; }
    const { medfolgendeAndre } = this.props;

    this.resetLocalState();

    if (erGyldigFnr(medfolgendeAndre) || erGyldigDnr(medfolgendeAndre)) {
      this.visSpinner();
      const response = await Api.Personer.hentPerson(medfolgendeAndre);
      this.setState({ person: response });
      this.skjulSpinner();
    }
  };

  resetLocalState = () => this.setState({ person: {} });
  visSpinner = () => this.setState({ visSpinner: true });
  skjulSpinner = () => setTimeout(() => this.setState({ visSpinner: false }), 1000);

  render () {
    const { sammensattNavn, foedselsdato } = this.state.person;
    const { fnr } = this.state;
    const { inntastetFnrHandle, sokHandle } = this;

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
            <Nav.Input
              bredde="M"
              label="Fødselsnummer eller D-nummer"
              value={fnr}
              onChange={inntastetFnrHandle}
            />
            <Nav.Hovedknapp onClick={sokHandle}>Søk</Nav.Hovedknapp>
            { spinner }
          </div>
          { funnetPerson }
        </Nav.Fieldset>
      </div>
    );
  }
}

MedfolgendeAndre.propTypes = {
  medfolgendeAndre: MPT.Person,
};

MedfolgendeAndre.defaultProps = {
  medfolgendeAndre: {},
};

export default MedfolgendeAndre;
