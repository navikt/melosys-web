import { Box, DatePicker, DatePickerProps, HStack, useDatepicker, useRangeDatepicker, VStack } from "@navikt/ds-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Controller, FieldError, UseControllerProps } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { SKRIV_INN_GYLDIG_DATO } from "../../../kodeverk/feilmeldinger";
import { _uuid } from "../../../utils";
import * as Utils from "../../../utils";

interface ChangeProps {
  control: any;
  label: string;
  hideLabel?: boolean;
  readOnly: boolean;
  onChange: any;
  fieldError?: FieldError;
  showFieldError?: boolean;
}

type DatovelgerPropsNoOnChange = Omit<ChangeProps & DatePickerProps & UseControllerProps, "onChange" | "fieldError">;
type DateRangePickerProps = ChangeProps & DatePickerProps;

const DateRangePicker = ({
  label,
  hideLabel,
  fromDate,
  toDate,
  defaultSelected,
  readOnly,
  onChange,
  fieldError,
  showFieldError,
}: DateRangePickerProps) => {
  console.log("dates:::", fromDate, toDate);
  const isInitialRender = useRef(true);

  const [from, setFrom] = useState<String>();
  const [to, setTo] = useState<String>();

  const [defaultFromDate] = useState(fromDate ? fromDate : new Date(0));
  const [defaultToDate] = useState(toDate ?? new Date(2100, 1, 1));

  const { datepickerProps, toInputProps, fromInputProps, selectedRange } = useRangeDatepicker({
    defaultSelected: defaultSelected as DateRange,
    fromDate: defaultFromDate,
    toDate: defaultToDate,

    onRangeChange: (value?: DateRange) => {
      setFrom(Utils.dato.formatterDatoTilNorsk(value?.from, false, undefined));
      setTo(Utils.dato.formatterDatoTilNorsk(value?.to, false, undefined));
    },
  });

  // Oppdater FormFields med state verdi
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    onChange({ fomDato: from, tomDato: to });
  }, [from, to]);

  return (
    <>
      <DatePicker {...datepickerProps}>
        <HStack gap={{ sm: "2" }} justify="center" wrap={false}>
          <DatePicker.Input
            id={_uuid()}
            label={label}
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
          <div role="alert" aria-live="assertive" className="datovelger__feilmelding">
            {SKRIV_INN_GYLDIG_DATO.melding}
          </div>
        )}
      </DatePicker>
    </>
  );
};

const ControlledDateRangePicker = forwardRef<HTMLSelectElement, DatovelgerPropsNoOnChange>(
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
    }: DatovelgerPropsNoOnChange,
    _ref: any
  ) => {
    const rendring = (field: any, fieldError?: FieldError) => {
      return (
        <>
          <DateRangePicker
            control={control}
            label={label}
            hideLabel={hideLabel}
            fromDate={fromDate}
            toDate={toDate}
            defaultSelected={defaultSelected as DateRange}
            readOnly={readOnly}
            onChange={(value: any) => {
              field.onChange({ ...field.value, fomDato: value.fomDato || "", tomDato: value.tomDato || "" });
            }}
            fieldError={fieldError}
            showFieldError={showFieldError}
            mode="range"
          />
        </>
      );
    };

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => rendring(field, error)}
        {...rest}
      />
    );
  }
);

export default ControlledDateRangePicker;
