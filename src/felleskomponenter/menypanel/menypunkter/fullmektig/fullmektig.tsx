import React, { Fragment, useState, useEffect, ChangeEventHandler, MouseEventHandler } from 'react';
import { Organisasjon } from 'Domene';

import MKV from '../../../../melosyskodeverk';

import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';

import Kontaktopplysninger from '../../../kontaktopplysninger';
import OrganisasjonsAdresse from '../../../adresser/organisasjonsAdresse';
import SokFullmektigOrgProps from './sokFullmektigOrg';

import './fullmektig.css';

interface FullmektigProps {
  onRolleChange: (rolle: string, org?: string) => void,
  redigerbart: boolean,
  databaseID: number,
  settRepresentant: (representererKode: string) => void,
  onClickSlett: MouseEventHandler,
  onOrgFunnet: (orgnr: string) => void,
  representererKode: string | null,
  orgnr: string | null,
}

function Fullmektig(props: FullmektigProps) {
  const {
    redigerbart,
    databaseID = -1,
    onClickSlett,
    onOrgFunnet,
    settRepresentant,
    onRolleChange,
    representererKode,
    orgnr,
  } = props;

  const [org, settOrg] = useState<Partial<Organisasjon>>({});

  const onRadioChange: ChangeEventHandler<HTMLInputElement> = event => {
    onRolleChange(event.target.value, org.orgnr);
  };

  const hentOrgFraApi = async () => {
    if (orgnr) {
      try {
        const hentetOrg = await Api.Organisasjoner.hentOrganisasjon(orgnr);
        settOrg(hentetOrg);
      } catch (e) {
        Utils.logger.error(e);
      }
    }
  };

  useEffect(() => {
    // TODO: forsøk å fjerne neste linje, må testes dog
    if (representererKode) settRepresentant(representererKode);
    hentOrgFraApi();
  }, [representererKode, orgnr]);

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
          !org && <SokFullmektigOrgProps
            onOrgFunnet={onOrgFunnet}
          />
        }
        {
          org &&
          <Nav.Fieldset legend="Hvem er dette fullmektig for?" className="radioknapper">
            <Nav.Radio
              onChange={onRadioChange}
              checked={representererKode === MKV.Koder.representerer.ARBEIDSGIVER}
              label="Arbeidsgiver"
              value={MKV.Koder.representerer.ARBEIDSGIVER}
              name={databaseIDString}
              disabled={!redigerbart}
            />
            <Nav.Radio
              onChange={onRadioChange}
              checked={representererKode === MKV.Koder.representerer.BRUKER}
              label="Arbeidstaker"
              value={MKV.Koder.representerer.BRUKER}
              name={databaseIDString}
              disabled={!redigerbart}
            />
            <Nav.Radio
              onChange={onRadioChange}
              checked={representererKode === MKV.Koder.representerer.BEGGE}
              label="Både arbeidstaker og arbeidsgiver"
              value={MKV.Koder.representerer.BEGGE}
              name={databaseIDString}
              disabled={!redigerbart}
            />
          </Nav.Fieldset>
        }
        <Nav.Knapp disabled={!redigerbart} onClick={onClickSlett} type="standard">&times; FJERN FULLMEKTIG</Nav.Knapp>
      </Nav.Column>
      <Nav.Column xs="6">
        {
          org && <Kontaktopplysninger juridiskOrg={org} redigerbart={redigerbart} />
        }
      </Nav.Column>
    </Nav.Row>
  );
}

export default Fullmektig;
