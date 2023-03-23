import { ControllerRenderProps, UseFormStateReturn } from "react-hook-form";

export const getErrorMessage = (
  field: ControllerRenderProps<any, any>,
  formState: UseFormStateReturn<any>
): string | undefined => {
  const match = field.name.match(/(.+)\[(\d)]\.(.+)/);

  if (match) {
    const [, arrayName, index, propertyName] = match;
    // @ts-ignore
    return formState.errors?.[arrayName]?.[index]?.[propertyName]?.message?.melding;
  }

  // @ts-ignore
  return formState.errors?.[field.name]?.message?.melding;
};
