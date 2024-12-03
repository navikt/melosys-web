import * as Nav from "../../../../../../navFrontend";
import * as KV from "../../../../../../kodeverk";

interface ListeVelgerProps {
  muligeAlternativer: string[] | undefined;
  kodeverkKoder: string[];
  valgtAlternativ: string;
  redigerbart: boolean;
  name: string;
  tittel: string;
  endretAlternativ: (kode: string) => void;
}

export function ListeVelger({
  muligeAlternativer,
  redigerbart,
  valgtAlternativ,
  name,
  kodeverkKoder,
  tittel,
  endretAlternativ,
}: ListeVelgerProps) {
  if (muligeAlternativer?.length === 0) return null;

  return (
    <Nav.Row>
      <Nav.Column xs="7">
        <Nav.Select
          label={tittel}
          onChange={(event) => endretAlternativ(event.target.value)}
          name={name}
          value={valgtAlternativ}
          readOnly={!redigerbart}
        >
          <option key="" value="" disabled>
            Velg...
          </option>
          {muligeAlternativer?.map((alternativ) => (
            <option key={alternativ} value={alternativ}>
              {KV.kodeTilTerm(alternativ, kodeverkKoder)}
            </option>
          ))}
        </Nav.Select>
      </Nav.Column>
    </Nav.Row>
  );
}
