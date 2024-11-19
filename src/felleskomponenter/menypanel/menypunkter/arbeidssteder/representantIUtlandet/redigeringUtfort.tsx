import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";

interface RedigeringUtfortProps {
  adresselinjer: string[];
  soknadsland: string[];
}
const RedigeringUtfort = ({ adresselinjer, soknadsland }: RedigeringUtfortProps) => (
  <Nav.Row>
    <Nav.Column xs="9">
      {adresselinjer?.map((adresselinje) => (
        <Nav.BodyLong size="small" key={Utils._uuid()}>
          {adresselinje}
        </Nav.BodyLong>
      ))}
      <Nav.BodyLong size="small">{KV.kodeTilTerm(soknadsland[0], MKV.KTObjects.land_iso2)}</Nav.BodyLong>
    </Nav.Column>
  </Nav.Row>
);

export default RedigeringUtfort;
