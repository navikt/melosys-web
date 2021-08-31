import React, { ReactNode, FocusEventHandler } from "react";
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
  minDate?: Date;
  maxDate?: Date;
  onBlur?: FocusEventHandler;
  dateRegex?: RegExp;
}

const Datovelger = ({
  onChange,
  value,
  label,
  disabled = false,
  feil = undefined,
  bredde = "fullbredde",
  minDate,
  maxDate,
  onBlur,
  dateRegex = /^[0-2]+[1-9]*[.\-/]?\d{0,2}[.\-/]?\d{0,4}$/, // dd(separator?)MM(separator?)yy(yy)
}: DatovelgerProps) => {
  const dateFormat = [
    "dd.MM.yyyy", // Det første formatet er det som vil vises i inputfeltet etter valgt dato
    "ddMMyyyy",
    "ddMMyy",
    "dd.MM.yy",
    "dd/MM/yyyy",
    "dd/MM/yy",
    "dd-MM-yyyy",
    "dd-MM-yy",
  ];

  // Stopper skriving av ugyldige tegn (ikke blant dateFormat over)
  const handleOnChangeRaw = (e: React.SyntheticEvent<any>) => {
    const val = e.currentTarget.value;
    if (val !== "" && !dateRegex.test(val)) {
      e.preventDefault();
    }
  };

  return (
    <div className="datovelger">
      {label && <label className="datovelger__label">{label}</label>}
      <DatePicker
        className={classNames("datovelger__input", `input--${bredde?.toLowerCase()}`, {
          datovelger__input_disabled: disabled,
          datovelger__input_feil: feil,
        })}
        onChange={onChange}
        onChangeRaw={handleOnChangeRaw}
        onBlur={onBlur}
        selected={value}
        locale="nb"
        dateFormat={dateFormat}
        placeholderText={disabled || feil ? "" : "Velg en dato"}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
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
