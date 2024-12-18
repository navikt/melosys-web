import { forwardRef } from "react";
import { DateRange } from "react-day-picker";
import { Controller } from "react-hook-form";
import { DateRangePicker } from "./dateRangePicker";
import { DateRangeText, DateRangeControllerProps } from "./types";

const DateRangeController = forwardRef<HTMLSelectElement, DateRangeControllerProps>(
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
    }: DateRangeControllerProps,
    _ref: any
  ) => {
    return (
      <Controller
        name={name!!}
        control={control}
        render={({ field, fieldState: { error } }) => (
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
            fieldError={error}
            showFieldError={showFieldError}
            readOnly={readOnly}
            mode="range"
          />
        )}
        {...rest}
      />
    );
  }
);

export default DateRangeController;
