import React from 'react';
import Select from 'react-select';

import './multiSelect.css';

interface MultiSelectProps {
  label: string,
  onChange(options: any[] | null): void,
  options: any[]
}

function MultiSelect(props: MultiSelectProps) {
  const { label, onChange, options } = props;

  return (
    <div className="multiselect">
      <label htmlFor={`select${label}`}>{label}</label>
      <Select id={`select${label}`} onChange={onChange} options={options} placeholder="Velg..." isMulti />
    </div>
  );
}

export default MultiSelect;
