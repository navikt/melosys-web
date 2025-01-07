import { forwardRef } from "react";
import { Controller } from "react-hook-form";
import { DateRangePicker } from "./dateRangePicker";
import { DateRangeText, DateRangeControllerProps } from "./types";

const DateRangeController = forwardRef<HTMLSelectElement, DateRangeControllerProps>(
  ({ name, control, showFieldError = true, ...rest }: DateRangeControllerProps, _ref: any) => {
    return (
      <Controller
        name={name!!}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DateRangePicker
            control={control}
            onRangeChange={(dateRange: DateRangeText) => {
              field.onChange({ ...field.value, fomDato: dateRange.from, tomDato: dateRange.to });
            }}
            fieldError={error}
            showFieldError={showFieldError}
            {...rest}
          />
        )}
        {...rest}
      />
    );
  },
);

export default DateRangeController;
