import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes';

import LandVelger from '../../skjema/landvelger';

import './vurderingSokkelSkip.css';
import { lagVilkaar } from '../../../regler/vilkar';
import {
  hentFoersteFaktaVerdi,
  konverterTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
} from '../../../regler/avklartefakta';

const SokkelSkipEnkelt = props => {
  const {
    maritimtArbeid,
    avklartefakta,
    begrunnelser,
    index,
    redigerbart,
    radioEndretHandler,
    selectEndretHandler,
  } = props;

  const { navn } = maritimtArbeid;
  const { begrunnelseKoder } = avklartefakta;
  const installasjonsType = hentFoersteFaktaVerdi(avklartefakta);

  const { SOKKEL, SKIP } = KV.Koder;

  return (
    <Nav.Row className="sokkelSkip__liste__rad">
      <Nav.Column xs="4" className="rad__navn">{navn}</Nav.Column>
      <Nav.Column xs="2" className="rad__sokkel">
        <Nav.Radio
          name={KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP}
          disabled={!redigerbart}
          onChange={e => radioEndretHandler(e, navn)}
          value={SOKKEL}
          checked={installasjonsType === SOKKEL}
          label="Sokkel" />
        <Nav.Radio
          name={KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP}
          disabled={!redigerbart}
          onChange={e => radioEndretHandler(e, navn)}
          checked={installasjonsType === SKIP}
          value={SKIP}
          label="Skip" />
      </Nav.Column>
      {
        installasjonsType === SOKKEL &&
        <Nav.Column xs="3" className="rad__begrunnelse">
          <Nav.Select
            name={KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP}
            disabled={!redigerbart}
            label="Begrunnelse hvis sokkel"
            id="installasjonsTypeBegrunnelser"
            onChange={e => selectEndretHandler(e, navn)}
            value={begrunnelseKoder[0]} >
            <option key={null} value={null} />
            {begrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
          </Nav.Select>
        </Nav.Column>
      }
      <Nav.Column xs="3" className="rad__land">
        <LandVelger
          feltNavn={`avklartefakta.sokkelEllerSkip[${index}].arbeidsland`}
          disabled={!redigerbart}
          onChange={e => radioEndretHandler({ target: { name: KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, value: e } }, navn)}
          multiLand={false}
          label="Arbeidsland" />
      </Nav.Column>
    </Nav.Row>
  );
};

SokkelSkipEnkelt.propTypes = {
  index: PT.number.isRequired,
  maritimtArbeid: PT.object.isRequired,
  avklartefakta: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  radioEndretHandler: PT.func.isRequired,
  selectEndretHandler: PT.func.isRequired,
};

SokkelSkipEnkelt.defaultProps = {
  avklartefakta: {},
};

const SokkelSkipListe = props => {
  const {
    avklartefakta, maritimtArbeid, begrunnelser, redigerbart, radioEndretHandler, selectEndretHandler,
  } = props;

  return (
    <div className="sokkelSkip__liste">
      { maritimtArbeid.map((enkelt, index) => (
        <SokkelSkipEnkelt
          key={JSON.stringify(enkelt)}
          maritimtArbeid={enkelt}
          avklartefakta={avklartefakta[index]}
          index={index}
          begrunnelser={begrunnelser}
          redigerbart={redigerbart}
          radioEndretHandler={radioEndretHandler}
          selectEndretHandler={selectEndretHandler}
        />))
      }
    </div>
  );
};

SokkelSkipListe.propTypes = {
  avklartefakta: PT.array,
  maritimtArbeid: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  radioEndretHandler: PT.func.isRequired,
  selectEndretHandler: PT.func.isRequired,
};

SokkelSkipListe.defaultProps = {
  avklartefakta: [],
  maritimtArbeid: [],
};

class VurderingSokkelSkip extends React.Component {
  componentDidMount() {
    const { tilstand, oppdaterData } = this.props;
    const { installasjonArbeidsland, sokkelEllerSkip, sokkelSkipKonklusjon } = tilstand;
    installasjonArbeidsland.forEach(land => {
      oppdaterData(konverterTilStegData(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, land));
    });
    sokkelEllerSkip.forEach(sES => {
      oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, sES));
    });
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, sokkelSkipKonklusjon));
  }

  componentWillUnmount() {
    const { slettAllDataForSteg } = this.props;
    slettAllDataForSteg();
  }

  avklartefaktaEndret = (event, subjektID) => {
    const { oppdaterData } = this.props;
    const { value, name } = event.target;
    oppdaterData(lagAvklartfakta(name, subjektID, [value]));
  };

  avklartefaktaBegrunnelseEndret = (event, subjektID) => {
    const { oppdaterData } = this.props;
    const { value, name } = event.target;
    oppdaterData(lagAvklartefaktaBegrunnelse(name, subjektID, value));
  };

  konklusjonEndretHandler = event => {
    const { value } = event.target;
    const { oppdaterData, slettData } = this.props;
    this.avklartefaktaEndret(event);

    if (value === KV.Koder.VurderingSokkelSkipTyper.SOKKEL_NORSK) {
      oppdaterData(lagVilkaar('art11_3A', true));
    } else {
      slettData('vilkaar', 'art11_3A');
    }
  };

  render() {
    // Merknad fra møte 12.12.18: Vi må huske å gå innom “vurdering antall land”
    // dersom man har valgt “to sokler / skip i flere land” siden vi går inn i artikkel 13.
    const {
      bekreftOgFortsett, tilstand, skjema, begrunnelser, redigerbart,
    } = this.props;

    const { sokkelEllerSkip, sokkelSkipKonklusjon } = tilstand;
    const fakta = sokkelSkipKonklusjon.fakta ? sokkelSkipKonklusjon.fakta[0] : null;

    const { konklusjonEndretHandler } = this;
    const { VurderingSokkelSkipTyper } = KV.Koder;
    const { maritimtArbeid } = skjema;
    const { harAvklaring } = tilstand;
    /* eslint-disable max-len */
    return (
      <div className="vurderingSokkelSkip">
        <Nav.Undertittel>Vurdering av sokkel eller skip</Nav.Undertittel>
        <SokkelSkipListe
          avklartefakta={sokkelEllerSkip}
          maritimtArbeid={maritimtArbeid}
          begrunnelser={begrunnelser}
          redigerbart={redigerbart}
          radioEndretHandler={this.avklartefaktaEndret}
          selectEndretHandler={this.avklartefaktaBegrunnelseEndret} />
        {
          maritimtArbeid.length === 0 && (
            <div className="sokkelSkip__varsel"><Nav.AlertStripe type="advarsel">Det er ikke registrert verken sokkel eller skip.</Nav.AlertStripe></div>
          )
        }
        <Nav.Fieldset legend="Hvordan arbeider søkeren:">
          <Nav.Radio
            name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
            disabled={!redigerbart}
            onChange={konklusjonEndretHandler}
            checked={fakta === VurderingSokkelSkipTyper.SOKKEL_NORSK}
            value={VurderingSokkelSkipTyper.SOKKEL_NORSK}
            label="På norsk sokkel eller innenfor norsk territorialfarvann (art. 11.3.a)" />
          <Nav.Radio
            name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
            disabled={!redigerbart}
            onChange={konklusjonEndretHandler}
            checked={fakta === VurderingSokkelSkipTyper.SKIP_ETT_LAND}
            value={VurderingSokkelSkipTyper.SKIP_ETT_LAND}
            label="På skip registrert i ett land" />
          <Nav.Radio
            name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
            disabled={!redigerbart}
            onChange={konklusjonEndretHandler}
            checked={fakta === VurderingSokkelSkipTyper.SOKKEL_UTLAND}
            value={VurderingSokkelSkipTyper.SOKKEL_UTLAND}
            label="Utsendt til sokkel eller til annet lands territorialfarvann (art. 12)" />
          <Nav.Radio
            name={KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP}
            disabled
            onChange={konklusjonEndretHandler}
            checked={fakta === VurderingSokkelSkipTyper.SOKKEL_ELLER_SKIP_FLERE_LAND}
            value={VurderingSokkelSkipTyper.SOKKEL_ELLER_SKIP_FLERE_LAND}
            label="To sokler / skip i flere land (art. 13)" />
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
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
};

VurderingSokkelSkip.defaultProps = {
  tilstand: {},
};


export default VurderingSokkelSkip;
