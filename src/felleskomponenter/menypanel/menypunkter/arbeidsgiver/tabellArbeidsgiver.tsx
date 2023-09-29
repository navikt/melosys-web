import { useState } from "react";
import { Pagination, Table } from "@navikt/ds-react";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

type TabellArbeidsgiverType = {
  kolonneNavn: string[];
  tabellData: string[][];
  linjerPerSide?: number;
};

export const TabellArbeidsgiver = ({ kolonneNavn, tabellData, linjerPerSide }: TabellArbeidsgiverType) => {
  const [page, setPage] = useState(1);

  const skalVisePaginering = linjerPerSide && tabellData.length > linjerPerSide;
  const tabellSide = skalVisePaginering
    ? tabellData.slice((page - 1) * linjerPerSide, page * linjerPerSide)
    : tabellData;

  return (
    <div>
      <Nav.Typo.Undertittel className="arbeidsavtaler__historisk__overskrift">Inntekt</Nav.Typo.Undertittel>
      <Table className="melosys__table">
        <Table.Header>
          <Table.Row>
            {kolonneNavn.map((navn) => (
              <Table.HeaderCell scope="col">{navn}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tabellSide.map((rad) => (
            <Table.Row key={Utils._uuid()}>
              {rad.map((celle) => (
                <Table.DataCell>{celle}</Table.DataCell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
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
};

export default TabellArbeidsgiver;
