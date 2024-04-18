import { ChangeEvent, FocusEventHandler, ReactNode, useState } from "react";
import classNames from "classnames";
import { DatePicker, useDatepicker } from "@navikt/ds-react";
import * as Utils from "../../utils";
import "./datovelger.css";
import moment from "moment";

import { _uuid } from "../../utils";
import { SKRIV_INN_GYLDIG_DATO } from "../../kodeverk/feilmeldinger";

interface DatovelgerProps {
  onChange: (norskStringDato: string) => void;
  value?: Date;
  label?: ReactNode;
  disabled?: boolean;
  feil?: string;
  bredde?: string;
  minDate?: Date;
  maxDate?: Date;
  onBlur?: FocusEventHandler;
  onCalendarClose?: () => void;
  brukInternValidering?: boolean;
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
  brukInternValidering = false,
}: DatovelgerProps) => {
  const [erUgyldigDato, setErUgyldigDato] = useState<boolean>(false);
  const { datepickerProps, inputProps } = useDatepicker({
    fromDate: minDate ?? new Date(moment(moment.now()).subtract(50, "years").toDate()),
    toDate: maxDate ?? new Date(moment(moment.now()).add(50, "years").toDate()),
    locale: "nb",
    defaultSelected: value,
    defaultMonth: minDate ?? value,
    onDateChange: (nyValgtDatoFraDatePicker?: Date) =>
      onChange(Utils.dato.formatterDatoTilNorsk(nyValgtDatoFraDatePicker, false, undefined)),
    onValidate: (err) => {
      if (!brukInternValidering) return;

      if (err.isBefore || err.isAfter || err.isEmpty) {
        setErUgyldigDato(false);
      } else {
        setErUgyldigDato(!err.isValidDate);
      }
    },
  });

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.value = event.target.value.trim();
    if (inputProps?.onChange) {
      inputProps.onChange(event);
    }
    onChange(event.target.value);
  };

  const datovelgerID = _uuid();
  return (
    <div className="datovelger">
      <DatePicker {...datepickerProps} dropdownCaption strategy="fixed">
        <DatePicker.Input
          {...inputProps}
          id={datovelgerID}
          label={label}
          hideLabel={!label}
          error={!!feil || erUgyldigDato}
          className={classNames("datovelger__input", `input--${bredde?.toLowerCase()}`, {
            datovelger__input_feil: feil || erUgyldigDato,
          })}
          size="small"
          onBlur={onBlur}
          disabled={disabled}
          onChange={handleOnChange}
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
