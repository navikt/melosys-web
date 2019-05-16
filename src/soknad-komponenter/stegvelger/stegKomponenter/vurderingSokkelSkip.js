import React, { Fragment, useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';

import { lagVilkaar, vilkaarType } from '../../../regler/vilkar';
import {
  hentFaktaVerdi,
  konverterTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
} from '../../../regler/avklartefakta';

import './vurderingSokkelSkip.css';


const ArbeidslandRadioButtons = props => {
  const { landliste, onChange, arbeidsland } = props;

  if (landliste.every(land => !land.kode)) return <Fragment>Ingen flaggland, sokkelland eller territorialfarvandsland valgt.</Fragment>;

  const grupperEtterKode = Utils.grupperEtterKey('kode');
  const landGruppertEtterKode = grupperEtterKode(landliste.filter(land => land.kode));

  return (
    Object.keys(landGruppertEtterKode)
      .map(landGruppeNavn => {
        const landTermerAssosiertMedRadiobutton = landGruppertEtterKode[landGruppeNavn].map(land => land.term);
        const label = `${landGruppeNavn}: ${landTermerAssosiertMedRadiobutton.join(' - ')}`;

        return <Nav.Radio onChange={onChange} key={label} checked={arbeidsland === landGruppeNavn} value={landGruppeNavn} label={label} name="arbeidsland" />;
      })
  );
};

ArbeidslandRadioButtons.propTypes = {
  landliste: PT.arrayOf(PT.shape({
    term: PT.string.isRequired,
    kode: PT.string.isRequired,
  })).isRequired,
  onChange: PT.func.isRequired,
  arbeidsland: PT.string,
};

ArbeidslandRadioButtons.defaultProps = {
  arbeidsland: '',
};

const SokkelSkipEnkelt = props => {
  const {
    maritimtArbeid,
    sokkelEllerSkip,
    arbeidslandAvklartfakta,
    begrunnelser,
    redigerbart,
    avklartefaktaEndretHandler,
    avklartefaktaBegrunnelserEndretHandler,
    oppdaterData,
  } = props;

  const {
    navn, flaggLandkode, installasjonsLandkode, territorialfarvann,
  } = maritimtArbeid;

  const { begrunnelseKoder } = sokkelEllerSkip;
  const installasjonsType = hentFaktaVerdi(sokkelEllerSkip);
  const arbeidsland = hentFaktaVerdi(arbeidslandAvklartfakta);
  const { SOKKEL, SKIP } = KV.Koder;

  const key = `${KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP}${navn}`;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, sokkelEllerSkip));
    oppdaterData(konverterTilStegData(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, arbeidslandAvklartfakta));
  }, []);

  const sokkelSkipEndret = e => (
    avklartefaktaEndretHandler(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, navn, e.target.value)
  );

  const begrunnelserEndret = e => (
    avklartefaktaBegrunnelserEndretHandler(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, navn, e.target.value)
  );

  const arbeidslandEndret = e => (
    avklartefaktaEndretHandler(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, navn, e.target.value)
  );

  return (
    <Nav.Row className="sokkelSkip__liste__rad">
      <Nav.Column xs="3" className="rad__navn">{navn}</Nav.Column>
      <Nav.Column xs="2" className="rad__sokkel">
        <Nav.Radio
          name={key}
          disabled={!redigerbart}
          onChange={sokkelSkipEndret}
          value={SOKKEL}
          checked={installasjonsType === SOKKEL}
          label="Sokkel" />
        <Nav.Radio
          name={key}
          disabled={!redigerbart}
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
            disabled={!redigerbart}
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
        <Nav.Fieldset disabled={!redigerbart} legend="Velg arbeidsland">
          <ArbeidslandRadioButtons
            landliste={[
              { term: 'Flaggland', kode: flaggLandkode },
              { term: 'Sokkelland', kode: installasjonsLandkode },
              { term: 'Territorialfarvandsland', kode: territorialfarvann },
            ]}
            onChange={arbeidslandEndret}
            arbeidsland={arbeidsland}
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
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  avklartefaktaEndretHandler: PT.func.isRequired,
  avklartefaktaBegrunnelserEndretHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
};

SokkelSkipEnkelt.defaultProps = {
  sokkelEllerSkip: {},
  arbeidslandAvklartfakta: {},
};

const SokkelSkipListe = props => {
  const {
    sokkelEllerSkipListe, maritimtArbeid, begrunnelser, redigerbart, avklartefaktaEndretHandler, avklartefaktaBegrunnelserEndretHandler, oppdaterData, installasjonArbeidslandListe,
  } = props;

  return (
    <div className="sokkelSkip__liste">
      { maritimtArbeid.map((enkelt, index) => (
        <SokkelSkipEnkelt
          key={JSON.stringify(enkelt)}
          maritimtArbeid={enkelt}
          sokkelEllerSkip={sokkelEllerSkipListe.find(avklartFakta => avklartFakta.subjektID === enkelt.navn)}
          arbeidslandAvklartfakta={installasjonArbeidslandListe.find(avklartFakta => avklartFakta.subjektID === enkelt.navn)}
          index={index}
          begrunnelser={begrunnelser}
          redigerbart={redigerbart}
          avklartefaktaEndretHandler={avklartefaktaEndretHandler}
          avklartefaktaBegrunnelserEndretHandler={avklartefaktaBegrunnelserEndretHandler}
          oppdaterData={oppdaterData}
        />))
      }
    </div>
  );
};

SokkelSkipListe.propTypes = {
  sokkelEllerSkipListe: PT.array,
  installasjonArbeidslandListe: PT.array,
  maritimtArbeid: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  avklartefaktaEndretHandler: PT.func.isRequired,
  avklartefaktaBegrunnelserEndretHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
};

SokkelSkipListe.defaultProps = {
  sokkelEllerSkipListe: [],
  maritimtArbeid: [],
  installasjonArbeidslandListe: [],
};

class VurderingSokkelSkip extends React.Component {
  componentDidMount() {
    const { tilstand, oppdaterData } = this.props;
    const { sokkelSkipKonklusjon } = tilstand;

    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, sokkelSkipKonklusjon));
  }

  componentWillUnmount() {
    const { slettAllDataForSteg } = this.props;
    slettAllDataForSteg();
  }

  avklartefaktaEndret = (type, subjektID, verdi) => {
    const { oppdaterData } = this.props;
    oppdaterData(lagAvklartfakta(type, subjektID, verdi));
  };

  avklartefaktaBegrunnelseEndret = (type, subjektID, verdi) => {
    const { oppdaterData } = this.props;
    oppdaterData(lagAvklartefaktaBegrunnelse(type, subjektID, verdi));
  };

  konklusjonEndretHandler = event => {
    const { value } = event.target;
    const { oppdaterData, slettData } = this.props;
    this.avklartefaktaEndret(KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP, null, value);

    if (value === KV.Koder.VurderingSokkelSkipTyper.SOKKEL_NORSK) {
      oppdaterData(lagVilkaar('art11_3A', true));
    } else {
      slettData(vilkaarType, 'art11_3A');
    }
  };

  render() {
    // Merknad fra møte 12.12.18: Vi må huske å gå innom “vurdering antall land”
    // dersom man har valgt “to sokler / skip i flere land” siden vi går inn i artikkel 13.
    const {
      bekreftOgFortsett, tilstand, skjema, begrunnelser, redigerbart, oppdaterData,
    } = this.props;

    const { sokkelEllerSkipListe, sokkelSkipKonklusjon, installasjonArbeidslandListe } = tilstand;
    const fakta = hentFaktaVerdi(sokkelSkipKonklusjon);

    const { konklusjonEndretHandler } = this;
    const { VurderingSokkelSkipTyper } = KV.Koder;
    const { maritimtArbeid } = skjema;
    const { harAvklaring } = tilstand;
    /* eslint-disable max-len */
    return (
      <div className="vurderingSokkelSkip">
        <Nav.Undertittel>Vurdering av sokkel eller skip</Nav.Undertittel>
        <SokkelSkipListe
          sokkelEllerSkipListe={sokkelEllerSkipListe}
          installasjonArbeidslandListe={installasjonArbeidslandListe}
          maritimtArbeid={maritimtArbeid}
          begrunnelser={begrunnelser}
          redigerbart={redigerbart}
          avklartefaktaEndretHandler={this.avklartefaktaEndret}
          avklartefaktaBegrunnelserEndretHandler={this.avklartefaktaBegrunnelseEndret}
          oppdaterData={oppdaterData}
        />
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
