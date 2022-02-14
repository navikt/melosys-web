import React from "react";
import { DokumenterV2 } from "../../../services/api";
import * as Utils from "../../../utils";

const MottakerAdresse = ({
  tittel,
  adresselinjer,
  postnr,
  poststed,
  land,
  className,
}: DokumenterV2.MottakerAdresse & { className: string }) => {
  return (
    <div className={className}>
      {!tittel?.orgnr && (
        <div>
          <b>{tittel.mottakerNavn}</b>
        </div>
      )}

      {adresselinjer.map((linje) => (
        <span key={Utils._uuid()} className="mottaker__adresselinje">
          {linje},{" "}
        </span>
      ))}
      <span className="mottaker__adresselinje">
        {postnr} {poststed}, {land}
      </span>
    </div>
  );
};

export default MottakerAdresse;
