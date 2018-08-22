import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import './landvelger.css';


const EnkeltLand = ({ label, feil, fokusUtHandler, fokusInnHandler, inputEndringHandler, inputTastNedHandler, valgteLand = {}, inputVerdi }) => {
  return (
    <div>
      <Nav.Input
        list="alleLand"
        label={label}
        bredde="XL"
        feil={feil}
        className="landliste__linje__input"
        value={inputVerdi}
        onBlur={fokusUtHandler}
        onFocus={fokusInnHandler}
        onChange={inputEndringHandler}
        onKeyDown={inputTastNedHandler}
      />
    </div>
  );
};

EnkeltLand.propTypes = {
};

EnkeltLand.defaultProps = {

};

export default EnkeltLand;
