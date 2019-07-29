import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import uuid from 'uuid';

import * as Nav from '../../../../../utils/navFrontend';
import * as KV from '../../../../../kodeverk';
import * as MPT from '../../../../../proptypes';
import * as Utils from '../../../../../utils';

import { lagVilkaar, slettVilkar } from '../../../../../regler/vilkar';
import {
  hentFaktaVerdi,
  konverterTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
  slettAvklartfakta,
} from '../../../../../regler/avklartefakta';

import { formSelectors } from '../../../../../ducks/form';

import './vurderingSokkelSkip.css';


const ArbeidslandRadioButtons = props => {
  const { landliste, onChange, arbeidslandType } = props;

  if (landliste.every(land => !land.kode)) return 'Ingen flaggland, sokkelland eller territorialfarvannsland valgt.';

  const utfylteLand = landliste.filter(land => land.kode);

  const unikRadioButtonGruppeID = uuid();

  return utfylteLand.map(land => (
    <Nav.Radio
      onChange={() => onChange(land)}
      checked={arbeidslandType === land.term}
      key={land.term}
      value={land}
      label={`${KV.kodeTilTerm(land.kode, MKV.KTObjects.landkoder)} - ${land.term}`}
      name={unikRadioButtonGruppeID}
    />
  ));
};

ArbeidslandRadioButtons.propTypes = {
  landliste: PT.arrayOf(PT.shape({
    term: PT.string.isRequired,
    kode: PT.string,
  })).isRequired,
  onChange: PT.func.isRequired,
  arbeidlandType: PT.string,
};

ArbeidslandRadioButtons.defaultProps = {
  arbeidslandType: '',
};

const SokkelSkipEnkelt = props => {
  const {
    maritimtArbeid,
    sokkelEllerSkip,
    arbeidslandAvklartfakta,
    arbeidslandTypeAvklartfakta,
    begrunnelser,
    redigerbart,
    avklartefaktaEndretHandler,
    avklartefaktaBegrunnelserEndretHandler,
    oppdaterData,
    slettData,
  } = props;

  const {
    navn, flaggLandkode, installasjonsLandkode, territorialfarvann,
  } = maritimtArbeid;

  const { begrunnelseKoder } = sokkelEllerSkip;
  const installasjonsType = hentFaktaVerdi(sokkelEllerSkip);
  const arbeidslandType = hentFaktaVerdi(arbeidslandTypeAvklartfakta);
  const { SOKKEL, SKIP } = KV.Koder;

  const key = `${KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP}${navn}`;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, sokkelEllerSkip));
    oppdaterData(konverterTilStegData(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, arbeidslandAvklartfakta));
    oppdaterData(konverterTilStegData(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, arbeidslandTypeAvklartfakta));
    return function cleanup() {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, navn));
      slettData(slettAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, navn));
      slettData(slettAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, navn));
    };
  }, []);

  const sokkelSkipEndret = e => (
    avklartefaktaEndretHandler(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, navn, e.target.value)
  );

  const begrunnelserEndret = e => (
    avklartefaktaBegrunnelserEndretHandler(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, navn, e.target.value)
  );

  const arbeidslandEndret = (land = {}) => {
    avklartefaktaEndretHandler(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, navn, land.kode);
    avklartefaktaEndretHandler(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, navn, land.term);
  };

  const sokkelSkipDisabled = !(redigerbart && navn);

  return (
    <Nav.Row className="sokkelSkip__liste__rad">
      <Nav.Column xs="3" className="rad__navn">{navn}</Nav.Column>
      <Nav.Column xs="2" className="rad__sokkel">
        <Nav.Radio
          name={key}
          disabled={sokkelSkipDisabled}
          onChange={sokkelSkipEndret}
          value={SOKKEL}
          checked={installasjonsType === SOKKEL}
          label="Sokkel" />
        <Nav.Radio
          name={key}
          disabled={sokkelSkipDisabled}
          onChange={sokkelSkipEndret}
          checked={installasjonsType === SKIP}
          value={SKIP}
          label="Skip" />
      </Nav.Column>
      {
        installasjonsType === SOKKEL &&
        <Nav.Column xs="2" className="rad__begrunnelse">
          <Nav.Select
            name={`${key}_begrunnelser`}
            disabled={sokkelSkipDisabled}
            id="installasjonsTypeBegrunnelser"
            label="Begrunnelse hvis sokkel"
            onChange={begrunnelserEndret}
            value={begrunnelseKoder[0]} >
            <option key={null} value={null} />
            {begrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
          </Nav.Select>
        </Nav.Column>
      }
      <Nav.Column xs="5" className="rad__land">
        <Nav.Fieldset disabled={sokkelSkipDisabled} legend="Velg arbeidsland">
          <ArbeidslandRadioButtons
            landliste={[
              { term: 'Flaggland', kode: flaggLandkode },
              { term: 'Sokkelland', kode: installasjonsLandkode },
              { term: 'Territorialfarvannsland', kode: territorialfarvann },
            ]}
            onChange={arbeidslandEndret}
            arbeidslandType={arbeidslandType}
          />
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  );
};

SokkelSkipEnkelt.propTypes = {
  index: PT.number.isRequired,
  maritimtArbeid: PT.object.isRequired,
  sokkelEllerSkip: PT.object,
  arbeidslandAvklartfakta: PT.object,
  arbeidslandTypeAvklartfakta: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  avklartefaktaEndretHandler: PT.func.isRequired,
  avklartefaktaBegrunnelserEndretHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

SokkelSkipEnkelt.defaultProps = {
  sokkelEllerSkip: {},
  arbeidslandAvklartfakta: {},
  arbeidslandTypeAvklartfakta: {},
};

const SokkelSkipListe = props => {
  const {
    sokkelEllerSkipListe, maritimtArbeid, begrunnelser, redigerbart, avklartefaktaEndretHandler,
    avklartefaktaBegrunnelserEndretHandler, oppdaterData, slettData, installasjonArbeidslandListe, installasjonArbeidslandTypeListe,
  } = props;

  return (
    <div className="sokkelSkip__liste">
      { maritimtArbeid.map((enkelt, index) => (
        <SokkelSkipEnkelt
          key={JSON.stringify(enkelt)}
          maritimtArbeid={enkelt}
          sokkelEllerSkip={sokkelEllerSkipListe.find(avklartFakta => avklartFakta.subjektID === enkelt.navn)}
          arbeidslandAvklartfakta={installasjonArbeidslandListe.find(avklartFakta => avklartFakta.subjektID === enkelt.navn)}
          arbeidslandTypeAvklartfakta={installasjonArbeidslandTypeListe.find(avklartfakta => avklartfakta.subjektID === enkelt.navn)}
          index={index}
          begrunnelser={begrunnelser}
          redigerbart={redigerbart}
          avklartefaktaEndretHandler={avklartefaktaEndretHandler}
          avklartefaktaBegrunnelserEndretHandler={avklartefaktaBegrunnelserEndretHandler}
          oppdaterData={oppdaterData}
          slettData={slettData}
        />))}
    </div>
  );
};

SokkelSkipListe.propTypes = {
  sokkelEllerSkipListe: PT.array,
  installasjonArbeidslandListe: PT.array,
  installasjonArbeidslandTypeListe: PT.array,
  maritimtArbeid: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  avklartefaktaEndretHandler: PT.func.isRequired,
  avklartefaktaBegrunnelserEndretHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

SokkelSkipListe.defaultProps = {
  sokkelEllerSkipListe: [],
  maritimtArbeid: [],
  installasjonArbeidslandListe: [],
  installasjonArbeidslandTypeListe: [],
};

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
      sokkelEllerSkipListe, sokkelSkipKonklusjon, installasjonArbeidslandListe, installasjonArbeidslandTypeListe,
    } = tilstand;
    const fakta = hentFaktaVerdi(sokkelSkipKonklusjon);

    const { konklusjonEndretHandler } = this;
    const { VurderingSokkelSkipTyper } = KV.Koder;
    const { harAvklaring } = tilstand;
    const harMaritimeArbeidUnikeNavn = Utils.erPropertyUnik(maritimtArbeid, enkeltMaritimtArbeid => enkeltMaritimtArbeid.navn);
    /* eslint-disable max-len */
    return (
      <div className="vurderingSokkelSkip">
        <Nav.Undertittel>Vurdering av sokkel eller skip</Nav.Undertittel>
        <SokkelSkipListe
          sokkelEllerSkipListe={sokkelEllerSkipListe}
          installasjonArbeidslandListe={installasjonArbeidslandListe}
          installasjonArbeidslandTypeListe={installasjonArbeidslandTypeListe}
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
