import { ReactNode } from "react";
import { UNSAFE_Combobox as Combobox } from "@navikt/ds-react";

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
  /** Brukes som skjult label når label er tom */
  "aria-label"?: string;
}

function MultiSelect<T extends OptionBase>(props: MultiSelectProps<T>) {
  const { label, values, onChange, options, feil, className, redigerbart = true } = props;
  const ariaLabel = props["aria-label"];

  const harSynligLabel = label !== "" && label !== null && label !== undefined;
  const valgteVerdier = values ?? [];

  const tilOptions = (verdier: string[]) =>
    verdier.map((v) => options.find((option) => option.value === v)).filter((option): option is T => !!option);

  const vedToggle = (verdi: string, erValgt: boolean) => {
    const nyeVerdier = erValgt ? [...valgteVerdier, verdi] : valgteVerdier.filter((v) => v !== verdi);
    onChange(tilOptions(nyeVerdier));
  };

  return (
    <div className={className}>
      <Combobox
        label={harSynligLabel ? label : ariaLabel}
        hideLabel={!harSynligLabel}
        size="small"
        isMultiSelect
        options={options}
        selectedOptions={tilOptions(valgteVerdier)}
        onToggleSelected={vedToggle}
        disabled={!redigerbart}
        error={feil}
      />
    </div>
  );
}

export default MultiSelect;
