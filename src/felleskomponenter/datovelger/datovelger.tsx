import React, { ReactNode } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { nb } from "date-fns/locale";
import classNames from "classnames";
import "react-datepicker/dist/react-datepicker.css";
import "./datovelger.css";

registerLocale("nb", nb);

interface DatofeltProps {
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
}: DatofeltProps) => {
  return (
    <div className="datofelt">
      {label && <label className="datofelt__label">{label}</label>}
      <DatePicker
        className={classNames("datofelt__input", `input--${bredde?.toLowerCase()}`, {
          datofelt__input_disabled: disabled,
          datofelt__input_feil: feil,
        })}
        onChange={onChange}
        selected={value}
        locale="nb"
        dateFormat="dd.MM.yyyy"
        placeholderText={disabled || feil ? "" : "Velg en dato"}
        disabled={disabled}
      />
      {feil && (
        <div role="alert" aria-live="assertive" className="datofelt__feilmelding">
          {feil}
        </div>
      )}
    </div>
  );
};

export default Datovelger;
