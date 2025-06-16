import PT from "prop-types";
import uuid from "uuid";

function UstrukturertAdresse({ adresse: { adresselinjer, landkode } }) {
  return (
    <address>
      {adresselinjer.map((adresse) => {
        if (!adresse) return null;
        return <div key={uuid()}>{adresse}</div>;
      })}
      {landkode}
    </address>
  );
}

UstrukturertAdresse.propTypes = {
  adresse: PT.shape({
    adresselinjer: PT.arrayOf(PT.string),
    landkode: PT.string,
  }).isRequired,
};

export default UstrukturertAdresse;
