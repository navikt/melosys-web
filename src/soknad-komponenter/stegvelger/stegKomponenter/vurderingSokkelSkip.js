import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes';

import LandVelger from '../../skjema/landvelger';

import './vurderingSokkelSkip.css';
import { SokkelEllerSkipSelector } from '../../../ducks/form/selectors';
import { lagRessurs } from '../../../regler/vilkar';

const SokkelSkipEnkelt = props => {
  const {
    sokkelSkipInfo,
    begrunnelser,
    index,
    redigerbart,
    installasjonsType,
  } = props;

  const { navn } = sokkelSkipInfo;

  const { SOKKEL, SKIP } = KV.Koder;

  return (
    <Nav.Row className="sokkelSkip__liste__rad">
      <Nav.Column xs="4" className="rad__navn">{navn}</Nav.Column>
      <Nav.Column xs="2" className="rad__sokkel">
        <Skjema.Radio disabled={!redigerbart} feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsType`} value={SOKKEL} label="Sokkel" />
        <Skjema.Radio disabled={!redigerbart} feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsType`} value={SKIP} label="Skip" />
      </Nav.Column>
      {
        installasjonsType === SOKKEL &&
        <Nav.Column xs="3" className="rad__begrunnelse">
          <Skjema.Select disabled={!redigerbart} feltNavn={`avklartefakta.sokkelEllerSkip[${index}].installasjonsTypeBegrunnelse`} label="Begrunnelse hvis sokkel">
            {begrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
          </Skjema.Select>
        </Nav.Column>
      }
      <Nav.Column xs="3" className="rad__land">
        <LandVelger disabled={!redigerbart} feltNavn={`avklartefakta.sokkelEllerSkip[${index}].arbeidsland`} multiLand={false} label="Arbeidsland" />
      </Nav.Column>
    </Nav.Row>
  );
};

SokkelSkipEnkelt.propTypes = {
  index: PT.number.isRequired,
  sokkelSkipInfo: PT.object.isRequired,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  installasjonsType: PT.string,
};

SokkelSkipEnkelt.defaultProps = {
  installasjonsType: '',
};

const mapStateToProps = (state, ownProps) => ({
  installasjonsType: SokkelEllerSkipSelector(state)[ownProps.index].installasjonsType,
});

const SokkelSkipEnkeltConnected = connect(mapStateToProps)(SokkelSkipEnkelt);

const SokkelSkipListe = props => {
  const { alleSokkelSkip, begrunnelser, redigerbart } = props;

  return (
    <div className="sokkelSkip__liste">
      { alleSokkelSkip.map((enkelt, index) => (
        <SokkelSkipEnkeltConnected
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

class VurderingSokkelSkip extends React.Component {
  componentWillUnmount() {
    const { slettAllStegdata } = this.props;
    slettAllStegdata();
  }

  radioEndringHandler = event => {
    const { value } = event.target;
    const { oppdaterRessurs, slettRessurs } = this.props;
    if (value === KV.Koder.VurderingSokkelSkipTyper.SOKKEL_NORSK) {
      oppdaterRessurs(lagRessurs('art11_3A', true));
    } else {
      slettRessurs('art11_3A');
    }
  };

  render() {
    // Merknad fra møte 12.12.18: Vi må huske å gå innom “vurdering antall land”
    // dersom man har valgt “to sokler / skip i flere land” siden vi går inn i artikkel 13.
    const {
      bekreftOgFortsett, tilstand, skjema, begrunnelser, redigerbart,
    } = this.props;
    const { radioEndringHandler } = this;
    const { VurderingSokkelSkipTyper } = KV.Koder;
    const { maritimtArbeid } = skjema;
    const { harAvklaring } = tilstand;
    /* eslint-disable max-len */
    return (
      <div className="vurderingSokkelSkip">
        <Nav.Undertittel>Vurdering av sokkel eller skip</Nav.Undertittel>
        <SokkelSkipListe alleSokkelSkip={maritimtArbeid} begrunnelser={begrunnelser} redigerbart={redigerbart} />
        {maritimtArbeid.length === 0 && (
          <div className="sokkelSkip__varsel"><Nav.AlertStripe type="advarsel">Det er ikke registrert verken sokkel eller skip.</Nav.AlertStripe></div>
        )
        }
        <Nav.Fieldset legend="Hvordan arbeider søkeren:" onChange={radioEndringHandler}>
          <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SOKKEL_NORSK} label="På norsk sokkel eller innenfor norsk territorialfarvann (art. 11.3.a)" />
          <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SKIP_ETT_LAND} label="På skip registrert i ett land" />
          <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SOKKEL_UTLAND} label="Utsendt til sokkel eller til annet lands territorialfarvann (art. 12)" />
          <Skjema.Radio disabled feltNavn="avklartefakta.sokkelSkipKonklusjon" value={VurderingSokkelSkipTyper.SOKKEL_ELLER_SKIP_FLERE_LAND} label="To sokler / skip i flere land (art. 13)" />
        </Nav.Fieldset>
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
    /* eslint-enable max-len */
  }
}

VurderingSokkelSkip.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  skjema: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterRessurs: PT.func.isRequired,
  slettRessurs: PT.func.isRequired,
  slettAllStegdata: PT.func.isRequired,
};

VurderingSokkelSkip.defaultProps = {
  tilstand: {},
};


export default VurderingSokkelSkip;
