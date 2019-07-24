import React, { useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../../komponenter/skjema';
import * as MPT from '../../proptypes';

import * as PersonValidering from '../../komponenter/skjema/validering/generisk/person';
import { beregnAlder } from '../../utils/dato';

import './medfolgendeAndre.css';
import GeneriskAdresse from '../../komponenter/adresser/generiskAdresse';

function MedfolgendeAndre(props) {
  const [fnr, setFnr] = useState('');
  const [erDirty, setDirty] = useState('');

  const sokHandle = () => {
    const { sjekkPerson } = props;

    if (PersonValidering.erGyldigFnr(fnr) || PersonValidering.erGyldigDnr(fnr)) {
      setDirty(false);
      sjekkPerson(fnr);
    }
  };

  const vedTastOppHandle = event => {
    const { value } = event.target;
    setFnr(value);
    setDirty(true);
  };

  const { disabled, medfolgendeAndre } = props;
  const { sammensattNavn, foedselsdato, bostedsadresse } = medfolgendeAndre;

  const funnetPerson = (!erDirty) && Object.keys(medfolgendeAndre).length > 0 ? (
    <div className="medfolgendeAndre__person">
      {sammensattNavn} ({beregnAlder(foedselsdato)})
      <GeneriskAdresse adresse={bostedsadresse} />
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

MedfolgendeAndre.propTypes = {
  disabled: PT.bool.isRequired,
  medfolgendeAndre: MPT.Behandlinger.Saksopplysninger.Person,
  sjekkPerson: PT.func.isRequired,
};

MedfolgendeAndre.defaultProps = {
  medfolgendeAndre: {},
};

export default MedfolgendeAndre;
