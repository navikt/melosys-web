import { ControllerRenderProps, UseFormStateReturn } from "react-hook-form";

const extractMessage = (message: unknown): string | undefined => {
  if (typeof message === "string") return message;
  if (message && typeof message === "object" && "melding" in message) {
    return (message as { melding: string }).melding;
  }
  return undefined;
};

export const getErrorMessage = (
  field: ControllerRenderProps<any, any>,
  formState: UseFormStateReturn<any>,
): string | undefined => {
  // Finner ut om feltnavnet inneholder liste-index
  const match = field.name.match(/(.+)\[(\d)]\.(.+)/);

  if (match) {
    const [, arrayName, index, propertyName] = match;
    // @ts-expect-error generisk beskrivelse
    return extractMessage(formState.errors?.[arrayName]?.[index]?.[propertyName]?.message);
  }

  return extractMessage(formState.errors?.[field.name]?.message);
};
