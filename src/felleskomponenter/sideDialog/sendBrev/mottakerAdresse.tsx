import React from "react";
import { DokumenterV2 } from "../../../services/api";
import * as Utils from "../../../utils";

const MottakerAdresse = ({
  tittel,
  adresselinjer,
  postnr,
  poststed,
  region,
  land,
  className,
  visNavn = false,
}: DokumenterV2.MottakerAdresse & { className: string; visNavn?: boolean }) => (
  <div className={className}>
    {visNavn && (
      <div>
        <b>{tittel.mottakerNavn}</b>
      </div>
    )}

    {adresselinjer.map((linje) => (
      <span key={Utils._uuid()} className="mottaker__adresselinje">
        {`${linje}, `}
      </span>
    ))}
    <span className="mottaker__adresselinje">
      {postnr} {poststed}
      {region && `, ${region}`}, {land}
    </span>
  </div>
);

export default MottakerAdresse;
