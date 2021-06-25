import React, { useState, useEffect, MouseEvent } from "react";
import classNames from "classnames";

import * as Api from "../../../../services/api";
import * as Nav from "../../../../utils/navFrontend";

import FullmektigRedigerer from "./fullmektigRedigerer";
import FullmektigRedigeringUtfort from "./fullmektigRedigeringUtfort";
import EditerbartElement, { visAlltidBinSymbolsynlighet } from "../editerbartElement";
import { useKontaktOpplysninger } from "../kontaktopplysninger";

interface EnkeltFullmektigProps {
  className?: string;
  fullmektig: Api.Fagsaker.aktoer.Aktoer;
  redigerbart: boolean;
  slett: (e: MouseEvent) => Promise<any> | void;
  onRolleChange: (rolle: string, org?: string) => Promise<any>;
  onOrgFunnet: (orgnr: string) => Promise<any>;
  saksnummer: string;
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
  const [org, settOrg] = useState<Partial<Api.Organisasjon>>({});
  const [orgForsoktHentet, setOrgForsoktHentet] = useState(false);
  const [slettFeilmelding, setSlettFeilmelding] = useState("");

  const [
    kontaktopplysninger,
    setKontaktopplysninger,
    slettKontaktOpplysninger,
    lagreKontaktOpplysninger,
  ] = useKontaktOpplysninger(saksnummer, fullmektig.orgnr || "");

  const hentOrgFraApi = async (orgnr: string) => {
    try {
      const hentetOrg = await Api.Organisasjoner.hentOrganisasjon(orgnr);
      settOrg(hentetOrg);
    } catch (e) {
      settOrg({});
    }

    setOrgForsoktHentet(true);
  };

  useEffect(() => {
    if (fullmektig.orgnr) hentOrgFraApi(fullmektig.orgnr);
  }, [fullmektig.orgnr]);

  const slettHandler = async (event: MouseEvent) => {
    try {
      await slett(event);
    } catch (error) {
      setSlettFeilmelding(error.message);
    }
  };

  if (fullmektig.orgnr ? !orgForsoktHentet : false) return null;

  const tittel = `Fullmektig: ${org.navn || ""}`;

  const cls = classNames(className);

  return (
    <>
      <div role="alert">{slettFeilmelding && <Nav.Typo.Feilmelding>{slettFeilmelding}</Nav.Typo.Feilmelding>}</div>
      <EditerbartElement
        className={cls}
        redigerbart={redigerbart}
        harData={Boolean(fullmektig.representererKode && fullmektig.orgnr)}
        tittel={tittel}
        tittelUnderstrek
        understrek
        onBinClick={slettHandler}
        visLagreKnapp={Boolean(fullmektig.orgnr)}
        symbolsynlighet={visAlltidBinSymbolsynlighet}
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
    </>
  );
};

export default EnkeltFullmektig;
