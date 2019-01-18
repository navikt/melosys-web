import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../utils/navFrontend';

const kodeTermSelect = ({
  koder,
  value,
  onChange,
  label,
  redigerbar,
}) => (
  <Nav.Select value={value} onChange={onChange} label={label} disabled={!redigerbar}>
    <option key="VELG" value="VELG">Velg...</option>
    {koder.map(k => (
      <option key={k.kode} value={k.kode}>
        {k.term}
      </option>
    ))}
  </Nav.Select>
);

kodeTermSelect.propTypes = {
  koder: PT.array.isRequired,
  value: PT.any.isRequired,
  onChange: PT.func.isRequired,
  label: PT.string.isRequired,
  redigerbar: PT.bool.isRequired,
};

export default kodeTermSelect;
