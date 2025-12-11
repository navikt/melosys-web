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
  /** aria-label for tilgjengelighet - brukes hvis label er en ReactNode som ikke kan leses som tekst */
  "aria-label"?: string;
}

function MultiSelect<T extends OptionBase>(props: MultiSelectProps<T>) {
  const { label, values, onChange, options, feil, className, redigerbart = true } = props;
  const ariaLabel = props["aria-label"];

  const selectId = `select${Utils._uuid()}`;
  const labelId = `${selectId}-label`;

  // Utled aria-label fra label prop hvis den er en string, ellers bruk eksplisitt aria-label
  const effectiveAriaLabel = ariaLabel ?? (typeof label === "string" ? label : undefined);

  const hasVisibleLabel = label !== "" && label !== null && label !== undefined;

  return (
    <div className={className} style={{ cursor: redigerbart ? "default" : "not-allowed" }}>
      {hasVisibleLabel && (
        <label id={labelId} htmlFor={selectId} style={{ display: "block", paddingBottom: "0.5rem" }}>
          {label}
        </label>
      )}
      <Select
        inputId={selectId}
        {...(hasVisibleLabel ? { "aria-labelledby": labelId } : {})}
        {...(effectiveAriaLabel ? { "aria-label": effectiveAriaLabel } : {})}
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
