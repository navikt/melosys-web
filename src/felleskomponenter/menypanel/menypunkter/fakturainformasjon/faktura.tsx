/* eslint-disable */
import { useEffect, useState } from "react";
import * as Api from "../../../../services/api";
import { _isEmpty, _uuid } from "../../../../utils";
import { Table } from "@navikt/ds-react";
import moment from "moment";
import KopierbarTekst from "../../../kopierbarTekst";

interface FakturaProps {
  faktura: any;
}

enum FakturaStatus {
  BESTILLT = "BESTILLT",
  INNE_I_OEBS = "INNE_I_OEBS",
  MANGLENDE_INNBETALING = "MANGLENDE_INNBETALING",
  FEIL = "FEIL",
}

interface Fakturainfo {
  dato: string;
  status: FakturaStatus;
  fakturaBelop: number | null;
  ubetaltBelop: number | null;
  feilmelding: string | null;
}

const Dott = ({ farge }: { farge: string }) => <div className={`dott ${farge}`} />;

const FakturaStatusMapper = {
  [FakturaStatus.BESTILLT]: {
    icon: <Dott farge="green" />,
    beskrivelse: "Bestilt",
  },
  [FakturaStatus.INNE_I_OEBS]: {
    icon: <Dott farge="green" />,
    beskrivelse: "Inne i oebs",
  },
  [FakturaStatus.MANGLENDE_INNBETALING]: {
    icon: <Dott farge="red" />,
    beskrivelse: "Manglende innbetaling",
  },
  [FakturaStatus.FEIL]: {
    icon: <Dott farge="red" />,
    beskrivelse: "FEIL",
  },
};

const mapPeriodeTilKvartalString = (periodeFra: string, periodeTil: string) => {
  const fraDato = new Date(periodeFra);
  const tilDato = new Date(periodeTil);

  if (isNaN(fraDato.getTime()) || isNaN(tilDato.getTime())) {
    return "Ugyldig dato";
  }

  const kvartal = Math.ceil((fraDato.getMonth() + 1) / 3);
  const år = fraDato.getFullYear().toString().slice(-2);

  return `${kvartal}/${år}`;
};

export const Faktura = ({ faktura }: FakturaProps) => {
  const [fakturainfo, setFakturainfo] = useState<Fakturainfo | undefined>({} as Fakturainfo);
  useEffect(() => {
    if (faktura.id) {
      Api.Faktureringskomponenten.hentFakturainfo(faktura.id).then((res: Fakturainfo[]) => {
        const nyesteMelding = res.sort((a, b) => moment(a.dato).diff(moment(b.dato)))[0];
        setFakturainfo(nyesteMelding);
      });
    }
  }, [faktura]);

  const renderFakturaLinjer = () => {
    return (
      <div className="fakturalinje">
        <div className="fakturanr_wrapper">
          Fakturanr:&nbsp;
          <KopierbarTekst hovertekst="">{faktura.id}</KopierbarTekst>
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

  return (
    <Table.ExpandableRow key={faktura.id} content={renderFakturaLinjer()}>
      <Table.DataCell>{faktura.datoBestilt}</Table.DataCell>
      <Table.DataCell>{mapPeriodeTilKvartalString(faktura.periodeFra, faktura.periodeTil)}</Table.DataCell>
      <Table.DataCell>
        <div className="faktura_status_wrapper">
          {FakturaStatusMapper[(fakturainfo ? fakturainfo.status : faktura.status) as FakturaStatus]?.icon}
          {FakturaStatusMapper[(fakturainfo ? fakturainfo.status : faktura.status) as FakturaStatus]?.beskrivelse}
        </div>
      </Table.DataCell>
      <Table.DataCell>{fakturainfo?.ubetaltBelop?.toFixed(2) || "-"}</Table.DataCell>
    </Table.ExpandableRow>
  );
};
