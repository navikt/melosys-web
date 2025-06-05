import PT from "prop-types";
import classnames from "classnames";

import { FANE_STATUS } from "../stegvelger";

import * as Ikoner from "../../resources/images";

import "./stegIkon.css";

const ikonVelger = (status, vedtakSteg, aktivtSteg) => {
  if (vedtakSteg) {
    return aktivtSteg ? Ikoner.VedtakGodkjentAktiv : Ikoner.VedtakGodkjentIkkeAktiv;
  }

  if (aktivtSteg) {
    return status === FANE_STATUS.UBEHANDLET ? Ikoner.UbehandletAktiv : Ikoner.FerdigAktiv;
  }

  return status === FANE_STATUS.UBEHANDLET ? Ikoner.Ubehandlet : Ikoner.Ferdig;
};

function StegIkon(props) {
  const { aktivtSteg = false, status, tittel, onClick, tilgjengelig = false, vedtakSteg = false } = props;

  const Ikon = ikonVelger(status, vedtakSteg, aktivtSteg);

  const knappKlasser = classnames({
    stegIkon__enkeltSteg: !vedtakSteg,
    stegIkon__vedtak: vedtakSteg,
  });
  /* eslint-disable react/no-danger */
  return (
    <li className="stegIkon">
      <button onClick={onClick} className="stegIkon__knapp" type="button" aria-label="stegikon">
        <Ikon className={knappKlasser} aria-disabled={!tilgjengelig} />
        <div className="stegIkon__tittel" dangerouslySetInnerHTML={{ __html: tittel }} />
      </button>
    </li>
  );
  /* eslint-enable react/no-danger */
}

StegIkon.propTypes = {
  id: PT.string.isRequired,
  status: PT.string.isRequired,
  tittel: PT.string.isRequired,
  tilgjengelig: PT.bool,
  onClick: PT.func.isRequired,
  aktivtSteg: PT.bool,
  vedtakSteg: PT.bool,
};

export default StegIkon;
