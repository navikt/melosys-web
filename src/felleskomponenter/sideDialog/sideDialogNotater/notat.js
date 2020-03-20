import React, { useState, Fragment } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Utils from '../../../utils';
import * as Ikoner from '../../../resources/images';

import './notat.css';

const Notat = ({
  redigerbart,
  tekst,
  opprettetDato,
  endretDato,
  forfatter,
  onUpdate,
  overskrift,
  maksTekstLengde,
}) => {
  const [endres, setEndres] = useState(false);
  const [endretTekst, setEndretTekst] = useState(tekst);

  const visLagreKnapp = endretTekst.length <= maksTekstLengde;

  const lagre = () => {
    onUpdate(endretTekst);
    setEndres(false);
  };

  const apneEndring = () => {
    setEndres(true);
  };

  const avbrytEndring = () => {
    setEndres(false);
    setEndretTekst(tekst);
  };

  const endreTekst = e => {
    setEndretTekst(e.target.value);
  };

  const notatErEndret = !Utils.dato.erLike(opprettetDato, endretDato);

  return (
    <Nav.Row className="notat">
      <Nav.Column xs="4">
        {
          notatErEndret &&
          <Nav.Row className="endretDato">
            <Nav.Column xs="12">
              <Nav.typo.Element>Endret: { Utils.dato.formatterDatoTilNorsk(endretDato) }</Nav.typo.Element>
            </Nav.Column>
          </Nav.Row>
        }
        <Nav.Row className="opprettetDato">
          <Nav.Column xs="12">
            <Nav.typo.Element>Opprettet: { Utils.dato.formatterDatoTilNorsk(opprettetDato) }</Nav.typo.Element>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="forfatter">
          <Nav.Column xs="12">
            {forfatter}
          </Nav.Column>
        </Nav.Row>
      </Nav.Column>
      <Nav.Column xs="8">
        <Nav.Row className="overskrift">
          <Nav.Column xs="12">
            <Nav.typo.Element>{overskrift}</Nav.typo.Element>
          </Nav.Column>
        </Nav.Row>
        {
          endres &&
          <Fragment>
            <Nav.Row>
              <Nav.Textarea
                label=""
                value={endretTekst}
                onChange={endreTekst}
                maxLength={maksTekstLengde}
              />
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="8" />
              <Nav.Column xs="2">
                {
                  visLagreKnapp &&
                  <Nav.Lenker onClick={lagre}><span>Lagre</span></Nav.Lenker>
                }
              </Nav.Column>
              <Nav.Column xs="2">
                <Nav.Lenker onClick={avbrytEndring}><span>Avbryt</span></Nav.Lenker>
              </Nav.Column>
            </Nav.Row>
          </Fragment>
        }
        {
          !endres &&
          <Fragment>
            <Nav.Row className="uredigerbarTekst">
              <Nav.Column xs="12">
                <Nav.Tekstomrade>
                  { tekst }
                </Nav.Tekstomrade>
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              {
                redigerbart &&
                <Fragment>
                  <Nav.Column xs="9" />
                  <Nav.Column xs="3">
                    <Nav.Lenker onClick={apneEndring}><img src={Ikoner.Pencil} alt="Edit" /><span>&nbsp;Endre</span></Nav.Lenker>
                  </Nav.Column>
                </Fragment>
              }
            </Nav.Row>
          </Fragment>
        }
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
