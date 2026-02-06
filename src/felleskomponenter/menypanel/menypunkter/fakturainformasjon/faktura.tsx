import { useState } from "react";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import moment from "moment";
import { FakturaLinjeContainer } from "./fakturalinjecontainer";
import { formatterDatoTilNorsk } from "../../../../utils/dato";
import { fakturaserierTypes } from "../../../../ducks/fakturaserier";
import { FakturaMedSerieReferanse } from "./fakturainformasjon";

interface FakturaProps {
  faktura: FakturaMedSerieReferanse;
  visReferanse?: boolean;
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

  if (fraKvartal === tilKvartal) {
    return `Q${fraKvartal} ${fraAar}`;
  } else {
    return `Q${fraKvartal} - Q${tilKvartal} ${tilAar}`;
  }
};

export const Faktura = ({ faktura, visReferanse }: FakturaProps) => {
  const [nyesteFakturaStatus] = useState<fakturaserierTypes.FakturaTilbakemelding | undefined>(
    faktura.eksternFakturaStatus?.slice().sort((a, b) => moment(b.dato).diff(moment(a.dato)))[0],
  );

  const fakturastatus = fakturastatusMap.get(faktura.status);

  return (
    <Nav.Table.ExpandableRow key={faktura.fakturaReferanse} content={<FakturaLinjeContainer faktura={faktura} />}>
      <Nav.Table.DataCell>{formatterDatoTilNorsk(faktura.sistOppdatert)}</Nav.Table.DataCell>
      <Nav.Table.DataCell>{mapPeriodeTilKvartalString(faktura.periodeFra, faktura.periodeTil)}</Nav.Table.DataCell>
      <Nav.Table.DataCell>
        <div className="faktura_status_wrapper">
          <div className={`dott ${fakturastatus?.farge || ""}`} />
          {fakturastatus?.beskrivelse}
        </div>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>{Utils.formaterTilNorskBelop(nyesteFakturaStatus?.ubetaltBelop) || "-"}</Nav.Table.DataCell>
      {visReferanse && <Nav.Table.DataCell>{faktura.fakturaserieReferanse}</Nav.Table.DataCell>}
    </Nav.Table.ExpandableRow>
  );
};
