import React from "react";
import MKV from "../../../../../../melosyskodeverk";
import * as KV from "../../../../../../kodeverk";
import * as Utils from "../../../../../../utils";
import { Trygdeavgiftsperiode } from "../../../../../../services/modules/trygdeavgift";

const TrygdeavgiftsperioderTabell = ({ perioder }: { perioder: Trygdeavgiftsperiode[] }) => {
  if (!perioder) return null;
  return (
    <div className="periode_tabell-wrapper">
      <table className="periode_tabell">
        <tbody>
          <tr>
            <th key="periode" style={{ width: "25%" }} scope="col">
              Periode
            </th>
            <th key="dekning" style={{ width: "45%" }} scope="col">
              Dekning
            </th>
            <th key="sats" style={{ width: "10%" }} scope="col">
              Sats
            </th>
            <th key="avgift" style={{ width: "20%" }} scope="col">
              Avgift per måned
            </th>
          </tr>
          {perioder.map((trygdeavgiftsperiode) => (
            <tr className="border_top" key={Utils._uuid()}>
              <td key={Utils._uuid()}>
                {`${Utils.dato.formatterDatoTilNorsk(trygdeavgiftsperiode.fom)} - ${Utils.dato.formatterDatoTilNorsk(
                  trygdeavgiftsperiode.tom
                )}`}
              </td>
              <td key={Utils._uuid()}>
                {KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, trygdeavgiftsperiode.trygdedekning)}
              </td>
              <td key={Utils._uuid()}>{trygdeavgiftsperiode.avgiftssats}</td>
              <td key={Utils._uuid()}>
                <b>{trygdeavgiftsperiode.avgiftPerMd}</b> kroner
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrygdeavgiftsperioderTabell;
