import * as Nav from "../../../../../../navFrontend";
import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import * as KV from "../../../../../../kodeverk";

type ListeVelgerProps = {
  muligeAlternativer: string[] | undefined;
  kodeverkKoder: string[];
  valgtAlternativ: string;
  redigerbart: boolean;
  name: string;
  tittel: string;
  endretAlternativ: (kode: string) => void;
};

export const ListeVelger = ({
  muligeAlternativer,
  redigerbart,
  valgtAlternativ,
  name,
  kodeverkKoder,
  tittel,
  endretAlternativ,
}: ListeVelgerProps) => {
  if (muligeAlternativer?.length === 0) return null;

  return (
    <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst label={tittel} />}>
      <Nav.Row>
        <Nav.Column xs="7">
          <Nav.Select
            label=""
            bredde="fullbredde"
            onChange={(event) => endretAlternativ(event.target.value)}
            name={name}
            value={valgtAlternativ}
            disabled={!redigerbart}
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
    </Nav.Fieldset>
  );
};
