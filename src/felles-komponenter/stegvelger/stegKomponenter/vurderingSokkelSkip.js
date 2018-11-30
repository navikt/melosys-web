import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import LandVelger from '../../skjema/landvelger';
import Listevelger from '../../skjema/listevelger';

import * as Koder from '../../../koder';
import * as MPT from '../../../proptypes';

import './vurderingSokkelSkip.css';

export const VurderingSokkelSkipTyper = {
  SKIP_INNENRIKS: 'SKIP_INNENRIKS',
  SKIP_ETT_LAND: 'SKIP_ETT_LAND',
  SOKKEL_NORSK: 'SOKKEL_NORSK',
  SOKKEL_UTLAND: 'SOKKEL_UTLAND',
  SOKKEL_ELLER_SKIP_FLERE_LAND: 'SOKKEL_ELLER_SKIP_FLERE_LAND',
};

const SokkelSkipEnkelt = props => {
  const { sokkelSkipInfo, begrunnelser, index } = props;
  const { navn } = sokkelSkipInfo;

  return (
    <Nav.Row className="sokkelSkip__liste__rad">
      <Nav.Column xs="3" className="rad__navn">{navn}</Nav.Column>
      <Nav.Column xs="3" className="rad__sokkel">
        <Skjema.Radio feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsType`} value={Koder.SOKKEL} label="Sokkel" />
        <Skjema.Radio feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsType`} value={Koder.SKIP} label="Skip" />
      </Nav.Column>
      <Nav.Column xs="3" className="rad__begrunnelse">
        <Skjema.Select feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsTypeBegrunnelse`} label="Begrunnelse">
          {begrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
        </Skjema.Select>
      </Nav.Column>
      <Nav.Column xs="3" className="rad__land"><LandVelger feltNavn={`avklartefakta.sokkelEllerSkip[${index}].arbeidsland`} multiLand={false} label="Arbeidsland" /></Nav.Column>
    </Nav.Row>
  );
};

SokkelSkipEnkelt.propTypes = {
  index: PT.number.isRequired,
  sokkelSkipInfo: PT.object.isRequired,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const SokkelSkipListe = props => {
  const { alleSokkelSkip } = props;
  const begrunnelser = [
    { kode: 'SOMETHING', term: 'Another thing' },
  ];

  return (
    <div className="sokkelSkip__liste">
      { alleSokkelSkip.map((enkelt, index) => <SokkelSkipEnkelt key={index} sokkelSkipInfo={enkelt} index={index} begrunnelser={begrunnelser} />)}
    </div>
  );
};

SokkelSkipListe.propTypes = {
  alleSokkelSkip: PT.array,
};

SokkelSkipListe.defaultProps = {
  alleSokkelSkip: [],
};

const VurderingSokkelSkip = props => {
  const { bekreftOgFortsett, tilstand, skjema } = props;
  const { maritimtArbeid } = skjema;
  const { harAvklaring } = tilstand;

  return (
    <div className="vurderingSokkelSkip">
      <Nav.Undertittel>Vurdering av sokkel eller skip</Nav.Undertittel>
      <SokkelSkipListe alleSokkelSkip={maritimtArbeid} />
      <Nav.Fieldset legend="Hvordan arbeider søkeren:">
        <Skjema.Radio feltNavn="avklartfakta.arbeidSokkelSkip" value={VurderingSokkelSkipTyper.SKIP_INNENRIKS} label="På norsk sokkel" />
        <Skjema.Radio feltNavn="avklartfakta.arbeidSokkelSkip" value={VurderingSokkelSkipTyper.SKIP_ETT_LAND} label="På skip i innenrikstrafikk" />
        <Skjema.Radio feltNavn="avklartfakta.arbeidSokkelSkip" value={VurderingSokkelSkipTyper.SOKKEL_NORSK} label="På skip registrert i ett land" />
        <Skjema.Radio feltNavn="avklartfakta.arbeidSokkelSkip" value={VurderingSokkelSkipTyper.SOKKEL_UTLAND} label="Utsendt til et annet lands sokkel" />
        <Skjema.Radio feltNavn="avklartfakta.arbeidSokkelSkip" value={VurderingSokkelSkipTyper.SOKKEL_ELLER_SKIP_FLERE_LAND} label="To sokler / skip i flere land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!harAvklaring} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingSokkelSkip.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  skjema: PT.object.isRequired,
};

VurderingSokkelSkip.defaultProps = {
  tilstand: {},
};


export default VurderingSokkelSkip;
