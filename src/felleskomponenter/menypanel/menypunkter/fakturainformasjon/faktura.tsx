/* eslint-disable */
import { useEffect, useState } from "react";
import * as Api from "../../../../services/api";
import { _isEmpty, _uuid, formaterTilNorskBelop } from "../../../../utils";
import { Table } from "@navikt/ds-react";
import moment from "moment";
import KopierbarTekst from "../../../kopierbarTekst";
import { FakturaLinjeContainer } from "./fakturalinjecontainer";

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
  fakturaNummer: string | null;
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
    beskrivelse: "Feil",
  },
};

const mapPeriodeTilKvartalString = (periodeFra: string, periodeTil: string) => {
  const fraDato = new Date(periodeFra);
  const tilDato = new Date(periodeTil);

  const fraAar = fraDato.getFullYear();
  const tilAar = tilDato.getFullYear();

  const fraKvartal = Math.ceil((fraDato.getMonth() + 1) / 3);
  const tilKvartal = Math.ceil((tilDato.getMonth() + 1) / 3);

  return `${fraKvartal}/${fraAar % 100} - ${tilKvartal}/${tilAar % 100}`;
};

export const Faktura = ({ faktura }: FakturaProps) => {
  const [fakturainfo, setFakturainfo] = useState<Fakturainfo | undefined>(
    faktura.fakturaMottat?.slice().sort((a: any, b: any) => moment(b.dato).diff(moment(a.dato)))[0]
  );

  return (
    <Table.ExpandableRow
      key={faktura.id}
      content={<FakturaLinjeContainer faktura={{ ...faktura }} fakturaNummer={fakturainfo?.fakturaNummer} />}
    >
      <Table.DataCell>{faktura.datoBestilt}</Table.DataCell>
      <Table.DataCell>{mapPeriodeTilKvartalString(faktura.periodeFra, faktura.periodeTil)}</Table.DataCell>
      <Table.DataCell>
        <div className="faktura_status_wrapper">
          {FakturaStatusMapper[(fakturainfo ? fakturainfo.status : faktura.status) as FakturaStatus]?.icon}
          {FakturaStatusMapper[(fakturainfo ? fakturainfo.status : faktura.status) as FakturaStatus]?.beskrivelse}
        </div>
      </Table.DataCell>
      <Table.DataCell>{formaterTilNorskBelop(fakturainfo?.ubetaltBelop) || "-"}</Table.DataCell>
    </Table.ExpandableRow>
  );
};
