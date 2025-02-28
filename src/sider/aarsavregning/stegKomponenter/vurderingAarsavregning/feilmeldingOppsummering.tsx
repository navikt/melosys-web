import { Alert, List as NavList } from "../../../../navFrontend";
import { Heading } from "@navikt/ds-react";

const lagNavlistItem = (melding: string) => {
  return <NavList.Item>{melding}</NavList.Item>;
};

const lagDatofeilmelding = (periodeType: string) => {
  return lagNavlistItem(`${periodeType} kan ikke starte før eller slutte etter medlemskapsperioden(e).`);
};

export function FeilmeldingOppsummering({ errors }: any) {
  const skatteforholdErrors = [];
  const harDatofeil = errors.skatteforholdsperioder?.some(
    (error: any) => error.fomDato !== undefined || error.tomDato !== undefined,
  );

  if (harDatofeil) {
    skatteforholdErrors.push(lagDatofeilmelding("Skatteforholdsperioden(e)"));
  }

  const inntektskildeErrors = [];
  const inntektskilderHarDatofeil = errors.inntektskilder?.some(
    (error: any) => error.fomDato !== undefined || error.tomDato !== undefined,
  );
  const harBruttoInntektfeil = errors.inntektskilder?.some((error: any) => error.bruttoInntekt !== undefined);
  const harKildetypefeil = errors.inntektskilder?.some((error: any) => error.kildetype !== undefined);

  if (inntektskilderHarDatofeil) {
    inntektskildeErrors.push(lagDatofeilmelding("Inntektskildeperioden(e)"));
  }
  if (harBruttoInntektfeil) {
    inntektskildeErrors.push(lagNavlistItem("Bruttoinntekt må fylles ut"));
  }

  if (harKildetypefeil) {
    inntektskildeErrors.push(lagNavlistItem("Inntektskilde må fylles ut"));
  }

  if (!skatteforholdErrors.length && !inntektskildeErrors.length) {
    return null;
  }

  return (
    <Alert variant="warning">
      <Heading spacing size="small" level="3">
        Du må fikse disse feilene før du kan gå videre:
      </Heading>
      <NavList>
        {skatteforholdErrors}
        {inntektskildeErrors}
      </NavList>
    </Alert>
  );
}
