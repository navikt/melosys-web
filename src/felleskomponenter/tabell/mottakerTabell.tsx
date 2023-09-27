import * as Utils from "../../utils";
import { Table } from "@navikt/ds-react";

interface MottakerTabellProps {
  rader: {
    verdi: string | JSX.Element | null;
    style?: string;
  }[][];
  kolonner: {
    verdi: string;
    bredde: string;
    style?: string;
  }[];
}

const MottakerTabell = ({ rader, kolonner }: MottakerTabellProps) => {
  if (!rader || !kolonner) return null;
  return (
    <Table>
      <Table.Header>
        {kolonner.map((kolonne) => (
          <Table.HeaderCell key={Utils._uuid()} style={{ width: kolonne.bredde }}>
            {kolonne.verdi}
          </Table.HeaderCell>
        ))}
      </Table.Header>
      <Table.Body>
        {rader.map((rad) => (
          <Table.Row key={Utils._uuid()}>
            {rad.map((radElement) => (
              <Table.DataCell key={Utils._uuid()}>{radElement.verdi}</Table.DataCell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default MottakerTabell;
