import { forwardRef } from "react";
import { DateRange } from "react-day-picker";
import { Controller } from "react-hook-form";
import { DateRangePicker } from "./dateRangePicker";
import { DateRangeText, ExternalDateRangePickerProps } from "./types";

const DateRangeController = forwardRef<HTMLSelectElement, ExternalDateRangePickerProps>(
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
        <DateRangePicker
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
          mode="range"
        />
      );
    };

    return (
      <Controller
        name={name!!}
        control={control}
        render={({ field, fieldState: { error } }) => {
          return renderDateRangePicker(field, error);
        }}
        {...rest}
      />
    );
  }
);

export default DateRangeController;
