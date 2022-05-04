import React, {MouseEvent, useEffect, useState} from "react";
import classNames from "classnames";

import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";

import * as Utils from "../../../../utils";
import FullmektigRedigerer from "./fullmektigRedigerer";
import FullmektigRedigeringUtfort from "./fullmektigRedigeringUtfort";
import EditerbartElement, {visAlltidBinSymbolsynlighet} from "../editerbartElement";
import {useKontaktOpplysninger} from "../kontaktopplysninger";
import {HentBostedsadresseForPersonQuery, useHentBostedsadresseForPersonLazyQuery} from "../familieforhold/familiemedlemmer/annenForelderModal/hentBostedsadresseForPerson.generated";

interface EnkeltFullmektigProps {
  className?: string;
  fullmektig: Api.Fagsaker.aktoer.Aktoer;
  redigerbart: boolean;
  slett: (e: MouseEvent) => Promise<any> | void;
  onRolleChange: (rolle: string, org?: string, personIdent?: string) => Promise<any>;
  onIdentFunnet: (orgnr: string, personIdent: string) => Promise<any>;
  saksnummer: string;
}

const EnkeltFullmektig = ({
  className,
  fullmektig,
  redigerbart,
  slett,
  onRolleChange,
  onIdentFunnet,
  saksnummer,
}: EnkeltFullmektigProps) => {
  const [org, settOrg] = useState<Partial<Api.Organisasjon>>({});
  const [person, settPerson] = useState<HentBostedsadresseForPersonQuery["hentPersonopplysninger"] | null>(null);
  const [orgForsoktHentet, setOrgForsoktHentet] = useState(false);
  const [slettFeilmelding, setSlettFeilmelding] = useState("");
  const [hentBostedsadresseForPerson] = useHentBostedsadresseForPersonLazyQuery()

  const [kontaktopplysninger, setKontaktopplysninger, slettKontaktOpplysninger, lagreKontaktOpplysninger] =
    useKontaktOpplysninger(saksnummer, fullmektig.orgnr || "");

  const hentOrgFraApi = async (orgnr: string) => {
    try {
      const hentetOrg = await Api.Organisasjoner.hentOrganisasjon(orgnr);
      settOrg(hentetOrg);
    } catch (e) {
      settOrg({});
    }

    setOrgForsoktHentet(true);
  };

  const hentPersonFraApi = async (personIdent: string) => {
    try {
      const { data } = await hentBostedsadresseForPerson({ variables: { ident: personIdent } });
      settPerson(data?.hentPersonopplysninger || null);
    } catch (e) {
      settPerson(null);
    }

    setOrgForsoktHentet(true);
  };

  useEffect(() => {
    if (fullmektig.orgnr) hentOrgFraApi(fullmektig.orgnr);
    if (fullmektig.personIdent) hentPersonFraApi(fullmektig.personIdent)
  }, [fullmektig.orgnr, fullmektig.personIdent]);

  const slettHandler = async (event: MouseEvent) => {
    try {
      await slett(event);
    } catch (error: any) {
      setSlettFeilmelding(error.message);
    }
  };

  if (fullmektig.orgnr ? !orgForsoktHentet : false) return null;

  const navn = person?.navn ? Utils.person.tilSammensattNavnFraObjekt(person?.navn) : ""
  const tittel = `Fullmektig: ${org.navn || navn || ""}`;

  const cls = classNames(className);

  return (
    <>
      <div role="alert">{slettFeilmelding && <Nav.Typo.Feilmelding>{slettFeilmelding}</Nav.Typo.Feilmelding>}</div>
      <EditerbartElement
        className={cls}
        redigerbart={redigerbart}
        harData={Boolean(fullmektig.representererKode && fullmektig.orgnr) || Boolean(fullmektig.representererKode && fullmektig.personIdent)}
        tittel={tittel}
        tittelUnderstrek
        understrek
        onBinClick={slettHandler}
        visLagreKnapp={Boolean(fullmektig.orgnr) || Boolean(fullmektig.personIdent)}
        symbolsynlighet={visAlltidBinSymbolsynlighet}
        redigererRender={() => (
          <FullmektigRedigerer
            databaseID={fullmektig.databaseID}
            representererKode={fullmektig.representererKode}
            org={org}
            redigerbart={redigerbart}
            onIdentFunnet={onIdentFunnet}
            onRolleChange={onRolleChange}
            kontaktopplysninger={kontaktopplysninger}
            onKontaktOpplysningerChange={setKontaktopplysninger}
            onKontaktopplysningerInputBlur={lagreKontaktOpplysninger}
            onKontaktopplysningerSlettClick={slettKontaktOpplysninger}
            person={person}
            fullmektig={fullmektig}
          />
        )}
        redigeringUtfortRender={() => (
          <FullmektigRedigeringUtfort
            representererKode={fullmektig.representererKode}
            kontaktopplysninger={kontaktopplysninger}
            org={org}
            person={person}
            fullmektig={fullmektig}
          />
        )}
      />
    </>
  );
};

export default EnkeltFullmektig;
