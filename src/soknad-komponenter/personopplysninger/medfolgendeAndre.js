import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';
import * as MPT from '../../proptypes';

import { erGyldigDnr, erGyldigFnr } from '../skjema/validering/generisk/person';
import { beregnAlder } from '../../utils/dato';

import './medfolgendeAndre.css';
import BostedsAdresse from '../../komponenter/adresser/bostedsAdresse';

class MedfolgendeAndre extends Component {
  state = { fnr: '', erDirty: false };

  sokHandle = () => {
    const { sjekkPerson } = this.props;
    const { fnr } = this.state;

    if (erGyldigFnr(fnr) || erGyldigDnr(fnr)) {
      this.setState({ erDirty: false });
      sjekkPerson(fnr);
    }
  };

  vedTastOppHandle = event => {
    const { value } = event.target;
    this.setState({ fnr: value, erDirty: true });
  };

  render () {
    const { disabled, medfolgendeAndre } = this.props;
    const { sammensattNavn, foedselsdato, bostedsadresse } = medfolgendeAndre;
    const { sokHandle, vedTastOppHandle } = this;
    const { erDirty } = this.state;

    const funnetPerson = (!erDirty) && Object.keys(medfolgendeAndre).length > 0 ? (
      <div className="medfolgendeAndre__person">
        {sammensattNavn} ({beregnAlder(foedselsdato)})
        <BostedsAdresse bostedsadresse={bostedsadresse} />
      </div>
    ) : null;

    return (
      <div className="medfolgendeAndre">
        <Nav.Fieldset legend="Søker følger med et familiemedlem som utfører arbeid i landet:">
          <div className="medfolgendeAndre__wrapper">
            <Skjema.Input
              bredde="M"
              feltNavn="medfolgendeAndre"
              label="Oppgi fnr / dnr:"
              onKeyUp={vedTastOppHandle}
              disabled={disabled}
            />
            <Nav.Hovedknapp disabled={disabled} onClick={sokHandle}>Søk</Nav.Hovedknapp>
          </div>
          { funnetPerson }
        </Nav.Fieldset>
      </div>
    );
  }
}

MedfolgendeAndre.propTypes = {
  disabled: PT.bool.isRequired,
  medfolgendeAndre: MPT.Person,
  sjekkPerson: PT.func.isRequired,
};

MedfolgendeAndre.defaultProps = {
  medfolgendeAndre: {},
};

export default MedfolgendeAndre;
