import { ChangeEvent, FocusEvent, FocusEventHandler, ReactNode, useId, useState } from "react";
import classNames from "classnames";
import { DatePicker, useDatepicker } from "@navikt/ds-react";
import * as Utils from "../../utils";
import "./datovelger.less";
import moment from "moment";
import { SKRIV_INN_GYLDIG_DATO } from "../../kodeverk/feilmeldinger";

interface DatovelgerProps {
  onChange: (norskStringDato: string) => void;
  value?: Date;
  label?: ReactNode;
  readOnly?: boolean;
  feil?: string;
  bredde?: string;
  minDate?: Date;
  maxDate?: Date;
  onBlur?: FocusEventHandler;
  onCalendarClose?: () => void;
  brukInternValidering?: boolean;
  visFeil?: boolean;
  forhindreAutoUtfylling?: boolean;
  laasAar?: boolean;
}

function Datovelger({
  onChange,
  value,
  label,
  readOnly = false,
  feil = undefined,
  bredde = "fullbredde",
  minDate,
  maxDate,
  onBlur,
  brukInternValidering = false,
  visFeil = true,
  forhindreAutoUtfylling = false,
  laasAar = false,
}: DatovelgerProps) {
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

  const handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
    const currentValue = event.target.value.trim();

    if (currentValue && !readOnly) {
      // Automatisk legg til/overstyr år hvis laasAar er aktivert
      // Dette må skje FØR forhindreAutoUtfylling-sjekken
      let valueToFormat = currentValue;
      let harLagtTilAar = false;
      if (laasAar) {
        const renDato = currentValue.replace(/[-./]/g, "");
        // Hent året som skal brukes
        const aar = minDate?.getFullYear() || maxDate?.getFullYear() || new Date().getFullYear();

        if (renDato.length === 4) {
          // Hvis input er 4 tegn (ddmm), legg til år
          const dag = renDato.substring(0, 2);
          const maaned = renDato.substring(2, 4);
          valueToFormat = `${dag}.${maaned}.${aar}`;
          harLagtTilAar = true;
        } else if (renDato.length >= 6) {
          // Hvis input er 6+ tegn (ddmmåå eller ddmmåååå), overstyr året
          const dag = renDato.substring(0, 2);
          const maaned = renDato.substring(2, 4);
          valueToFormat = `${dag}.${maaned}.${aar}`;
          harLagtTilAar = true;
        }
        // Hvis lengde er 5 tegn, la den stå ugyldig (f.eks "01011")
      }

      // Forhindrer at NAV DatePicker auto-fyller datoer, ofte til helt ugyldige verdier (f.eks, "1" til "01.01.0001"
      // La verdiene stå, det vises en klar feilmelding
      // Sjekk verdien ETTER at år er lagt til (hvis laasAar er aktivt)
      if (forhindreAutoUtfylling && !harLagtTilAar) {
        const renDato = valueToFormat.replace(/[-./]/g, "");
        if (renDato.length < 6) {
          if (onBlur) {
            onBlur(event);
          }
          return;
        }
      }

      const formattedValue = Utils.dato.vaskOgFormatterDatoTilNorsk(valueToFormat, "");

      // Hvis vi la til år eller verdien ble formatert, oppdater feltet
      if ((harLagtTilAar || (formattedValue && formattedValue !== currentValue)) && formattedValue) {
        // Oppdater input-feltets verdi direkte
        event.target.value = formattedValue;

        if (inputProps?.onChange) {
          const syntheticEvent = {
            ...event,
            target: { ...event.target, value: formattedValue },
          } as ChangeEvent<HTMLInputElement>;
          inputProps.onChange(syntheticEvent);
        }

        // Oppdater react-hook-form
        onChange(formattedValue);
      }
    }

    if (onBlur) {
      onBlur(event);
    }
  };

  const datovelgerID = useId();
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
          onBlur={handleOnBlur}
          readOnly={readOnly}
          onChange={handleOnChange}
        />
      </DatePicker>
      {visFeil && (feil || erUgyldigDato) && (
        <div role="alert" aria-live="assertive" className="datovelger__feilmelding">
          {feil ?? SKRIV_INN_GYLDIG_DATO.melding}
        </div>
      )}
    </div>
  );
}

export default Datovelger;
