import * as Nav from "../../../../../navFrontend";
import "../vurderingAarsavregning.css";
import { FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";

interface TidligereGrunnlagProps {
  formValues: FormValuesProps;
  control: Control;
  redigerbart: boolean;
}

const informasjonsmeldingIngenInformasjonOmPerioder = (
  <Nav.Alert variant="info" size="small" className="informasjonsmeldingIngenInformasjonOmPerioder">
    <h3>Det er ingen informasjon om perioder med medlemskap og forskuddsvis fakturert trygdeavgift i Melosys.</h3>
    <ul>
      <li>Hvis trygdeavgiften er forskuddsvis fakturert fra avgiftssystemet, oppgi totalbeløpet som er fakturert.</li>
      <li>
        Hvis trygdeavgiften tidligere har vært årsavregnet i avgiftssystemet, oppgi totalbeløpet for endelig beregnet
        trygdeavgift.
      </li>
      <li>Hvis trygdeavgiften ikke er forskuddsvis fakturert, la det være tomt.</li>
    </ul>
  </Nav.Alert>
);

export const TidligereGrunnlagsopplysningerFinnesIkke = ({ control, redigerbart }: TidligereGrunnlagProps) => (
  <div className="skjema__panel">
    <Nav.Typo.Undertittel className="ingenInformasjonOmPerioderTittel">
      Grunnlagsopplysninger for trygdeavgift
    </Nav.Typo.Undertittel>

    {informasjonsmeldingIngenInformasjonOmPerioder}

    <Nav.Typo.Element>Totalt tidligere fakturert trygdeavgift:</Nav.Typo.Element>
    <Forms.Input
      label=""
      name="totaltForskuddsvisFakturert"
      control={control}
      disabled={!redigerbart}
      className="tidligere_fakturert_input"
    />
  </div>
);
