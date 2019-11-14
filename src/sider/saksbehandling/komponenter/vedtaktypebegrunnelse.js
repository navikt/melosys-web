import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import './vedtaktype.css';

const Vedtaktypebegrunnelse = ({
  onChange,
  className,
  value,
}) => (
  <Nav.Select
    label="Bakgrunn for nytt vedtak"
    onChange={onChange}
    value={value}
    className={className}
  >
    <option>Mangler koder</option>
  </Nav.Select>
);

Vedtaktypebegrunnelse.propTypes = {
  onChange: PT.func.isRequired,
  value: PT.string.isRequired,
  className: PT.string,
};

Vedtaktypebegrunnelse.defaultProps = {
  className: undefined,
};

export default Vedtaktypebegrunnelse;
