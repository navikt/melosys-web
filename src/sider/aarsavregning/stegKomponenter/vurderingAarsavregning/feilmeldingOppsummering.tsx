import { Alert, List as NavList } from "../../../../navFrontend";
import { Heading } from "@navikt/ds-react";

export function FeilmeldingOppsummering({ errors }: any) {
  const lagNavlistItem = (melding: string) => {
    return <NavList.Item>{melding}</NavList.Item>;
  };
  const datofeilmelding = (periodeType: string) => {
    return lagNavlistItem(`${periodeType} kan ikke starte før eller slutte etter medlemskapsperioden(e).`);
  };

  const lagSkatteforholdsperiodeError = (skatteforholdsperiodeError: any) => {
    const navlistItems = [];
    const harDatofeil = skatteforholdsperiodeError?.some(
      (error: any) => error.fomDato !== undefined || error.tomDato !== undefined,
    );

    if (harDatofeil) {
      navlistItems.push(datofeilmelding("Skatteforholdsperioden(e)"));
    }

    return navlistItems;
  };

  const lagInntektskildeError = (inntektskildeError: any) => {
    const navlistItems = [];
    const harDatofeil = inntektskildeError?.some(
      (error: any) => error.fomDato !== undefined || error.tomDato !== undefined,
    );
    const harBruttoInntektfeil = inntektskildeError?.some((error: any) => error.bruttoInntekt !== undefined);
    const harKildetypefeil = inntektskildeError?.some((error: any) => error.kildetype !== undefined);

    if (harDatofeil) {
      navlistItems.push(datofeilmelding("Inntektskildeperioden(e)"));
    }
    if (harBruttoInntektfeil) {
      navlistItems.push(lagNavlistItem("Bruttoinntekt må fylles ut"));
    }

    if (harKildetypefeil) {
      navlistItems.push(lagNavlistItem("Inntektskilde må fylles ut"));
    }

    return navlistItems;
  };

  return (
    <Alert variant="warning">
      <Heading spacing size="small" level="3">
        Du må fikse disse feilene før du kan gå videre:
      </Heading>
      <NavList>
        {errors.skatteforholdsperioder && lagSkatteforholdsperiodeError(errors.skatteforholdsperioder)}
        {errors.inntektskilder && lagInntektskildeError(errors.inntektskilder)}
      </NavList>
    </Alert>
  );
}
