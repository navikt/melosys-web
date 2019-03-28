import React, { Fragment, useState, useEffect } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as Utils from '../../utils';

import Kontaktopplysninger from '../kontaktopplysninger';
import PostAdresse from '../../komponenter/adresser/postAdresse';
import SokFullmektigOrg from './sokFullmektigOrg';

import './fullmektig.css';

export function Fullmektig(props) {
  const {
    fullmektig,
    lagreFullmektig,
    redigerbart,
    databaseID,
    slettAktoer,
    slettFullmektigLokalt,
    lagreNyFullmektigOgOppdaterLokalt,
    hentOrg,
  } = props;
  const [representererKode, settRepresentererKode] = useState(null);
  const [org, settOrg] = useState(null);

  const vedRolleEndring = async event => {
    event.persist();
    try {
      if (org) await lagreFullmektig(event.target.value, org.orgnr, databaseID);
      settRepresentererKode(event.target.value);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const hentOrgFraApi = async () => {
    if (fullmektig.orgnr) settOrg(await hentOrg(fullmektig.orgnr));
  };

  useEffect(() => {
    if (fullmektig.representererKode) settRepresentererKode(fullmektig.representererKode);
    hentOrgFraApi();
  }, [fullmektig.representererKode, fullmektig.orgnr]);

  const slettFullmektig = async () => {
    try {
      await slettAktoer(databaseID);
      slettFullmektigLokalt(databaseID);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const databaseIDString = databaseID.toString();

  return (
    <Nav.Row className="fullmektig">
      <Nav.Column xs="6">
        {
          org &&
          <Fragment>
            {org.navn}
            <div className="postadresse_tittel">Postadresse</div>
            <PostAdresse postadresse={org.postadresse} />
          </Fragment>
        }
        {
          !org &&
          <Fragment>
            <SokFullmektigOrg lagreNyFullmektigOgOppdaterLokalt={orgnr => lagreNyFullmektigOgOppdaterLokalt(representererKode, orgnr)} />
          </Fragment>
        }
        <Nav.Fieldset disabled={!redigerbart} legend="Hvem er dette fullmektig for?" className="radioknapper">
          <Nav.Radio
            onChange={vedRolleEndring}
            checked={representererKode === MKV.Koder.representerer.ARBEIDSGIVER}
            label="Arbeidsgiver"
            value={MKV.Koder.representerer.ARBEIDSGIVER}
            name={databaseIDString}
          />
          <Nav.Radio
            onChange={vedRolleEndring}
            checked={representererKode === MKV.Koder.representerer.BRUKER}
            label="Arbeidstaker"
            value={MKV.Koder.representerer.BRUKER}
            name={databaseIDString}
          />
          <Nav.Radio
            onChange={vedRolleEndring}
            checked={representererKode === MKV.Koder.representerer.BEGGE}
            label="Både arbeidstaker og arbeidsgiver"
            value={MKV.Koder.representerer.BEGGE}
            name={databaseIDString}
          />
        </Nav.Fieldset>
        <Nav.Knapp disabled={!redigerbart} onClick={slettFullmektig} type="mini">&times; FJERN FULLMEKTIG</Nav.Knapp>
      </Nav.Column>
      <Nav.Column xs="6">
        {
          org && <Kontaktopplysninger juridiskOrg={org} />
        }
      </Nav.Column>
    </Nav.Row>
  );
}

Fullmektig.propTypes = {
  fullmektig: PT.object,
  lagreFullmektig: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  databaseID: PT.number,
  slettAktoer: PT.func.isRequired,
  slettFullmektigLokalt: PT.func.isRequired,
  lagreNyFullmektigOgOppdaterLokalt: PT.func.isRequired,
  hentOrg: PT.func.isRequired,
};

Fullmektig.defaultProps = {
  fullmektig: {},
  databaseID: 0,
};
