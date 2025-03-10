import { FormErrors } from "redux-form";

interface ErrorObject {
  melding?: string;
  error?: { melding: string };
}

type ErrorsInput = Record<string, ErrorObject | string> | FormErrors<any> | null | undefined;

interface FeilmeldingOptions {
  tittel?: string;
  bareStrenger?: boolean;
}

const extractErrorMessages = (errors: ErrorsInput): string[] => {
  if (!errors) return [];

  return Object.values(errors)
    .flatMap((error) => {
      if (!error) return [];

      if (typeof error === "string") {
        return error;
      }

      if (typeof error === "object") {
        if ("melding" in error && typeof error.melding === "string") {
          return error.melding;
        }

        return extractErrorMessages(error);
      }

      return "Noe gikk galt";
    })
    .filter(Boolean);
};

export function syncErrorsTilFeilmelding(
  errors: ErrorsInput,
  options?: string | FeilmeldingOptions,
): string[] | React.ReactElement {
  const opts: FeilmeldingOptions = typeof options === "string" ? { tittel: options } : options || {};
  const { tittel, bareStrenger = false } = opts;

  const messages = extractErrorMessages(errors);

  if (bareStrenger) return messages;

  return (
    <>
      {tittel && <p>{tittel}</p>}
      {messages.length > 0 && (
        <ul>
          {messages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export function hentEnkeltFeilmelding(errors: ErrorsInput): string | undefined {
  return extractErrorMessages(errors)[0];
}
