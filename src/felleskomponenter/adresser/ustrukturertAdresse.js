import React from "react";
import PT from "prop-types";
import uuid from "uuid";
import classNames from "classnames";

const UstrukturertAdresse = ({ adresse: { adresselinjer, landkode }, className = "" }) => {
  const cl = classNames(className);
  return (
    <address className={cl}>
      {adresselinjer.map((adresse) => {
        if (!adresse) return null;
        return <div key={uuid()}>{adresse}</div>;
      })}
      {landkode}
    </address>
  );
};

UstrukturertAdresse.propTypes = {
  adresse: PT.shape({
    adresselinjer: PT.arrayOf(PT.string),
    landkode: PT.string,
  }).isRequired,
  className: PT.string,
};

UstrukturertAdresse.defaultProps = {
  className: "",
};

export default UstrukturertAdresse;
