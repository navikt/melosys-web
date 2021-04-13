import React, { ReactNode } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { nb } from "date-fns/locale";
import classNames from "classnames";
import "react-datepicker/dist/react-datepicker.css";
import "./datovelger.css";

registerLocale("nb", nb);

interface DatovelgerProps {
  onChange: (nyDato: Date) => void;
  value?: Date;
  label?: ReactNode;
  disabled?: boolean;
  feil?: string;
  bredde?: string;
}

const Datovelger = ({
  onChange,
  value,
  label,
  disabled = false,
  feil = undefined,
  bredde = "fullbredde",
}: DatovelgerProps) => {
  return (
    <div className="datovelger">
      {label && <label className="datovelger__label">{label}</label>}
      <DatePicker
        className={classNames("datovelger__input", `input--${bredde?.toLowerCase()}`, {
          datovelger__input_disabled: disabled,
          datovelger__input_feil: feil,
        })}
        onChange={onChange}
        selected={value}
        locale="nb"
        dateFormat="dd.MM.yyyy"
        placeholderText={disabled || feil ? "" : "Velg en dato"}
        disabled={disabled}
      />
      {feil && (
        <div role="alert" aria-live="assertive" className="datovelger__feilmelding">
          {feil}
        </div>
      )}
    </div>
  );
};

export default Datovelger;
