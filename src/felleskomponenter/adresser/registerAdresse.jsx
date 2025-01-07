import * as MPT from "../../proptypes";

import * as KV from "../../kodeverk";

import "./registerAdresse.css";

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
function RegisterAdresse({ adresse }) {
  const INGEN_TILGJENGELIG_TEKST = <>(ingen tilgjengelig)</>;
  if (!adresse) {
    return INGEN_TILGJENGELIG_TEKST;
  }

  const { gateadresse, land, postnr, poststed } = adresse;

  const { gatenavn, husnummer, husbokstav } = gateadresse;

  const landNavn = typeof land === "string" ? land : KV.objektTilTermUtenFeilmelding(land);
  const visGate = gatenavn || husnummer || husbokstav;

  return gatenavn || husnummer || husbokstav || land || postnr || poststed ? (
    <address className="registeradresse">
      {visGate && (postnr || poststed) && landNavn ? (
        <div>
          {gatenavn} {husnummer}
          {husbokstav}, {postnr} {poststed}, {landNavn}
        </div>
      ) : (
        (
          visGate && (
            <div>
              {gatenavn} {husnummer} {husbokstav}
            </div>
          )
        )(
          (postnr || poststed) && (
            <div>
              {postnr} {poststed}
            </div>
          )
        )(landNavn && <div>{landNavn}</div>)
      )}
    </address>
  ) : (
    INGEN_TILGJENGELIG_TEKST
  );
}

RegisterAdresse.propTypes = {
  adresse: MPT.RegisterAdresse,
};

RegisterAdresse.defaultProps = {
  adresse: {},
};

export default RegisterAdresse;
