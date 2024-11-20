import { Box, DatePicker, DatePickerProps, HStack, useDatepicker, useRangeDatepicker, VStack } from "@navikt/ds-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import { DateRange } from "react-day-picker";
import * as Nav from "../../../navFrontend";
import { SKRIV_INN_GYLDIG_DATO } from "../../../kodeverk/feilmeldinger";
import { _uuid } from "../../../utils";
import * as Utils from "../../../utils";

interface ChangeProps {
  control: any;
  label: string;
  hideLabel?: boolean;
  readOnly: boolean;
  onChange: any;
  fieldError: any;
}

type DatovelgerPropsNoOnChange = Omit<ChangeProps & DatePickerProps & UseControllerProps, "onChange" | "fieldError">;
type DateRangePickerProps = ChangeProps & DatePickerProps;

const DateRangePicker = ({
  control,
  label,
  hideLabel,
  fromDate,
  toDate,
  defaultSelected,
  readOnly,
  onChange,
  fieldError,
  ...rest
}: DateRangePickerProps) => {
  const isInitialRender = useRef(true);
  const [error, setError] = useState(false);

  const [localFromDate, setLocalFromDate] = useState(fromDate ?? new Date(0));
  const [localToDate, setLocalToDate] = useState(new Date(2100, 1, 1));

  const [from, setFrom] = useState<String>();
  const [to, setTo] = useState<String>();

  const [isValidating, setIsValidating] = useState(false);
  const { datepickerProps, toInputProps, fromInputProps, selectedRange } = useRangeDatepicker({
    defaultSelected: defaultSelected as DateRange,
    fromDate: localFromDate,
    toDate: localToDate,

    onRangeChange: (value?: DateRange) => {
      setFrom(Utils.dato.formatterDatoTilNorsk(value?.from, false, undefined));
      setTo(Utils.dato.formatterDatoTilNorsk(value?.to, false, undefined));
    },

    onValidate: (err) => {
      err.from.isValidDate && err.to.isValidDate ? setError(false) : setError(true);
    },
  });

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    setIsValidating(true);

    if (!error) {
      // create event when both dates are valid
      onChange({ fomDato: from, tomDato: to });
      setIsValidating(false);
    }
  }, [from, to]);

  return (
    <>
      <DatePicker {...datepickerProps}>
        <HStack gap={{ sm: "2" }} justify="center" wrap={false}>
          <Controller
            control={control}
            name="inntektskilder.0.fomDato"
            render={({ field }) => {
              return (
                <DatePicker.Input
                  id={_uuid()}
                  label={label}
                  hideLabel={hideLabel}
                  size="small"
                  readOnly={readOnly}
                  {...fromInputProps}
                />
              );
            }}
          />

          <Controller
            control={control}
            name="inntektskilder.0.tomDato"
            render={({ field }) => {
              return (
                <>
                  <DatePicker.Input
                    id={_uuid()}
                    label=""
                    hideLabel={hideLabel}
                    size="small"
                    readOnly={readOnly}
                    {...toInputProps}
                  />
                </>
              );
            }}
          />
        </HStack>
        {fieldError && (
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
      ...rest
    }: DatovelgerPropsNoOnChange,
    _ref: any
  ) => {
    const rendring = (field: any, fieldError: any) => {
      console.log("field: ", field);
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
            mode="range"
          />
        </>
      );
    };

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error }, formState: { errors } }) => rendring(field, error)}
        {...rest}
      />
    );
  }
);

export default ControlledDateRangePicker;
