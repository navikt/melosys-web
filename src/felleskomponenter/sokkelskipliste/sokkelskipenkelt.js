import React, { useEffect, Fragment } from 'react';
import PT from 'prop-types';
import uuid from 'uuid';

import MKV from '../../melosyskodeverk';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import * as MPT from '../../proptypes';

import {
  hentFaktaVerdi,
  konverterTilStegData,
  slettAvklartfakta,
} from '../../regler/avklartefakta';

import './sokkelskipenkelt.css';

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
    arbeidslandFakta,
    begrunnelser,
    redigerbart,
    avklartefaktaEndretHandler,
    avklartefaktaBegrunnelserEndretHandler,
    oppdaterData,
    slettData,
  } = props;

  const {
    enhetNavn, flaggLandkode, installasjonsLandkode, territorialfarvann,
  } = maritimtArbeid;

  const { begrunnelseKoder } = sokkelEllerSkip;
  const installasjonsType = hentFaktaVerdi(sokkelEllerSkip);
  const arbeidslandType = hentFaktaVerdi(arbeidslandTypeAvklartfakta);
  const arbeidsland = arbeidslandFakta.subjektID;
  const { SOKKEL, SKIP } = KV.Koder;

  const key = `${KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP}${enhetNavn}`;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, sokkelEllerSkip));
    oppdaterData(konverterTilStegData(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, arbeidslandAvklartfakta));
    oppdaterData(konverterTilStegData(MKV.Koder.avklartefaktatyper.ARBEIDSLAND), arbeidslandFakta);
    oppdaterData(konverterTilStegData(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, arbeidslandTypeAvklartfakta));
    const cleanup = () => {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, enhetNavn));
      slettData(slettAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, enhetNavn));
      slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, arbeidsland));
      slettData(slettAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, enhetNavn));
    };
    return cleanup;
  }, []);

  const sokkelSkipEndret = e => (
    avklartefaktaEndretHandler(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, enhetNavn, e.target.value)
  );

  const begrunnelserEndret = e => (
    avklartefaktaBegrunnelserEndretHandler(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, enhetNavn, e.target.value)
  );

  const arbeidslandEndret = (land = {}) => {
    avklartefaktaEndretHandler(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, enhetNavn, land.kode);
    avklartefaktaEndretHandler(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, land.kode, land.kode);
    avklartefaktaEndretHandler(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, enhetNavn, land.term);
  };

  const sokkelSkipDisabled = !(redigerbart && enhetNavn);

  return (
    <Nav.Row className="sokkelSkip__liste__rad">
      <Nav.Column xs="3">{enhetNavn}</Nav.Column>
      <Nav.Column xs="2">
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
        <Fragment>
          <Nav.Column xs="2">
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
          <Nav.Column xs="1"></Nav.Column>
        </Fragment>
      }
      <Nav.Column xs="4">
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
  arbeidslandFakta: PT.object,
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
  arbeidslandFakta: {},
};

export default SokkelSkipEnkelt;
