import { Control } from "react-hook-form";
import { DatePickerProps, DateInputProps } from "@navikt/ds-react";

interface DateRangeText {
  from?: string;
  to?: string;
}

interface Props {
  control: Control;
  onRangeChange: (dateRange: DateRangeText) => void;
  fieldError?: any;
  showFieldError: boolean;
}

export type { DateRangeText };
export type DateRangePickerProps = Props & Omit<DatePickerProps, "mode"> & DateInputProps;
export type DateRangeControllerProps = Omit<DateRangePickerProps, "onRangeChange">;
