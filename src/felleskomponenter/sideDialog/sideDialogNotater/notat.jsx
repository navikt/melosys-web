import { useState, Fragment } from "react";
import PT from "prop-types";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as Ikoner from "../../../resources/images";

import "./notat.css";

const Notat = ({ redigerbart, tekst, opprettetDato, endretDato, forfatter, onUpdate, overskrift, maksTekstLengde }) => {
  const [endres, setEndres] = useState(false);
  const [endretTekst, setEndretTekst] = useState(tekst);
  const [lagringFeilmelding, setLagringFeilmelding] = useState("");

  const visLagreKnapp = endretTekst.length <= maksTekstLengde;

  const lagre = async () => {
    setLagringFeilmelding("");

    try {
      await onUpdate(endretTekst);
      setEndres(false);
    } catch (e) {
      if (e.status >= 500) {
        setLagringFeilmelding(
          "Det oppsto en teknisk feil. Ta kontakt med brukerstøtte dersom problemet oppstår gjentatte ganger."
        );
      } else if (e.status >= 400) {
        setLagringFeilmelding(e.body.message);
      }
    }
  };

  const apneEndring = () => {
    setEndres(true);
  };

  const avbrytEndring = () => {
    setEndres(false);
    setLagringFeilmelding("");
    setEndretTekst(tekst);
  };

  const endreTekst = (e) => {
    setEndretTekst(e.target.value);
  };

  const notatErEndret = !Utils.dato.erLike(opprettetDato, endretDato);

  return (
    <Nav.Row className="notat">
      <Nav.Column xs="4">
        {notatErEndret && (
          <Nav.Row className="endretDato">
            <Nav.Column xs="12">
              <Nav.Typo.Element>Endret: {Utils.dato.formatterDatoTilNorsk(endretDato)}</Nav.Typo.Element>
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row className="opprettetDato">
          <Nav.Column xs="12">
            <Nav.Typo.Element>Opprettet: {Utils.dato.formatterDatoTilNorsk(opprettetDato)}</Nav.Typo.Element>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="forfatter">
          <Nav.Column xs="12">{forfatter}</Nav.Column>
        </Nav.Row>
      </Nav.Column>
      <Nav.Column xs="8">
        <Nav.Row className="overskrift">
          <Nav.Column xs="12">
            <Nav.Typo.Element>{overskrift}</Nav.Typo.Element>
          </Nav.Column>
        </Nav.Row>
        {endres && (
          <Fragment>
            <Nav.Row>
              <Nav.Textarea label="" value={endretTekst} onChange={endreTekst} maxLength={maksTekstLengde} />
            </Nav.Row>
            <Nav.Row>
              <div role="alert">
                {lagringFeilmelding && <Nav.Typo.Feilmelding>{lagringFeilmelding}</Nav.Typo.Feilmelding>}
              </div>
            </Nav.Row>
            <div className="knapperad">
              {visLagreKnapp && (
                <Nav.Button variant="primary" onClick={lagre}>
                  <span>Lagre</span>
                </Nav.Button>
              )}
              <Nav.Button variant="secondary" onClick={avbrytEndring}>
                <span>Avbryt</span>
              </Nav.Button>
            </div>
          </Fragment>
        )}
        {!endres && (
          <Fragment>
            <Nav.Row className="uredigerbarTekst">
              <Nav.Column xs="12">
                <Nav.Tekstomrade>{tekst}</Nav.Tekstomrade>
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              {redigerbart && (
                <div className="knapperad">
                  <Nav.Button variant="secondary" icon={<Ikoner.Pencil />} onClick={apneEndring}>
                    Endre
                  </Nav.Button>
                </div>
              )}
            </Nav.Row>
          </Fragment>
        )}
      </Nav.Column>
    </Nav.Row>
  );
};

Notat.propTypes = {
  redigerbart: PT.bool.isRequired,
  tekst: PT.string.isRequired,
  opprettetDato: PT.string.isRequired,
  endretDato: PT.string.isRequired,
  forfatter: PT.string.isRequired,
  onUpdate: PT.func.isRequired,
  overskrift: PT.string.isRequired,
  maksTekstLengde: PT.number.isRequired,
};

export default Notat;
