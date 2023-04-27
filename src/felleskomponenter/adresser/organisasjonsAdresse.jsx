import React from "react";
import PT from "prop-types";
import classNames from "classnames";

import * as MPT from "../../proptypes";
import * as Utils from "../../utils";

import RegisterAdresse from "./registerAdresse";

import "./organisasjonsAdresse.css";

const OrganisasjonsAdresse = ({ organisasjon, className, visNavn, visTittel, boldNavn }) => {
  const { postadresse, forretningsadresse, navn } = organisasjon;

  if (!postadresse && !forretningsadresse) return <div>(Ingen adresse tilgjengelig)</div>;

  const visPostadresse = !Utils.adresse.erRegisterAdresseObjektTomt(postadresse);
  const adresse = visPostadresse ? postadresse : forretningsadresse;
  const tittel = visPostadresse ? "Postadresse" : "Forretningsadresse";

  const cl = classNames("organisasjonsAdresse", className);
  const navnCls = classNames({
    bold: boldNavn,
    "break-word": true,
  });

  return (
    <div className={cl}>
      {visNavn && <div className={navnCls}>{navn}</div>}
      {visTittel && <div className="tittel">{tittel}</div>}
      <RegisterAdresse adresse={adresse} />
    </div>
  );
};

OrganisasjonsAdresse.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  className: PT.string,
  visNavn: PT.bool,
  visTittel: PT.bool,
  boldNavn: PT.bool,
};

OrganisasjonsAdresse.defaultProps = {
  className: "",
  visNavn: true,
  visTittel: true,
  boldNavn: false,
};

export default OrganisasjonsAdresse;
