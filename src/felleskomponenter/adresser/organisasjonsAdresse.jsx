import PT from "prop-types";
import classNames from "classnames";

import * as MPT from "../../proptypes";
import * as Utils from "../../utils";

import RegisterAdresse from "./registerAdresse";

import "./organisasjonsAdresse.less";
import * as Nav from "../../navFrontend";

function OrganisasjonsAdresse({ organisasjon, className = "", visNavn = true, visTittel = true, boldNavn = false }) {
  const { postadresse, forretningsadresse, navn } = organisasjon;

  if (!postadresse && !forretningsadresse) return <div>(Ingen adresse tilgjengelig)</div>;

  const visPostadresse = !Utils.adresse.erRegisterAdresseObjektTomt(postadresse);
  const adresse = visPostadresse ? postadresse : forretningsadresse;
  const tittel = visPostadresse ? "Postadresse" : "Forretningsadresse";

  const cl = classNames("organisasjonsAdresse", className);

  return (
    <div className={cl}>
      {visNavn && (
        <Nav.BodyLong weight="semibold" size="medium">
          {navn}
        </Nav.BodyLong>
      )}
      {visTittel && <div className="tittel">{tittel}</div>}
      <RegisterAdresse adresse={adresse} />
    </div>
  );
}

OrganisasjonsAdresse.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  className: PT.string,
  visNavn: PT.bool,
  visTittel: PT.bool,
  boldNavn: PT.bool,
};

export default OrganisasjonsAdresse;
