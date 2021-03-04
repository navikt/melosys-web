import React, { CSSProperties } from "react";
import Select, { Styles } from "react-select";

export interface OptionBase {
  value: string;
  label: string;
}

interface MultiSelectProps<T> {
  label: string;
  values: string[];
  onChange(selectedOptions: readonly T[]): void;
  options: T[];
  feil?: { feilmelding: string };
  redigerbart?: boolean;
}

function MultiSelect<T extends OptionBase>(props: MultiSelectProps<T>) {
  const { label, values, onChange, options, feil, redigerbart = true } = props;

  const getBorderColor = (hover = false) => {
    if (hover && redigerbart) return "#0067C5";
    if (redigerbart && feil) return "#BA3A26";
    return "#78706A";
  };

  const getBackgroundColor = () => {
    if (!redigerbart) return "#E9E7E7";
    if (feil) return "#F3E3E3";
    return "#FFFFFF";
  };

  const styles: Styles<T, true> = {
    control: (provided: CSSProperties) => ({
      ...provided,
      borderColor: getBorderColor(),
      "&:hover": {
        borderColor: getBorderColor(true),
      },
      backgroundColor: getBackgroundColor(),
    }),
    placeholder: (provided: CSSProperties) => ({
      ...provided,
      fontFamily: "'Source Sans Pro', Arial, sans-serif",
      fontSize: "1rem",
      fontWeight: 400,
      color: "#000000",
    }),
    menu: (provided: CSSProperties) => ({
      ...provided,
      marginTop: 0,
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided: CSSProperties) => ({
      ...provided,
      color: "#000000",
    }),
  };

  return (
    <div style={{ margin: "1rem 0", cursor: redigerbart ? "default" : "not-allowed" }}>
      <label htmlFor={`select${label}`} style={{ display: "block", paddingBottom: "0.5rem" }}>
        {label}
      </label>
      <Select
        id={`select${label}`}
        styles={styles}
        onChange={(selectedOptions) => onChange(selectedOptions || [])}
        options={options}
        placeholder="Velg..."
        isMulti
        isDisabled={!redigerbart}
        noOptionsMessage={() => ""}
        value={options.filter((option) => values.indexOf(option.value) >= 0)}
      />
      <div role="alert" aria-live="assertive">
        {feil && <div className="skjemaelement__feilmelding">{feil.feilmelding}</div>}
      </div>
    </div>
  );
}

export default MultiSelect;
