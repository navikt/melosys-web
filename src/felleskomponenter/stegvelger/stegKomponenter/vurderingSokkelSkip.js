import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';

import SokkelSkipListe from '../../../felleskomponenter/sokkelskipliste';
import { lagVilkaar, slettVilkar } from '../../../regler/vilkar';
import {
  hentFaktaVerdi,
  konverterTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
} from '../../../regler/avklartefakta';

import { formSelectors } from '../../../ducks/form';

import './vurderingSokkelSkip.css';

class VurderingSokkelSkip extends React.Component {
  componentDidMount() {
    const { tilstand, oppdaterData } = this.props;
    const { sokkelSkipKonklusjon } = tilstand;

    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, sokkelSkipKonklusjon));
  }

  componentWillUnmount() {
    this.props.slettData();
  }

  avklartefaktaEndret = (type, subjektID, verdi) => {
    const { oppdaterData } = this.props;
    oppdaterData(lagAvklartfakta(type, subjektID, verdi, null));
  };

  avklartefaktaBegrunnelseEndret = (type, subjektID, verdi) => {
    const { oppdaterData } = this.props;
    oppdaterData(lagAvklartefaktaBegrunnelse(type, subjektID, [verdi]));
  };

  konklusjonEndretHandler = event => {
    const { value } = event.target;
    const { oppdaterData, slettData } = this.props;
    this.avklartefaktaEndret(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, null, value);

    if (value === KV.Koder.VurderingSokkelSkipTyper.SOKKEL_NORSK) {
      oppdaterData(lagVilkaar('art11_3A', true));
    } else {
      slettData(slettVilkar('art11_3A'));
    }
  };

  render() {
    // Merknad fra møte 12.12.18: Vi må huske å gå innom “vurdering antall land”
    // dersom man har valgt “to sokler / skip i flere land” siden vi går inn i artikkel 13.
    const {
      bekreftOgFortsett, tilstand, begrunnelser, redigerbart, oppdaterData, slettData, maritimtArbeid,
    } = this.props;

    const {
      sokkelEllerSkipListe, sokkelSkipKonklusjon, installasjonArbeidslandListe, installasjonArbeidslandTypeListe, arbeidslandListe,
    } = tilstand;
    const fakta = hentFaktaVerdi(sokkelSkipKonklusjon);

    const { konklusjonEndretHandler } = this;
    const { VurderingSokkelSkipTyper } = KV.Koder;
    const { harAvklaring } = tilstand;
    const harMaritimeArbeidUnikeNavn = Utils.erPropertyUnik(maritimtArbeid, enkeltMaritimtArbeid => enkeltMaritimtArbeid.enhetNavn);
    /* eslint-disable max-len */
    return (
      <div className="vurderingSokkelSkip">
        <Nav.typo.Undertittel>Vurdering av sokkel eller skip</Nav.typo.Undertittel>
        <SokkelSkipListe
          sokkelEllerSkipListe={sokkelEllerSkipListe}
          installasjonArbeidslandListe={installasjonArbeidslandListe}
          installasjonArbeidslandTypeListe={installasjonArbeidslandTypeListe}
          arbeidslandListe={arbeidslandListe}
          maritimtArbeid={maritimtArbeid}
          begrunnelser={begrunnelser}
          redigerbart={redigerbart && harMaritimeArbeidUnikeNavn}
          avklartefaktaEndretHandler={this.avklartefaktaEndret}
          avklartefaktaBegrunnelserEndretHandler={this.avklartefaktaBegrunnelseEndret}
          oppdaterData={oppdaterData}
          slettData={slettData}
        />
        {
          maritimtArbeid.length === 0 && (
            <div className="sokkelSkip__varsel"><Nav.AlertStripe type="advarsel">Det er ikke registrert verken sokkel eller skip.</Nav.AlertStripe></div>
          )
        }
        {
          !harMaritimeArbeidUnikeNavn && (
            <div className="sokkelSkip__varsel"><Nav.AlertStripe type="advarsel">Det er registrert flere maritime arbeid med samme navn.</Nav.AlertStripe></div>
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
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
    /* eslint-enable max-len */
  }
}

VurderingSokkelSkip.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  maritimtArbeid: PT.array,
  tilstand: PT.object,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VurderingSokkelSkip.defaultProps = {
  tilstand: {},
  maritimtArbeid: [],
};

const mapStateToProps = state => ({
  maritimtArbeid: formSelectors.MaritimtArbeidSelector(state),
});

export default connect(mapStateToProps)(VurderingSokkelSkip);
