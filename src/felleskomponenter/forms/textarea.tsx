import { ComponentProps, forwardRef } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

type TextareaInnerComponentProps = ComponentProps<typeof Nav.Textarea> & RegisterHookFormProps;

function TextareaInnerComponent({ ...props }: TextareaInnerComponentProps) {
  return <Nav.Textarea {...props} />;
}

type TextareaProps = Omit<ComponentProps<typeof Nav.Textarea>, "onChange"> &
  UseControllerProps & {
    onChange?: (value: string) => void;
  };

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ name, control, error, ...rest }: TextareaProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <TextareaInnerComponent
            {...field}
            {...rest}
            onChange={(event: any) => {
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

export default Textarea;
