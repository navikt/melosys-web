import * as Nav from "../../../../../navFrontend";
import "../vurderingAarsavregningInngang.css";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import { Heading } from "@navikt/ds-react";

interface TidligereGrunnlagProps {
  control: Control;
  redigerbart: boolean;
  harDeltGrunnlag: boolean;
}

export function TidligereFakturertIAvgiftssystemetInput({
  control,
  redigerbart,
  harDeltGrunnlag,
}: TidligereGrunnlagProps) {
  return (
    <>
      {!harDeltGrunnlag && (
        <Nav.Alert variant="info" size="small" className="informasjonsmeldingIngenInformasjonOmPerioder">
          <Heading size="small">
            Det er ingen informasjon om perioder med medlemskap og forskuddsvis fakturert trygdeavgift i Melosys.
          </Heading>
          <ul>
            <li>
              Hvis trygdeavgiften er forskuddsvis fakturert fra avgiftssystemet, oppgi totalbeløpet som er fakturert.
            </li>
            <li>
              Hvis trygdeavgiften tidligere har vært årsavregnet i avgiftssystemet, oppgi totalbeløpet for endelig
              beregnet trygdeavgift.
            </li>
            <li>Hvis trygdeavgiften ikke er forskuddsvis fakturert, la det være tomt.</li>
          </ul>
        </Nav.Alert>
      )}
      <Forms.Input
        label="Totalt tidligere fakturert trygdeavgift fra Avgiftssystemet:"
        name="totaltForskuddsvisFakturert"
        control={control}
        readOnly={!redigerbart}
        className="tidligere_fakturert_input"
        autoComplete="off"
        type="text"
        numeric
        tillattNegativeTall
      />
    </>
  );
}
