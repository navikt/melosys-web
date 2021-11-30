import * as Api from "../../../services/api";
import React from "react";
import * as Utils from "../../../utils";

const MottakerAdresseComponent = ({
  tittel,
  adresselinjer,
  postnr,
  poststed,
  land,
  className,
}: Api.DokumenterV2.MottakerAdresse & { className: string }) => {
  return (
    <div className={className}>
      {!tittel?.orgnr && (
        <div>
          <b>{tittel.mottakerNavn}</b>
        </div>
      )}

      {adresselinjer.map((linje) => (
        <span key={Utils._uuid()}>{linje}, </span>
      ))}
      <span>
        {postnr} {poststed}, {land}
      </span>
    </div>
  );
};

export default MottakerAdresseComponent;
