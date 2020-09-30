import React, { CSSProperties } from 'react';
import Select, { Styles, ValueType } from 'react-select';

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

  const styles: Styles = {
    control: (provided: CSSProperties) => ({
      ...provided,
      borderColor: feil ? '#BA3A26' : '#78706A',
      '&:hover': {
        borderColor: '#0067C5',
      },
      backgroundColor: feil ? '#F3E3E3' : '#FFFFFF',
    }),
    placeholder: (provided: CSSProperties) => ({
      ...provided,
      fontFamily: '\'Source Sans Pro\', Arial, sans-serif',
      fontSize: '1rem',
      fontWeight: 400,
      color: '#000000',
    }),
    menu: (provided: CSSProperties) => ({
      ...provided,
      marginTop: 0,
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided: CSSProperties) => ({
      ...provided,
      color: '#000000',
    }),
  };

  return (
    <div className="multiselect">
      <label htmlFor={`select${label}`}>{label}</label>
      <Select
        id={`select${label}`}
        styles={styles}
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
