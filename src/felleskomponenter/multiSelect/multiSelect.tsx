import { ReactNode } from "react";
import Select from "react-select";

import "./multiSelect.less";
import * as Utils from "../../utils";

export interface OptionBase {
  value: string;
  label: string;
}

interface MultiSelectProps<T> {
  label: ReactNode;
  values: string[];
  onChange(selectedOptions: readonly T[]): void;
  options: T[];
  feil?: string;
  redigerbart?: boolean;
  className?: string;
}

function MultiSelect<T extends OptionBase>(props: MultiSelectProps<T>) {
  const { label, values, onChange, options, feil, className, redigerbart = true } = props;

  const selectId = `select${Utils._uuid()}`;
  return (
    <div className={className} style={{ cursor: redigerbart ? "default" : "not-allowed" }}>
      <label htmlFor={selectId} style={{ display: "block", paddingBottom: "0.5rem" }}>
        {label}
      </label>
      <Select
        id={selectId}
        onChange={(selectedOptions) => onChange(selectedOptions || [])}
        menuPortalTarget={document.body}
        options={options}
        placeholder="Velg..."
        isMulti
        isDisabled={!redigerbart}
        noOptionsMessage={() => ""}
        value={options.filter((option) => values?.indexOf(option.value) >= 0)}
      />
      <div role="alert" aria-live="assertive">
        {feil && <div className="skjemaelement__feilmelding skjemaelement__feilmelding--multiSelect">{feil}</div>}
      </div>
    </div>
  );
}

export default MultiSelect;
