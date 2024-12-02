import { ComponentProps, forwardRef } from "react";
import { RegisterHookFormProps } from "./misc/reacthookProps";
import { Controller, UseControllerProps } from "react-hook-form";
import { getErrorMessage } from "./misc/mapFeilmelding";
import MultiSelectPlain from "../multiSelect";

type MultiSelectComponentProps = Omit<ComponentProps<typeof MultiSelectPlain>, "onChange"> & {
  redigerbart: boolean;
  onChange: (selectedOptions: string[]) => void;
  values: string[];
};

type MultiSelectInnerComponentProps = MultiSelectComponentProps & RegisterHookFormProps;

const MultiSelectInnerComponent = ({
  label,
  redigerbart,
  onChange,
  name,
  feil,
  options,
  values,
  ...rest
}: MultiSelectInnerComponentProps) => {
  return (
    <MultiSelectPlain
      label={label}
      redigerbart={redigerbart}
      onChange={(selectedOptions) => {
        const selectedValues = selectedOptions.map(({ value }) => value);
        onChange(selectedValues);
      }}
      values={values}
      options={options}
      feil={feil}
      {...rest}
    />
  );
};

type MultiSelectProps = Omit<MultiSelectComponentProps, "onChange" | "values"> &
  UseControllerProps & {
    onChange?: (selectedOptions: string[]) => void;
  };

const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps>(
  ({ name, control, label, redigerbart, onChange, ...rest }: MultiSelectProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <MultiSelectInnerComponent
            {...field}
            label={label}
            redigerbart={redigerbart}
            onChange={(event: any) => {
              field.onChange(event);
              if (onChange) onChange(event?.target?.value);
            }}
            feil={getErrorMessage(field, formState)}
            values={field.value}
            {...rest}
          />
        )}
      />
    );
  }
);

export default MultiSelect;
