import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Aktoer, Organisasjon } from 'Domene';

import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';

import FullmektigRedigerer from './fullmektigRedigerer';
import FullmektigRedigeringUtfort from './fullmektigRedigeringUtfort';
import EditerbartElement from '../editerbartElement';
import { useKontaktOpplysninger } from '../kontaktopplysninger';

interface EnkeltFullmektigProps {
  className?: string,
  fullmektig: Aktoer,
  redigerbart: boolean,
  slett: () => void,
  onRolleChange: (rolle: string, org?: string) => void,
  onOrgFunnet: (orgnr: string) => void,
  saksnummer: string,
}

const EnkeltFullmektig = ({
  className,
  fullmektig,
  redigerbart,
  slett,
  onRolleChange,
  onOrgFunnet,
  saksnummer,
}: EnkeltFullmektigProps) => {
  const [org, settOrg] = useState<Partial<Organisasjon>>({});
  const [orgForsoktHentet, setOrgForsoktHentet] = useState(false);

  const [
    kontaktopplysninger,
    setKontaktopplysninger,
    slettKontaktOpplysninger,
    lagreKontaktOpplysninger,
  ] = useKontaktOpplysninger(saksnummer, fullmektig.orgnr || '');

  const hentOrgFraApi = async (orgnr: string) => {
    try {
      const hentetOrg = await Api.Organisasjoner.hentOrganisasjon(orgnr);
      settOrg(hentetOrg);
    } catch (e) {
      Utils.logger.error(e);
    }

    setOrgForsoktHentet(true);
  };

  useEffect(() => {
    if (fullmektig.orgnr) hentOrgFraApi(fullmektig.orgnr);
  }, [fullmektig.orgnr]);

  const slettHandler = () => {
    slett();
  };

  if (fullmektig.orgnr ? !orgForsoktHentet : false) return null;

  const tittel = `Fullmektig: ${org.navn || ''}`;

  const cls = classNames(className);

  return (
    <EditerbartElement
      className={cls}
      redigerbart={redigerbart}
      harData={Boolean(fullmektig.representererKode && fullmektig.orgnr)}
      tittel={tittel}
      tittelUnderstrek
      understrek
      hentNyStatusVedHarData={false}
      onBinClick={slettHandler}
      visLagreKnapp={Boolean(fullmektig.orgnr)}
      redigererRender={() => (
        <FullmektigRedigerer
          databaseID={fullmektig.databaseID}
          representererKode={fullmektig.representererKode}
          org={org}
          redigerbart={redigerbart}
          onOrgFunnet={onOrgFunnet}
          onRolleChange={onRolleChange}
          kontaktopplysninger={kontaktopplysninger}
          onKontaktOpplysningerChange={setKontaktopplysninger}
          onKontaktopplysningerInputBlur={lagreKontaktOpplysninger}
          onKontaktopplysningerSlettClick={slettKontaktOpplysninger}
        />
      )}
      redigeringUtfortRender={() => (
        <FullmektigRedigeringUtfort
          representererKode={fullmektig.representererKode}
          kontaktopplysninger={kontaktopplysninger}
          org={org}
        />
      )}
    />
  );
};

export default EnkeltFullmektig;
