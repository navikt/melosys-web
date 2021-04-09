import React, { ReactNode } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { nb } from "date-fns/locale";
import "./datovelger.css";

registerLocale("nb", nb);

interface DatofeltProps {
  onChange: (nyDato: Date) => void;
  value?: Date;
  feil?: string;
  label?: ReactNode;
}

const Datovelger = ({ onChange, value, label, feil = undefined }: DatofeltProps) => {
  return (
    <div className="datofelt">
      {label && <div className="datofelt_label">{label}</div>}
      <DatePicker
        className={feil ? "dato_feil" : ""}
        onChange={onChange}
        selected={value}
        locale="nb"
        dateFormat="dd/MM/yyyy"
      />
      {feil && <div className="datofelt_feilmelding">{feil}</div>}
    </div>
  );
};

export default Datovelger;
