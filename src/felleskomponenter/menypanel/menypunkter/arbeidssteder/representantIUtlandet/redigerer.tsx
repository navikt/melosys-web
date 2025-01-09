import * as Skjema from "../../../../skjema";
import * as Nav from "../../../../../navFrontend";
import Adresselinjer from "./adresselinjer";

interface RedigererProps {
  redigerbart: boolean;
}

function Redigerer({ redigerbart }: RedigererProps) {
  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="9">
          <Skjema.Input
            disabled={!redigerbart}
            feltNavn="representantIUtlandet.representantNavn"
            label="Navn på arbeidssted/skip/innretning"
          />
        </Nav.Column>
      </Nav.Row>
      <Adresselinjer redigerbart={redigerbart} />
      <Nav.Row>
        <Nav.Column xs="9">
          <Skjema.LandVelger disabled feltNavn="soknadsland.landkoder[0]" label="Land" bredde="fullbredde" />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
}

export default Redigerer;
