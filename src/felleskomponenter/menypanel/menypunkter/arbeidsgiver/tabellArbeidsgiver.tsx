import { useState } from "react";
import { Pagination } from "@navikt/ds-react";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

interface TabellArbeidsgiverType {
  kolonneNavn: string[];
  tabellData: string[][];
  linjerPerSide?: number;
}

export function TabellArbeidsgiver({ kolonneNavn, tabellData, linjerPerSide }: TabellArbeidsgiverType) {
  const [page, setPage] = useState(1);

  const skalVisePaginering = linjerPerSide && tabellData.length > linjerPerSide;
  const tabellSide = skalVisePaginering
    ? tabellData.slice((page - 1) * linjerPerSide, page * linjerPerSide)
    : tabellData;

  return (
    <div>
      <Nav.Table className="melosys__table">
        <Nav.Table.Header>
          <Nav.Table.Row>
            {kolonneNavn.map((navn) => (
              <Nav.Table.HeaderCell scope="col">{navn}</Nav.Table.HeaderCell>
            ))}
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {tabellSide.map((rad) => (
            <Nav.Table.Row key={Utils._uuid()}>
              {rad.map((celle) => (
                <Nav.Table.DataCell>{celle}</Nav.Table.DataCell>
              ))}
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
      {skalVisePaginering && (
        <Pagination
          page={page}
          onPageChange={setPage}
          count={Math.ceil(tabellData.length / linjerPerSide)}
          size="small"
        />
      )}
    </div>
  );
}

export default TabellArbeidsgiver;
