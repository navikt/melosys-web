import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import './landvelger.css';


const EnkeltLand = ({ label, feil, fokusUtHandler, inputEndringHandler, inputTastNedHandler, valgtLand = {} }) => {
  const inputVerdi = valgtLand.term;
  return (
    <div>
      <Nav.Input
        list="alleLand"
        label={label}
        bredde="XXL"
        feil={feil}
        className="landliste__linje__input"
        value={inputVerdi}
        onBlur={fokusUtHandler}
        onChange={inputEndringHandler}
        onKeyDown={inputTastNedHandler}
      />
    </div>
  )
};

EnkeltLand.propTypes = {
  valgtLand: MPT.Kodeverk.isRequired,
  alleLand: PT.arrayOf(MPT.Kodeverk).isRequired,
};

EnkeltLand.defaultProps = {

};

export default EnkeltLand;
