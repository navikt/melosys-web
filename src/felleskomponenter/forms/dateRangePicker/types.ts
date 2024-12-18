import { Control, UseControllerProps } from "react-hook-form";
import { DatePickerProps, DateInputProps } from "@navikt/ds-react";
import { ComponentProps } from "react";
import * as Nav from "../../../navFrontend";

interface DateRangeText {
  from?: string;
  to?: string;
}

type InputProps = Omit<ComponentProps<typeof Nav.TextField>, "onChange"> &
  UseControllerProps & {
    onChange?: (value: string) => void;
  };

//DateInputProps:: label, hidelabel
interface Props {
  control: Control;
  onRangeChange: (dateRange: DateRangeText) => void;
  fieldError?: any;
  showFieldError?: boolean;
}

export type { DateRangeText };
export type DateRangePickerProps = Props & DatePickerProps & DateInputProps;
//export type ExternalDateRangePickerProps = Omit<Props & DatePickerProps, "onRangeChange" | "fieldError">;
export type ExternalDateRangePickerProps = Omit<DateRangePickerProps, "mode" | "onRangeChange" | "fieldError">;
