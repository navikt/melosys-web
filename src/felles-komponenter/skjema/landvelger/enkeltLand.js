import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

import './landvelger.css';


class EnkeltLand extends Component {
  fokusInnHandler = e => {
    e.target.select();
  }

  render () {
    const { fokusInnHandler } = this;
    const {
      label, feil, fokusUtHandler, inputEndringHandler, inputTastNedHandler, inputVerdi,
    } = this.props;

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
  }
}

EnkeltLand.propTypes = {
  fokusUtHandler: PT.func.isRequired,
  inputEndringHandler: PT.func.isRequired,
  inputTastNedHandler: PT.func.isRequired,
  label: PT.string,
  feil: PT.object,
  inputVerdi: PT.string,
};

EnkeltLand.defaultProps = {
  label: '',
  feil: {},
  inputVerdi: '',
};

export default EnkeltLand;
