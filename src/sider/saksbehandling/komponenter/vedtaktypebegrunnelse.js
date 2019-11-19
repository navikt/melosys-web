import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

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
      MKV.KTObjects.begrunnelser.nyvurderingbakgrunner.map(({ kode, term }) => <option key={kode} value={kode}>{term}</option>)
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
