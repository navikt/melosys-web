import * as Nav from "../../../navFrontend";
import { usePlaceholderKatalog } from "../../../services/api/placeholdere";
import { UtdatertPlaceholder } from "../../../services/modules/placeholdere";

interface Props {
  utdaterte: UtdatertPlaceholder[];
  onSendLikevel: () => void;
  onAvbryt: () => void;
}

function PlaceholderUtdatertVarsel({ utdaterte, onSendLikevel, onAvbryt }: Props) {
  const { data: katalog } = usePlaceholderKatalog();

  const visningsnavn = (nokkel: string) =>
    katalog?.find((beskrivelse) => beskrivelse.nokkel === nokkel)?.visningsnavn || nokkel;

  return (
    <Nav.Modal open onClose={onAvbryt} aria-label="Utdaterte verdier i brevet" width="small">
      <Nav.Modal.Header>
        <Nav.Heading size="small" level="1">
          Noen innsatte verdier er utdaterte
        </Nav.Heading>
      </Nav.Modal.Header>
      <Nav.Modal.Body>
        <Nav.BodyLong>
          Verdiene under ble satt inn tidligere og stemmer ikke lenger med saken. Brevet sendes med teksten slik den
          står nå.
        </Nav.BodyLong>
        <Nav.List>
          {utdaterte.map(({ nokkel, innsattVerdi, ferskVerdi }) => (
            <Nav.List.Item key={`${nokkel} ${innsattVerdi}`}>
              {visningsnavn(nokkel)}: innsatt {innsattVerdi}, nå {ferskVerdi || "ingen verdi"}
            </Nav.List.Item>
          ))}
        </Nav.List>
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Nav.Button variant="primary" onClick={onSendLikevel}>
          Send likevel
        </Nav.Button>
        <Nav.Button variant="tertiary" onClick={onAvbryt}>
          Avbryt
        </Nav.Button>
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default PlaceholderUtdatertVarsel;
