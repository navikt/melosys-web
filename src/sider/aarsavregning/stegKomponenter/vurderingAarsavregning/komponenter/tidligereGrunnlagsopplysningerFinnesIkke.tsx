import * as Nav from "../../../../../navFrontend";
import "../vurderingAarsavregning.css";

const informasjonsmeldingIngenInformasjonOmPerioder = (
  <Nav.Alert variant="info" size="small" className="informasjonsmeldingIngenInformasjonOmPerioder">
    Det er ingen informasjon om perioder med medlemskap og forskuddsvis fakturert trygdeavgift i Melosys.
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

export const TidligereGrunnlagsopplysningerFinnesIkke = () => (
  <div className="skjema__panel">
    <Nav.Typo.Undertittel className="ingenInformasjonOmPerioderTittel">
      Grunnlagsopplysninger for trygdeavgift
    </Nav.Typo.Undertittel>

    {informasjonsmeldingIngenInformasjonOmPerioder}

    <Nav.Fieldset legend="" className="skjema__fieldset">
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.TextField label="Totalt tidligere fakturert trygdeavgift:" type="number" />
        </Nav.Column>
      </Nav.Row>
    </Nav.Fieldset>
  </div>
);
