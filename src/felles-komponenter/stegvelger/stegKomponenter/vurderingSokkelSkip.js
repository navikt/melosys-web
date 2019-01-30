import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import { SOKKEL, SKIP, VurderingSokkelSkipTyper } from '../../../kodeverk/koder';
import * as MPT from '../../../proptypes';

import LandVelger from '../../skjema/landvelger';

import './vurderingSokkelSkip.css';

const SokkelSkipEnkelt = props => {
  const {
    sokkelSkipInfo, begrunnelser, index, redigerbart,
  } = props;
  const { navn } = sokkelSkipInfo;

  return (
    <Nav.Row className="sokkelSkip__liste__rad">
      <Nav.Column xs="4" className="rad__navn">{navn}</Nav.Column>
      <Nav.Column xs="2" className="rad__sokkel">
        <Skjema.Radio disabled={!redigerbart} feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsType`} value={SOKKEL} label="Sokkel" />
        <Skjema.Radio disabled={!redigerbart} feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsType`} value={SKIP} label="Skip" />
      </Nav.Column>
      <Nav.Column xs="3" className="rad__begrunnelse">
        <Skjema.Select disabled={!redigerbart} feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsTypeBegrunnelse`} label="Begrunnelse">
          {begrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
        </Skjema.Select>
      </Nav.Column>
      <Nav.Column xs="3" className="rad__land">
        <LandVelger disabled={!redigerbart} feltNavn={`avklartefakta.sokkelEllerSkip[${index}].arbeidsland`} multiLand={false} label="Arbeids- / flaggland" />
      </Nav.Column>
    </Nav.Row>
  );
};

SokkelSkipEnkelt.propTypes = {
  index: PT.number.isRequired,
  sokkelSkipInfo: PT.object.isRequired,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

const SokkelSkipListe = props => {
  const { alleSokkelSkip, begrunnelser, redigerbart } = props;

  return (
    <div className="sokkelSkip__liste">
      { alleSokkelSkip.map((enkelt, index) => (
        <SokkelSkipEnkelt
          key={JSON.stringify(enkelt)}
          sokkelSkipInfo={enkelt}
          index={index}
          begrunnelser={begrunnelser}
          redigerbart={redigerbart}
        />))
      }
    </div>
  );
};

SokkelSkipListe.propTypes = {
  alleSokkelSkip: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

SokkelSkipListe.defaultProps = {
  alleSokkelSkip: [],
};

const VurderingSokkelSkip = props => {
  // Merknad fra møte 12.12.18: Vi må huske å gå innom “vurdering antall land”
  // dersom man har valgt “to sokler / skip i flere land” siden vi går inn i artikkel 13.

  const {
    bekreftOgFortsett, tilstand, skjema, begrunnelser, redigerbart,
  } = props;
  const { maritimtArbeid } = skjema;
  const { harAvklaring } = tilstand;

  return (
    <div className="vurderingSokkelSkip">
      <Nav.Undertittel>Vurdering av sokkel eller skip</Nav.Undertittel>
      <SokkelSkipListe alleSokkelSkip={maritimtArbeid} begrunnelser={begrunnelser} redigerbart={redigerbart} />
      {maritimtArbeid.length === 0 && (
        <div className="sokkelSkip__varsel"><Nav.AlertStripe type="advarsel">Det er ikke registrert verken sokkel eller skip.</Nav.AlertStripe></div>
      )
      }
      <Nav.Fieldset legend="Hvordan arbeider søkeren:">
        <Skjema.Radio disabled feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SOKKEL_NORSK} label="På norsk sokkel" />
        <Skjema.Radio disabled feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SKIP_NORSK_TERRITORIAL} label="Skip / installasjon innenfor norsk territorialfarvann" />
        <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SKIP_ETT_LAND} label="På skip registrert i ett land" />
        <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SOKKEL_UTLAND} label="Utsendt til sokkel i ett annet land" />
        <Skjema.Radio disabled feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SOKKEL_ELLER_SKIP_FLERE_LAND} label="To sokler / skip i flere land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingSokkelSkip.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  skjema: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingSokkelSkip.defaultProps = {
  tilstand: {},
};


export default VurderingSokkelSkip;
