import { Alert, List as NavList } from "../../../../navFrontend";
import { Heading } from "@navikt/ds-react";

export const FeilmeldingOppsummering = ({ errors }: any) => {
  return (
    <Alert variant="warning">
      <Heading spacing size="small" level="3">
        Du må fikse disse feilene før du kan gå videre:
      </Heading>
      <NavList>
        {errors.skatteforholdsperioder?.some(
          (error: any) => error.fomDato !== undefined || error.tomDato !== undefined
        ) && (
          <NavList.Item>
            Skatteforholdsperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e).-
          </NavList.Item>
        )}

        {errors.inntektskilder &&
          errors.inntektskilder?.some((error: any) => error.fomDato !== undefined || error.tomDato !== undefined) && (
            <NavList.Item>
              Inntektskildeperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e).
            </NavList.Item>
          )}

        {errors.inntektskilder?.some((error: any) => error.bruttoInntekt !== undefined) && (
          <NavList.Item>trøbbel med inntekta.</NavList.Item>
        )}
      </NavList>
    </Alert>
  );
};
