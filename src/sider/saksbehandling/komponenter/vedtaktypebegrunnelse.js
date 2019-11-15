import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import './vedtaktype.css';

const Vedtaktypebegrunnelse = ({
  onChange,
  className,
  value,
  feil,
  redigerbart,
}) => (
  <Nav.Select
    label="Bakgrunn for nytt vedtak"
    onChange={onChange}
    value={value}
    className={className}
    feil={feil}
    disabled={!redigerbart}
  >
    <option key="VELG" value="" disabled>Velg...</option>
    {
      ['test', 'begrunnelse'].map(begrunnelse => <option key={begrunnelse} value={begrunnelse}>{begrunnelse}</option>)
    }
  </Nav.Select>
);

Vedtaktypebegrunnelse.propTypes = {
  onChange: PT.func.isRequired,
  value: PT.string.isRequired,
  className: PT.string,
  feil: PT.object,
  redigerbart: PT.bool.isRequired,
};

Vedtaktypebegrunnelse.defaultProps = {
  className: undefined,
  feil: undefined,
};

export default Vedtaktypebegrunnelse;
