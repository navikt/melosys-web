import { Control } from "react-hook-form";
import { DatePickerProps } from "@navikt/ds-react";

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

export type { DateRangeText };
export type DateRangePickerProps = Omit<Props & DatePickerProps, "name">;
export type ExternalDateRangePickerProps = Omit<Props & DatePickerProps, "onRangeChange" | "fieldError">;
