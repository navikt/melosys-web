/* eslint-disable */
import { useState } from "react";
import * as Utils from "../../../../utils";
import { Table } from "@navikt/ds-react";
import moment from "moment";
import { FakturaLinjeContainer } from "./fakturalinjecontainer";
import { formatterDatoTilNorsk } from "../../../../utils/dato";
import { fakturaserierTypes } from "../../../../ducks/fakturaserier";

interface FakturaProps {
  faktura: fakturaserierTypes.Faktura;
}

const fakturastatusMap = new Map<fakturaserierTypes.FakturaStatus, { farge: string; beskrivelse: string }>([
  [fakturaserierTypes.FakturaStatus.BESTILT, { farge: "green", beskrivelse: "Bestilt" }],
  [fakturaserierTypes.FakturaStatus.INNE_I_OEBS, { farge: "green", beskrivelse: "Inne i OeBS" }],
  [fakturaserierTypes.FakturaStatus.MANGLENDE_INNBETALING, { farge: "red", beskrivelse: "Manglende innbetaling" }],
  [fakturaserierTypes.FakturaStatus.FEIL, { farge: "red", beskrivelse: "Feil" }],
]);

const mapPeriodeTilKvartalString = (periodeFra: string, periodeTil: string) => {
  const fraDato = new Date(periodeFra);
  const tilDato = new Date(periodeTil);

  const fraAar = fraDato.getFullYear();
  const tilAar = tilDato.getFullYear();

  const fraKvartal = Math.ceil((fraDato.getMonth() + 1) / 3);
  const tilKvartal = Math.ceil((tilDato.getMonth() + 1) / 3);

  if (fraAar === tilAar) {
    if (fraKvartal === tilKvartal) {
      return `Q${fraKvartal} ${fraAar}`;
    } else {
      return `Q${fraKvartal} - Q${tilKvartal} ${tilAar}`;
    }
  } else {
    return `Q${fraKvartal} ${fraAar} - Q${tilKvartal} ${tilAar}`;
  }
};

export const Faktura = ({ faktura }: FakturaProps) => {
  const [nyesteFakturaStatus] = useState<fakturaserierTypes.FakturaTilbakemelding | undefined>(
    faktura.eksternFakturaStatus?.slice().sort((a, b) => moment(b.dato).diff(moment(a.dato)))[0]
  );

  const fakturastatus = fakturastatusMap.get(faktura.status);

  return (
    <Table.ExpandableRow key={faktura.fakturaReferanse} content={<FakturaLinjeContainer faktura={faktura} />}>
      <Table.DataCell>{formatterDatoTilNorsk(faktura.sistOppdatert)}</Table.DataCell>
      <Table.DataCell>{mapPeriodeTilKvartalString(faktura.periodeFra, faktura.periodeTil)}</Table.DataCell>
      <Table.DataCell>
        <div className="faktura_status_wrapper">
          <div className={`dott ${fakturastatus?.farge || ""}`} />
          {fakturastatus?.beskrivelse}
        </div>
      </Table.DataCell>
      <Table.DataCell>{Utils.formaterTilNorskBelop(nyesteFakturaStatus?.ubetaltBelop) || "-"}</Table.DataCell>
    </Table.ExpandableRow>
  );
};
