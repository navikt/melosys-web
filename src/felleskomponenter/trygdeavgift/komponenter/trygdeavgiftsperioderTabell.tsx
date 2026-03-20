import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import { Trygdeavgiftsperiode } from "../../../services/modules/trygdeavgift";
import { Spinner } from "../../spinner";

import "./trygdeavgiftsperioderTabell.less";

function formaterSats(periode: Trygdeavgiftsperiode): string {
  switch (periode.beregningstype) {
    case "TJUEFEM_PROSENT_REGEL":
      return "**";
    case "MINSTEBELOEP":
      return "*";
    default:
      return periode.avgiftssats?.toString() ?? "";
  }
}

function TrygdeavgiftsperioderTabell({
  perioder,
  lagrePending,
  erEøsPensjonist = false,
}: {
  perioder?: Trygdeavgiftsperiode[];
  lagrePending: boolean;
  erEøsPensjonist?: boolean;
}) {
  if (!perioder) return null;

  const sortertePerioder = [...perioder].sort(Utils.dato.sorterEtterISOFomDato);

  const harMinstebeloep = sortertePerioder.some((p) => p.beregningstype === "MINSTEBELOEP");
  const har25ProsentRegel = sortertePerioder.some((p) => p.beregningstype === "TJUEFEM_PROSENT_REGEL");

  return (
    <div className="tabell-container">
      {lagrePending && (
        <div className="loader-container">
          <Spinner />
        </div>
      )}
      <Nav.Table size="small" className="periode_tabell">
        <Nav.Table.Header className="header_row">
          <Nav.Table.Row>
            <Nav.Table.HeaderCell scope="col">Trygdeperiode</Nav.Table.HeaderCell>
            {!erEøsPensjonist && <Nav.Table.HeaderCell scope="col">Dekning</Nav.Table.HeaderCell>}
            <Nav.Table.HeaderCell scope="col">Inntektskilde</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Sats</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Avgift per md.</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {sortertePerioder.map((trygdeavgiftsperiode) => (
            <Nav.Table.Row className="border_top" key={Utils._uuid()}>
              <Nav.Table.DataCell key={Utils._uuid()}>
                {`${Utils.dato.formatterDatoTilNorsk(trygdeavgiftsperiode.fom)} - ${Utils.dato.formatterDatoTilNorsk(
                  trygdeavgiftsperiode.tom,
                )}`}
              </Nav.Table.DataCell>
              {!erEøsPensjonist && (
                <Nav.Table.DataCell key={Utils._uuid()}>
                  {KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, trygdeavgiftsperiode.trygdedekning)}
                </Nav.Table.DataCell>
              )}
              <Nav.Table.DataCell key={Utils._uuid()}>
                {KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, trygdeavgiftsperiode.inntektskildetype)}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell key={Utils._uuid()} className="tall_felt">
                {formaterSats(trygdeavgiftsperiode)}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell key={Utils._uuid()} className="tall_felt">
                <b>{trygdeavgiftsperiode.avgiftPerMd}</b> nkr
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
      {(harMinstebeloep || har25ProsentRegel) && (
        <div className="forklaringstekster">
          {harMinstebeloep && <p>* Inntekten er lavere enn minstebeløpet for trygdeavgift.</p>}
          {har25ProsentRegel && (
            <p>** Trygdeavgiften kan maks utgjøre 25 % av inntekten som overstiger minstebeløpet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TrygdeavgiftsperioderTabell;
