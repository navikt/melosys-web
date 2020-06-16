import React, { useState } from 'react';
import PT from 'prop-types';
import Ikon from 'melosys-ikoner-assets';
import classNames from 'classnames';

import * as Mui from '../../../felleskomponenter/ui';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import LandVelger from '../../skjema/landvelger';

import './oppgittAdresseSoknad.css';

const OppgittAdresseSoknad = ({
  redigerbart,
  tittel,
  className,
  oppgittAdresseHarVerdier,
}) => {
  const [visAnnenAdresseFelterKnappKlikket, setVisAnnenAdresseFelterKnappKlikket] = useState(false);

  const visAnnenAdresseFelter = visAnnenAdresseFelterKnappKlikket || oppgittAdresseHarVerdier;

  const innhold = visAnnenAdresseFelter ?
    <dl className="person__detaljer">
      <Nav.Row>
        <Nav.Column xs="8">
          <Skjema.Input feltNavn="oppgittAdresseGatenavn" label="Gatenavn:" disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="4">
          <Skjema.Input feltNavn="oppgittAdresseHusnummer" label="Husnummer:" disabled={!redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Skjema.Input feltNavn="oppgittAdresseRegion" label="Region:" disabled={!redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="4">
          <Skjema.Input feltNavn="oppgittAdressePostnummer" label="Postnr:" disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="8">
          <Skjema.Input feltNavn="oppgittAdressePoststed" label="Poststed:" disabled={!redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <LandVelger disabled={!redigerbart} bredde="fullbredde" feltNavn="oppgittAdresseLand" label="Land:" />
        </Nav.Column>
      </Nav.Row>
    </dl>
    :
    <Mui.Knapp className="knappMedIkon" disabled={!redigerbart} onClick={() => setVisAnnenAdresseFelterKnappKlikket(true)}><Ikon kind="tilsette" />LEGG TIL ADRESSE</Mui.Knapp>;

  const cls = classNames('oppgittAdresseSoknad', className);

  return (
    <Nav.Row className={cls}>
      <Nav.Column xs="6">
        <Nav.Fieldset legend={tittel}>
          { innhold }
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  );
};

OppgittAdresseSoknad.propTypes = {
  redigerbart: PT.bool.isRequired,
  tittel: PT.string.isRequired,
  className: PT.string,
  oppgittAdresseHarVerdier: PT.bool.isRequired,
};

OppgittAdresseSoknad.defaultProps = {
  className: undefined,
};

export default OppgittAdresseSoknad;
