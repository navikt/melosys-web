import { Bleed, DatePicker, DatePickerProps, HStack, useRangeDatepicker } from "@navikt/ds-react";
import { ChangeEvent, forwardRef, useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { _uuid } from "../../utils";
import * as Utils from "../../utils";

interface DateRangeText {
  from?: string;
  to?: string;
}

interface Props {
  name: string;
  control: Control;
  label: string;
  hideLabel?: boolean;
  onRangeChange: (dateRange: DateRangeText) => void;
  fieldError?: any;
  showFieldError?: boolean;
  readOnly: boolean;
}

type DateRangePickerProps = Omit<Props & DatePickerProps, "name">;
type ExternalDateRangePickerProps = Omit<Props & DatePickerProps, "onRangeChange" | "fieldError">;

const InnerDateRangePicker = ({
  label,
  hideLabel,
  fromDate,
  toDate,
  defaultSelected,
  onRangeChange,
  fieldError,
  showFieldError,
  readOnly,
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
    fromDate: fromDate,
    toDate: toDate,
    onRangeChange: (dateRange?: DateRange) => {
      const from = Utils.dato.formatterDatoTilNorsk(dateRange?.from, false, undefined);
      const to = Utils.dato.formatterDatoTilNorsk(dateRange?.to, false, undefined);
      if (!from || !to) return; // vent med oppdatering til begge verdier er satt

      onRangeChange({
        from: from,
        to: to,
      });

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

  const getErrorMessage = (): string | undefined => {
    if (!fieldError) return;
    let fomDatoError = "";
    let tomDatoError = "";
    if (fieldError["fomDato"]) {
      fomDatoError = fieldError["fomDato"].message.melding;
      return fomDatoError.toLowerCase();
    }

    if (fieldError["tomDato"]) {
      tomDatoError = fieldError["tomDato"].message.melding;
      return tomDatoError.toLowerCase();
    }
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

const DateRangePicker = forwardRef<HTMLSelectElement, ExternalDateRangePickerProps>(
  (
    {
      name,
      control,
      label,
      hideLabel,
      fromDate,
      toDate,
      defaultSelected,
      readOnly,
      showFieldError = true,
      ...rest
    }: ExternalDateRangePickerProps,
    _ref: any
  ) => {
    const renderDateRangePicker = (field: any, fieldError?: any) => {
      return (
        <InnerDateRangePicker
          control={control}
          label={label}
          hideLabel={hideLabel}
          defaultSelected={defaultSelected as DateRange}
          fromDate={fromDate}
          toDate={toDate}
          onRangeChange={(dateRange: DateRangeText) => {
            field.onChange({ ...field.value, fomDato: dateRange.from, tomDato: dateRange.to });
          }}
          fieldError={fieldError}
          showFieldError={showFieldError}
          readOnly={readOnly}
        />
      );
    };

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          return renderDateRangePicker(field, error);
        }}
        {...rest}
      />
    );
  }
);

export default DateRangePicker;
