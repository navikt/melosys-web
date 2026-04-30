import PT from "prop-types";

import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";

export function EnkeltArbeidsforholdUtland({ redigerbart, overordnetFeltNavn, className }) {
  return (
    <div className={className}>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input label="Navn på virksomheten" feltNavn={`${overordnetFeltNavn}.navn`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Input label="Registreringsnummer" feltNavn={`${overordnetFeltNavn}.orgnr`} disabled={!redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Skjema.Input
            label="Bygning"
            feltNavn={`${overordnetFeltNavn}.adresse.tilleggsnavn`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input label="Gate/veg" feltNavn={`${overordnetFeltNavn}.adresse.gatenavn`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Input
            label="Husnummer"
            feltNavn={`${overordnetFeltNavn}.adresse.husnummerEtasjeLeilighet`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input label="Poststed" feltNavn={`${overordnetFeltNavn}.adresse.poststed`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Input
            label="Postnummer"
            feltNavn={`${overordnetFeltNavn}.adresse.postnummer`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Skjema.Input label="Postboks" feltNavn={`${overordnetFeltNavn}.adresse.postboks`} disabled />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input label="Region" feltNavn={`${overordnetFeltNavn}.adresse.region`} disabled />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.LandVelger
            label="Land"
            feltNavn={`${overordnetFeltNavn}.adresse.landkode`}
            disabled={!redigerbart}
            bredde="fullbredde"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Skjema.Checkbox
            label="Tilhører virksomheten samme konsern som den norske arbeidsgiveren?"
            feltNavn={`${overordnetFeltNavn}.tilhorerSammeKonsern`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
}

EnkeltArbeidsforholdUtland.propTypes = {
  redigerbart: PT.bool.isRequired,
  overordnetFeltNavn: PT.string.isRequired,
  className: PT.string,
};

export default EnkeltArbeidsforholdUtland;
