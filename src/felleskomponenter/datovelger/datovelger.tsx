import { ReactNode, FocusEventHandler, useState } from "react";
import classNames from "classnames";
import { DatePicker, useDatepicker } from "@navikt/ds-react";
import "./datovelger.css";
import moment from "moment";

import { _uuid } from "../../utils";
import { SKRIV_INN_GYLDIG_DATO } from "../../kodeverk/feilmeldinger";

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
  onCalendarClose?: () => void;
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
}: DatovelgerProps) => {
  const [erUgyldigDato, setErUgyldigDato] = useState<boolean>(false);
  const { datepickerProps, inputProps } = useDatepicker({
    fromDate: minDate ?? new Date(moment(moment.now()).subtract(5, "years").toDate()),
    toDate: maxDate ?? new Date(moment(moment.now()).add(5, "years").toDate()),
    locale: "nb",
    defaultSelected: value,
    defaultMonth: minDate ?? value,
    onDateChange: (nyDato?: Date) => nyDato && onChange(nyDato),
    onValidate: (err) => {
      if (err.isBefore || err.isAfter) {
        setErUgyldigDato(false);
        return;
      }
      if (!err.isValidDate) {
        setErUgyldigDato(true);
      } else {
        setErUgyldigDato(false);
      }
    },
  });

  const datovelgerID = _uuid();
  return (
    <div className="datovelger">
      <DatePicker {...datepickerProps} dropdownCaption strategy="fixed">
        <DatePicker.Input
          {...inputProps}
          id={datovelgerID}
          label={label}
          error={!!feil || erUgyldigDato}
          className={classNames("datovelger__input", `input--${bredde?.toLowerCase()}`, {
            datovelger__input_feil: feil || erUgyldigDato,
          })}
          size="small"
          onBlur={onBlur}
          disabled={disabled}
        />
      </DatePicker>
      {(feil || erUgyldigDato) && (
        <div role="alert" aria-live="assertive" className="datovelger__feilmelding">
          {feil ?? SKRIV_INN_GYLDIG_DATO.melding}
        </div>
      )}
    </div>
  );
};

export default Datovelger;
