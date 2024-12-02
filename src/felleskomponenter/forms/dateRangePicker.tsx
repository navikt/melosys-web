import { Bleed, DatePicker, DatePickerProps, HStack, useRangeDatepicker } from "@navikt/ds-react";
import { forwardRef, useState } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { SKRIV_INN_GYLDIG_DATO } from "../../kodeverk/feilmeldinger";
import { _uuid } from "../../utils";
import * as Utils from "../../utils";

interface DateRangeText {
  from: string;
  to: string;
}

interface Props {
  name: string;
  control: Control;
  label: string;
  hideLabel?: boolean;
  onRangeChange: (dateRange: DateRangeText) => void;
  fieldError?: FieldError;
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
  const [defaultFromDate] = useState(fromDate ?? new Date(0));
  const [defaultToDate] = useState(toDate ?? new Date(2100, 1, 1));

  const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
    defaultSelected: defaultSelected as DateRange,
    fromDate: defaultFromDate,
    toDate: defaultToDate,

    onRangeChange: (dateRange?: DateRange) => {
      const dateRangeText: DateRangeText = {
        from: Utils.dato.formatterDatoTilNorsk(dateRange?.from, false, undefined),
        to: Utils.dato.formatterDatoTilNorsk(dateRange?.to, false, undefined),
      };
      onRangeChange(dateRangeText);
    },
  });

  return (
    <DatePicker {...datepickerProps}>
      <HStack gap={{ sm: "2" }} justify="center" wrap={false}>
        <DatePicker.Input
          id={_uuid()}
          label={<Bleed marginInline="12">{label}</Bleed>}
          hideLabel={hideLabel}
          size="small"
          readOnly={readOnly}
          {...fromInputProps}
        />

        <DatePicker.Input
          id={_uuid()}
          label=""
          hideLabel={hideLabel}
          size="small"
          readOnly={readOnly}
          {...toInputProps}
        />
      </HStack>
      {showFieldError && fieldError && (
        <div role="alert" aria-live="assertive" className="navds-error-message navds-label navds-label--small">
          {SKRIV_INN_GYLDIG_DATO.melding}
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
    const renderDateRangePicker = (field: any, fieldError?: FieldError) => {
      return (
        <InnerDateRangePicker
          control={control}
          label={label}
          hideLabel={hideLabel}
          defaultSelected={defaultSelected as DateRange}
          fromDate={fromDate}
          toDate={toDate}
          onRangeChange={(dateRange: DateRangeText) => {
            field.onChange({ ...field.value, fomDato: dateRange.from || "", tomDato: dateRange.to || "" });
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
        render={({ field, fieldState: { error } }) => renderDateRangePicker(field, error)}
        {...rest}
      />
    );
  }
);

export default DateRangePicker;
