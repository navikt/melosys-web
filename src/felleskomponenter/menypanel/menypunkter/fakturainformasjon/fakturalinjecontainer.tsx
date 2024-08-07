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
          {!faktura.eksternFakturaNummer ? " - " : faktura.eksternFakturaNummer}
        </KopierbarTekst>
      </div>
      <div className="fakturalinje">
        {!faktura.eksternFakturaNummer && (
          <Nav.Alert variant="info">
            Fakturanummer er bare kjent i Melosys når det gjelder en manglende innbetaling, du kan likevel finne faktura
            i OeBS ved å søke på bruker
          </Nav.Alert>
        )}
      </div>

      <Nav.Table>
        <Nav.Table.Header>
          <Nav.Table.Row shadeOnHover={false}>
            <Nav.Table.HeaderCell scope="col" />
            <Nav.Table.HeaderCell scope="col">Antall</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Enhetspris</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Beløp</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {faktura.fakturaLinje.map((fakturaLinje) => (
            <Nav.Table.Row key={Utils._uuid()} shadeOnHover={false}>
              <Nav.Table.DataCell>
                {fakturaLinje.beskrivelse.split("\n").map((line: string) => {
                  return <div key={Utils._uuid()}>{line}</div>;
                })}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell>{fakturaLinje.antall}</Nav.Table.DataCell>
              <Nav.Table.DataCell>{Utils.formaterTilNorskBelop(fakturaLinje.enhetsprisPerManed)}</Nav.Table.DataCell>
              <Nav.Table.DataCell>{Utils.formaterTilNorskBelop(fakturaLinje.belop)}</Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
          {!Utils._isEmpty(faktura.fakturaLinje) && (
            <Nav.Table.Row shadeOnHover={false}>
              <Nav.Table.HeaderCell className="uten-border" />
              <Nav.Table.HeaderCell className="uten-border" />
              <Nav.Table.HeaderCell className="uten-border">Totalt</Nav.Table.HeaderCell>
              <Nav.Table.DataCell className="uten-border">
                {Utils.formaterTilNorskBelop(faktura.fakturaLinje.map((linje) => linje.belop).reduce((a, b) => a + b))}
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          )}
        </Nav.Table.Body>
      </Nav.Table>
    </div>
  );
};
