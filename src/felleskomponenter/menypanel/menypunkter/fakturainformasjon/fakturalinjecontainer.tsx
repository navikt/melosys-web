import { Table } from "@navikt/ds-react";
import KopierbarTekst from "../../../kopierbarTekst";
import * as Utils from "../../../../utils";
import { fakturaserierTypes } from "../../../../ducks/fakturaserier";
import * as Nav from "../../../../navFrontend";

interface FakturaLinjeContainerProps {
  faktura: fakturaserierTypes.Faktura;
}

export const FakturaLinjeContainer = ({ faktura }: FakturaLinjeContainerProps) => {
  return (
    <div className="fakturalinje">
      <div className="fakturanr_wrapper">
        Fakturanr:&nbsp;
        <KopierbarTekst hovertekst="">
          {Utils._isEmpty(faktura.eksternFakturaNummer) || Utils._isNil(faktura.eksternFakturaNummer)
            ? " - "
            : faktura.eksternFakturaNummer}
        </KopierbarTekst>
      </div>
      <div className="fakturalinje">
        {(Utils._isEmpty(faktura.eksternFakturaNummer) || Utils._isNil(faktura.eksternFakturaNummer)) && (
          <Nav.AlertStripeInfo>
            Fakturanummer er bare kjent i Melosys når det gjelder en manglende innbetaling, du kan likevel finne faktura
            i OeBS ved å søke på bruker"
          </Nav.AlertStripeInfo>
        )}
      </div>

      <Table>
        <Table.Header>
          <Table.Row shadeOnHover={false}>
            <Table.HeaderCell scope="col" />
            <Table.HeaderCell scope="col">Antall</Table.HeaderCell>
            <Table.HeaderCell scope="col">Enhetspris</Table.HeaderCell>
            <Table.HeaderCell scope="col">Beløp</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {faktura.fakturaLinje.map((fakturaLinje) => (
            <Table.Row key={Utils._uuid()} shadeOnHover={false}>
              <Table.DataCell>
                {fakturaLinje.beskrivelse.split("\n").map((line: string) => {
                  return <div key={Utils._uuid()}>{line}</div>;
                })}
              </Table.DataCell>
              <Table.DataCell>{fakturaLinje.antall}</Table.DataCell>
              <Table.DataCell>{Utils.formaterTilNorskBelop(fakturaLinje.enhetsprisPerManed)}</Table.DataCell>
              <Table.DataCell>{Utils.formaterTilNorskBelop(fakturaLinje.belop)}</Table.DataCell>
            </Table.Row>
          ))}
          {!Utils._isEmpty(faktura.fakturaLinje) && (
            <Table.Row shadeOnHover={false}>
              <Table.HeaderCell className="uten-border" />
              <Table.HeaderCell className="uten-border" />
              <Table.HeaderCell className="uten-border">Totalt</Table.HeaderCell>
              <Table.DataCell className="uten-border">
                {Utils.formaterTilNorskBelop(faktura.fakturaLinje.map((linje) => linje.belop).reduce((a, b) => a + b))}
              </Table.DataCell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  );
};
