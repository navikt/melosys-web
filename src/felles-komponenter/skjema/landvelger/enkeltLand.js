import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

import './landvelger.css';


const EnkeltLand = ({
  label, feil, fokusUtHandler, fokusInnHandler, inputEndringHandler, inputTastNedHandler, inputVerdi,
}) => (
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

EnkeltLand.propTypes = {
  fokusUtHandler: PT.func.isRequired,
  fokusInnHandler: PT.func.isRequired,
  inputEndringHandler: PT.func.isRequired,
  inputTastNedHandler: PT.func.isRequired,
  label: PT.string,
  feil: PT.object,
  valgteLand: PT.array,
  inputVerdi: PT.string,
};

EnkeltLand.defaultProps = {
  label: '',
  feil: {},
  valgteLand: [],
  inputVerdi: '',
};

export default EnkeltLand;
