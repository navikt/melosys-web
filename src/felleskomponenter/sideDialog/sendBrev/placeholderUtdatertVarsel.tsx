import * as Nav from "../../../navFrontend";
import { useBetingelseKatalog, usePlaceholderKatalog } from "../../../services/api/placeholdere";
import { UtdatertPlaceholder } from "../../../services/modules/placeholdere";

interface Props {
  utdaterte: UtdatertPlaceholder[];
  uopploste: string[];
  onSendLikevel: () => void;
  onAvbryt: () => void;
}

const overskriftFor = (harUtdaterte: boolean, harUopploste: boolean): string => {
  if (harUtdaterte && harUopploste) return "Sjekk innholdet i brevet";
  return harUtdaterte ? "Noen innsatte verdier er utdaterte" : "Brevet inneholder uoppløste betingelser";
};

function PlaceholderUtdatertVarsel({ utdaterte, uopploste, onSendLikevel, onAvbryt }: Props) {
  const { data: katalog } = usePlaceholderKatalog();
  const { data: betingelseKatalog } = useBetingelseKatalog();

  const visningsnavn = (nokkel: string) =>
    katalog?.find((beskrivelse) => beskrivelse.nokkel === nokkel)?.visningsnavn || nokkel;

  const betingelsesnavn = (nokkel: string) =>
    betingelseKatalog?.find((beskrivelse) => beskrivelse.nokkel === nokkel)?.visningsnavn || nokkel;

  return (
    <Nav.Modal open onClose={onAvbryt} aria-label="Sjekk innholdet i brevet" width="small">
      <Nav.Modal.Header>
        <Nav.Heading size="small" level="1">
          {overskriftFor(utdaterte.length > 0, uopploste.length > 0)}
        </Nav.Heading>
      </Nav.Modal.Header>
      <Nav.Modal.Body>
        {utdaterte.length > 0 && (
          <>
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
          </>
        )}
        {uopploste.length > 0 && (
          <>
            <Nav.BodyLong>
              Brevet inneholder uoppløste betingelser — disse må fjernes eller fylles ut manuelt.
            </Nav.BodyLong>
            <Nav.List>
              {uopploste.map((nokkel) => (
                <Nav.List.Item key={nokkel}>{betingelsesnavn(nokkel)}</Nav.List.Item>
              ))}
            </Nav.List>
          </>
        )}
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
