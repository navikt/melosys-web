import { HStack, VStack } from "@navikt/ds-react";
import { Avgift, Trygdeavgiftsperiode } from "../../../../services/modules/aarsavregning/aarsavregning";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import "./vurderingAarsavregning.css";

const TrygdeavgiftsperioderTabell = ({ perioder, avgift }: { perioder?: Trygdeavgiftsperiode[]; avgift?: Avgift }) => {
  if (!perioder) return null;

  return (
    <VStack>
      <Nav.Table size="small" className="periode_tabell">
        <Nav.Table.Header className="header_row">
          <Nav.Table.Row>
            <Nav.Table.HeaderCell scope="col">Trygdeavgift</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Inntektskilde</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">
              Betales arb.avg. <br /> til skatt?
            </Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">
              Brutto inntekt <br /> per md.
            </Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Sats</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Avgift per md.</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {perioder.map((trygdeavgiftsperiode) => (
            <Nav.Table.Row className="border_top" key={Utils._uuid()}>
              <Nav.Table.DataCell key={Utils._uuid()}>
                {`${Utils.dato.formatterDatoTilNorsk(trygdeavgiftsperiode.fom)} - ${Utils.dato.formatterDatoTilNorsk(
                  trygdeavgiftsperiode.tom
                )}`}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell key={Utils._uuid()}>
                {KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, trygdeavgiftsperiode.inntektskildetype)}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell key={Utils._uuid()}>
                {trygdeavgiftsperiode.arbeidsgiversavgiftBetales ? "Ja" : "Nei"}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {trygdeavgiftsperiode.inntektPerMd}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {trygdeavgiftsperiode.avgiftssats}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                <b>{trygdeavgiftsperiode.avgiftPerMd}</b> nkr
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
      <HStack className="totaltForPerioden" gap="16" align="center" justify="end">
        <p>Totalt for perioden:</p>
        <div>
          <b>{avgift?.totalInntektPerMd}</b> nkr
        </div>
        <div>
          <b>{avgift?.totalAvgiftPerMd}</b> nkr
        </div>
      </HStack>
    </VStack>
  );
};

export default TrygdeavgiftsperioderTabell;
