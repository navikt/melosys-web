import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../utils/navFrontend';

const kodeTermSelect = ({
  koder,
  value,
  onChange,
  label,
  feil,
  disableFørsteValg,
  redigerbar,
}) => (
  <Nav.Select value={value} onChange={onChange} label={label} feil={feil} disabled={!redigerbar}>
    <option key="VELG" value="" disabled={disableFørsteValg}>Velg...</option>
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
  feil: PT.object,
  disableFørsteValg: PT.bool,
  redigerbar: PT.bool.isRequired,
};

kodeTermSelect.defaultProps = {
  disableFørsteValg: false,
  feil: undefined,
};

export default kodeTermSelect;
