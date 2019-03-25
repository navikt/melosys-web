import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../utils/navFrontend';

const kodeTermSelect = ({
  koder,
  value,
  onChange,
  label,
  feil,
  disableForsteValg,
  redigerbar,
  onBlur,
}) => (
  <Nav.Select
    value={value}
    onChange={onChange}
    label={label}
    feil={feil}
    disabled={!redigerbar}
    onBlur={onBlur}
  >
    <option key="VELG" value="" disabled={disableForsteValg}>Velg...</option>
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
  disableForsteValg: PT.bool,
  redigerbar: PT.bool,
  onBlur: PT.func,
};

kodeTermSelect.defaultProps = {
  disableForsteValg: false,
  feil: undefined,
  redigerbar: true,
  onBlur: () => null,
};

export default kodeTermSelect;
