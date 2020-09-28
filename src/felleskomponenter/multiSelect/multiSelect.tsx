import React from 'react';
import Select, { ValueType } from 'react-select';

import './multiSelect.css';

interface MultiSelectProps<T> {
  label: string,
  onChange(selectedOptions: T[]): void,
  options: T[],
  feil: any
}

function MultiSelect<T extends {value: string, label: string}>(props: MultiSelectProps<T>) {
  const {
    label, onChange, options, feil,
  } = props;

  return (
    <div className="multiselect">
      <label htmlFor={`select${label}`}>{label}</label>
      <Select
        id={`select${label}`}
        onChange={(selectedOptions: ValueType<T>) => onChange((selectedOptions as T[]))}
        options={options}
        placeholder="Velg..."
        isMulti
      />
      <div role="alert" aria-live="assertive">
        {feil && <div className="skjemaelement__feilmelding">{feil.feilmelding}</div>}
      </div>
    </div>
  );
}

export default MultiSelect;
