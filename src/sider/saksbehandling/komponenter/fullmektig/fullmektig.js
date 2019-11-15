import React, { Fragment, useState, useEffect } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';

import Kontaktopplysninger from '../kontaktopplysninger';
import OrganisasjonsAdresse from '../../../../felleskomponenter/adresser/organisasjonsAdresse';
import SokFullmektigOrg from './sokFullmektigOrg';

import './fullmektig.css';

function Fullmektig(props) {
  const {
    fullmektig,
    lagreFullmektig,
    redigerbart,
    databaseID,
    slettAktoer,
    slettFullmektigLokalt,
    lagreNyFullmektigOgOppdaterLokalt,
    hentOrg,
    index,
    settRepresentant,
  } = props;
  const [org, settOrg] = useState(null);

  const vedRolleEndring = async event => {
    event.persist();
    const representererKode = event.target.value;

    try {
      if (org) await lagreFullmektig(representererKode, org.orgnr, databaseID);
      settRepresentant(index, representererKode);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const hentOrgFraApi = async () => {
    if (fullmektig.orgnr) settOrg(await hentOrg(fullmektig.orgnr));
  };

  useEffect(() => {
    if (fullmektig.representererKode) settRepresentant(index, fullmektig.representererKode);
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
            <Nav.typo.Element>Juridisk enhet</Nav.typo.Element>
            <OrganisasjonsAdresse organisasjon={org} className="adresse" />
          </Fragment>
        }
        {
          !org && <SokFullmektigOrg lagreNyFullmektigOgOppdaterLokalt={orgnr => lagreNyFullmektigOgOppdaterLokalt(fullmektig.representererKode, orgnr)} />
        }
        {
          org &&
          <Nav.Fieldset disabled={!redigerbart} legend="Hvem er dette fullmektig for?" className="radioknapper">
            <Nav.Radio
              onChange={vedRolleEndring}
              checked={fullmektig.representererKode === MKV.Koder.representerer.ARBEIDSGIVER}
              label="Arbeidsgiver"
              value={MKV.Koder.representerer.ARBEIDSGIVER}
              name={databaseIDString}
            />
            <Nav.Radio
              onChange={vedRolleEndring}
              checked={fullmektig.representererKode === MKV.Koder.representerer.BRUKER}
              label="Arbeidstaker"
              value={MKV.Koder.representerer.BRUKER}
              name={databaseIDString}
            />
            <Nav.Radio
              onChange={vedRolleEndring}
              checked={fullmektig.representererKode === MKV.Koder.representerer.BEGGE}
              label="Både arbeidstaker og arbeidsgiver"
              value={MKV.Koder.representerer.BEGGE}
              name={databaseIDString}
            />
          </Nav.Fieldset>
        }
        <Nav.Knapp disabled={!redigerbart} onClick={slettFullmektig} type="standard">&times; FJERN FULLMEKTIG</Nav.Knapp>
      </Nav.Column>
      <Nav.Column xs="6">
        {
          org && <Kontaktopplysninger juridiskOrg={org} redigerbart={redigerbart} />
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
  index: PT.number.isRequired,
  slettAktoer: PT.func.isRequired,
  slettFullmektigLokalt: PT.func.isRequired,
  lagreNyFullmektigOgOppdaterLokalt: PT.func.isRequired,
  hentOrg: PT.func.isRequired,
  settRepresentant: PT.func.isRequired,
};

Fullmektig.defaultProps = {
  fullmektig: {},
  databaseID: 0,
};

export default Fullmektig;
