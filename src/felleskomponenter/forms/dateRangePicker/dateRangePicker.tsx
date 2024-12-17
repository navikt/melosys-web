import { Bleed, DatePicker, HStack, useRangeDatepicker } from "@navikt/ds-react";
import { ChangeEvent, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { _uuid } from "../../../utils";
import * as Utils from "../../../utils";
import { DateRangePickerProps } from "./types";

export const DateRangePicker = ({
  label,
  hideLabel,
  fromDate,
  toDate,
  defaultSelected,
  onRangeChange,
  fieldError,
  showFieldError,
  readOnly,
  ...rest
}: DateRangePickerProps) => {
  const [localFromDate, setLocalFromDate] = useState<string>();
  const [localToDate, setLocalToDate] = useState<string>();

  useEffect(() => {
    const { from, to } = defaultSelected as DateRange;

    setLocalFromDate(Utils.dato.formatterDatoTilNorsk(from, false, undefined));
    setLocalToDate(Utils.dato.formatterDatoTilNorsk(to, false, undefined));
  }, []);

  const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
    locale: "nb",
    defaultSelected: defaultSelected as DateRange,
    fromDate: fromDate || new Date(0),
    toDate: toDate || new Date(2100, 0, 1),
    onRangeChange: (dateRange?: DateRange) => {
      const from = Utils.dato.formatterDatoTilNorsk(dateRange?.from, false, undefined);
      const to = Utils.dato.formatterDatoTilNorsk(dateRange?.to, false, undefined);
      if (!from || !to) return; // vent med oppdatering til begge verdier er satt

      onRangeChange({ from, to });

      if (from) {
        setLocalFromDate(from);
      }
      if (to) {
        setLocalToDate(to);
      }
    },
  });

  // benyttes ettersom verdier utenfor fromDate og toDate settes til undefined ved datoer utenfor range limit
  const fromInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (fromInputProps?.onChange) {
      fromInputProps.onChange(event);
    }

    const trimmedValue = event.target.value.trim();
    onRangeChange({
      from: Utils.dato.formatterDatoTilNorsk(trimmedValue, false, undefined),
      to: Utils.dato.formatterDatoTilNorsk(localToDate, false, undefined),
    });

    setLocalFromDate(trimmedValue);
  };

  // benyttes ettersom verdier utenfor fromDate og toDate settes til undefined ved datoer utenfor range limit
  const toInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (toInputProps?.onChange) {
      toInputProps.onChange(event);
    }

    const trimmedValue = event.target.value.trim();
    onRangeChange({
      from: Utils.dato.formatterDatoTilNorsk(localFromDate, false, undefined),
      to: Utils.dato.formatterDatoTilNorsk(trimmedValue, false, undefined),
    });

    setLocalToDate(trimmedValue);
  };

  const getErrorMessage = (): string | null => {
    if (!fieldError) return null;
    let fomDatoError = "";
    let tomDatoError = "";
    if (fieldError.fomDato) {
      fomDatoError = fieldError.fomDato.message.melding || fieldError.fomDato.message;
      return fomDatoError.toLowerCase();
    }

    if (fieldError.tomDato) {
      tomDatoError = fieldError.tomDato.message.melding || fieldError.tomDato.message;
      return tomDatoError.toLowerCase();
    }

    return null;
  };

  const hasError = (field: string): boolean => {
    return fieldError && fieldError[field] !== undefined;
  };

  return (
    <DatePicker {...datepickerProps}>
      <HStack gap={{ sm: "2" }} justify="center" wrap={false}>
        <DatePicker.Input
          {...fromInputProps}
          id={_uuid()}
          label={<Bleed marginInline="6">{label}</Bleed>}
          hideLabel={hideLabel}
          error={hasError("fomDato")}
          size="small"
          readOnly={readOnly}
          onChange={fromInputChange}
        />

        <DatePicker.Input
          {...toInputProps}
          id={_uuid()}
          label=""
          hideLabel={hideLabel}
          error={hasError("tomDato")}
          size="small"
          readOnly={readOnly}
          onChange={toInputChange}
        />
      </HStack>
      {showFieldError && fieldError && (
        <div role="alert" aria-live="assertive" className="navds-error-message navds-label navds-label--small">
          {getErrorMessage()}
        </div>
      )}
    </DatePicker>
  );
};
