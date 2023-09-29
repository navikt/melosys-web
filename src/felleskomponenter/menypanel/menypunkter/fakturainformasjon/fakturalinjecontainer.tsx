import { Table } from "@navikt/ds-react";
import KopierbarTekst from "../../../kopierbarTekst";
import { _isEmpty, _uuid } from "../../../../utils";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE } from "../../../../featuretoggle/toggleNavn";
import { useFeatureToggle } from "../../../../featuretoggle";

interface FakturaLinjeProps {
  faktura: any;
  fakturaNummer: string | undefined | null;
}

export const FakturaLinjeContainer = ({ faktura, fakturaNummer }: FakturaLinjeProps) => {
  const visReferanseEnabled = useFeatureToggle(MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE);

  return (
    <div className="fakturalinje">
      {visReferanseEnabled && (
        <div className="fakturanr_wrapper">
          FakturaID:&nbsp;
          <KopierbarTekst hovertekst="">{faktura.id}</KopierbarTekst>
        </div>
      )}
      <div className="fakturanr_wrapper">
        Fakturanr:&nbsp;
        <KopierbarTekst hovertekst="">{fakturaNummer ?? "Ikke generert enda"}</KopierbarTekst>
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
          {faktura.fakturaLinje.map((fakturaLinje: any) => (
            <Table.Row key={_uuid()} shadeOnHover={false}>
              <Table.DataCell>{fakturaLinje.beskrivelse}</Table.DataCell>
              <Table.DataCell>1</Table.DataCell>
              <Table.DataCell>{fakturaLinje.belop.toFixed(2)}</Table.DataCell>
              <Table.DataCell>{fakturaLinje.belop.toFixed(2)}</Table.DataCell>
            </Table.Row>
          ))}
          {!_isEmpty(faktura.fakturaLinje) && (
            <Table.Row shadeOnHover={false}>
              <Table.HeaderCell className="uten-border" />
              <Table.HeaderCell className="uten-border" />
              <Table.HeaderCell className="uten-border">Totalt</Table.HeaderCell>
              <Table.DataCell className="uten-border">
                {faktura.fakturaLinje
                  .map((linje: any) => linje.belop)
                  .reduce((a: any, b: any) => a + b)
                  .toFixed(2)}
              </Table.DataCell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  );
};
