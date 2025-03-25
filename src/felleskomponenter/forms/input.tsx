import { ComponentProps, forwardRef } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

type InputInnerComponentProps = ComponentProps<typeof Nav.TextField> & RegisterHookFormProps;

function InputInnerComponent({ ...props }: InputInnerComponentProps) {
  return <Nav.TextField {...props} />;
}

const filterIkkeNumeriskeTegn = (verdi: string, tillattNegativeTall: boolean) => {
  if (tillattNegativeTall) {
    let nyVerdi = verdi.replace(/[^0-9-]/g, "");

    if (nyVerdi.indexOf("-") !== -1) {
      nyVerdi = (nyVerdi.startsWith("-") ? "-" : "") + nyVerdi.replace(/-/g, "");
    }

    return nyVerdi;
  } else {
    return verdi.replace(/[^0-9]/g, "");
  }
};

type InputProps = Omit<ComponentProps<typeof Nav.TextField>, "onChange"> &
  UseControllerProps & {
    onChange?: (value: string) => void;
    numeric?: boolean;
    tillattNegativeTall?: boolean;
  };

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, control, error, numeric, tillattNegativeTall, ...rest }: InputProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <InputInnerComponent
            {...field}
            {...rest}
            inputMode={numeric ? "numeric" : rest.inputMode}
            pattern={numeric ? (tillattNegativeTall ? "^-?[0-9]+$" : "[0-9]*") : rest.pattern}
            onChange={(event: any) => {
              if (numeric && event?.target?.value) {
                event.target.value = filterIkkeNumeriskeTegn(event.target.value, tillattNegativeTall ?? false);
              }

              field.onChange(event);
              if (rest.onChange) rest.onChange(event?.target?.value);
            }}
            error={error ?? getErrorMessage(field, formState)}
          />
        )}
      />
    );
  },
);

export default Input;
