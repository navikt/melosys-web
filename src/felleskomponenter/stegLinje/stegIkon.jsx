import PT from "prop-types";
import classnames from "classnames";

import { FANE_STATUS } from "../stegvelger/stegMotor";

import * as Ikoner from "../../resources/images";

import "./stegIkon.css";

const ikonVelger = (status, vedtakSteg) => {
  const IKONER = {
    STEG: {
      UBEHANDLET: Ikoner.Ubehandlet,
      OK: Ikoner.Ferdig,
      ADVARSEL: Ikoner.Varsel,
      FEIL: Ikoner.Feil,
    },
    VEDTAK: {
      UBEHANDLET: Ikoner.VedakUbehandlet,
      OK: Ikoner.VedtakGodkjent,
      ADVARSEL: Ikoner.VedtakAvslatt,
      FEIL: Ikoner.VedtakAvslatt,
    },
  };

  return vedtakSteg ? IKONER.VEDTAK.OK : IKONER.STEG[status];
};

const StegIkon = (props) => {
  const { aktivtSteg, status, tittel, onClick, tilgjengelig, vedtakSteg } = props;

  const erTilgjengelig = status !== FANE_STATUS.UBEHANDLET;
  const Ikon = ikonVelger(status, vedtakSteg);

  const cl = classnames(
    "stegIkon",
    !erTilgjengelig ? "stegIkon-utilgjengelig" : "",
    aktivtSteg && "stegIkon--aktiv",
    aktivtSteg && !erTilgjengelig && "stegIkon--aktiv--utilgjengelig"
  );

  const knappKlasser = classnames({
    stegIkon__enkeltSteg: !vedtakSteg,
    stegIkon__vedtak: vedtakSteg,
  });

  /* eslint-disable react/no-danger */
  return (
    <li className={cl}>
      <button onClick={onClick} className="stegIkon__knapp" type="button">
        <Ikon className={knappKlasser} aria-disabled={!tilgjengelig} />
        <div className="stegIkon__tittel" dangerouslySetInnerHTML={{ __html: tittel }} />
      </button>
    </li>
  );
  /* eslint-enable react/no-danger */
};

StegIkon.propTypes = {
  id: PT.string.isRequired,
  status: PT.string.isRequired,
  tittel: PT.string.isRequired,
  tilgjengelig: PT.bool,
  onClick: PT.func.isRequired,
  aktivtSteg: PT.bool,
  vedtakSteg: PT.bool,
};

StegIkon.defaultProps = {
  tilgjengelig: false,
  aktivtSteg: false,
  vedtakSteg: false,
};

export default StegIkon;
