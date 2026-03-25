import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import { Trygdeavgiftsperiode } from "../../../services/modules/trygdeavgift";
import { Spinner } from "../../spinner";
import { formaterSats, formaterInntektskilde, Beregningsforklaringer } from "./beregningsforklaring";

import "./trygdeavgiftsperioderTabell.less";

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
                {formaterInntektskilde(trygdeavgiftsperiode, (kode) =>
                  KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, kode),
                )}
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
      <Beregningsforklaringer perioder={sortertePerioder} />
    </div>
  );
}

export default TrygdeavgiftsperioderTabell;
