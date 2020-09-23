import React from 'react';
import Select from 'react-select';

import './multiSelect.css';

interface MultiSelectProps {
  label: string,
  onChange(options: any[] | null): void,
  options: any[],
  feil: any
}

function MultiSelect(props: MultiSelectProps) {
  const {
    label, onChange, options, feil,
  } = props;

  return (
    <div className="multiselect">
      <label htmlFor={`select${label}`}>{label}</label>
      <Select id={`select${label}`} onChange={onChange} options={options} placeholder="Velg..." isMulti />
      <div role="alert" aria-live="assertive">
        {feil && <div className="skjemaelement__feilmelding">{feil.feilmelding}</div>}
      </div>
    </div>
  );
}

export default MultiSelect;
