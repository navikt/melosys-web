import { ChangeEventHandler, FocusEventHandler, MouseEventHandler, useState } from "react";

import MKV from "../../../../../melosyskodeverk";

import * as Nav from "../../../../../navFrontend";

import { Organisasjon } from "../../../../../services/api";

import Kontaktopplysninger, { KontaktOpplysning } from "../../kontaktopplysninger";
import SokFullmektigOrgOrIdent from "./sokFullmektigOrgOrIdent";

import "./fullmektigRedigerer.css";
import StrukturertAdresse from "../../../../adresser/strukturertAdresse";
import * as Utils from "../../../../../utils";
import * as Api from "../../../../../services/api";
import { Personopplysninger } from "../../../../../graphql";

interface FullmektigRedigererProps {
  onRolleChange: (rolle: string, org?: string, personIdent?: string) => Promise<any>;
  redigerbart: boolean;
  databaseID: number;
  onIdentFunnet: (orgnr: string, personIdent: string) => Promise<any>;
  representererKode: string | null;
  org: Partial<Organisasjon>;
  onKontaktOpplysningerChange: (kontaktopplysning: KontaktOpplysning) => void;
  kontaktopplysninger: KontaktOpplysning;
  onKontaktopplysningerInputBlur: FocusEventHandler<HTMLInputElement>;
  onKontaktopplysningerSlettClick: MouseEventHandler<HTMLButtonElement>;
  fullmektig: Api.Fagsaker.aktoer.Aktoer;
  person: Personopplysninger | null;
}

function FullmektigRedigerer(props: FullmektigRedigererProps) {
  const {
    redigerbart,
    databaseID = -1,
    onIdentFunnet,
    onRolleChange,
    representererKode,
    org,
    onKontaktOpplysningerChange,
    kontaktopplysninger,
    onKontaktopplysningerInputBlur,
    onKontaktopplysningerSlettClick,
    person,
    fullmektig,
  } = props;

  const [rolleFeilmelding, setRolleFeilmelding] = useState("");

  const rolleChangeHandler: ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      await onRolleChange(event.target.value, org.orgnr);
    } catch (error: any) {
      setRolleFeilmelding(error.message);
    }
  };

  const databaseIDString = databaseID.toString();

  return (
    <Nav.Row className="fullmektig__redigerer">
      <Nav.Column xs="6">
        <SokFullmektigOrgOrIdent
          onIdentFunnet={onIdentFunnet}
          defaultOrgnrIdent={fullmektig.orgnr || fullmektig.personIdent || ""}
        />
        {person && (
          <>
            {Utils.person.tilSammensattNavnFraObjekt(person.navn)}
            {!Utils._isEmpty(person.bostedsadresser) && (
              <StrukturertAdresse
                adresse={{
                  ...person.bostedsadresser[0]?.adresse,
                  landkode: person.bostedsadresser[0]?.adresse.land,
                  coAdressenavn: person.bostedsadresser[0]?.coAdressenavn,
                }}
              />
            )}
          </>
        )}
        {org.orgnr && (
          <>
            <Nav.Fieldset legend="Hvem representerer fullmektig?" className="radioknapper">
              <Nav.Radio
                onChange={rolleChangeHandler}
                checked={representererKode === MKV.Koder.representerer.ARBEIDSGIVER}
                label="Arbeidsgiver"
                value={MKV.Koder.representerer.ARBEIDSGIVER}
                name={databaseIDString}
                disabled={!redigerbart}
              />
              <Nav.Radio
                onChange={rolleChangeHandler}
                checked={representererKode === MKV.Koder.representerer.BRUKER}
                label="Bruker"
                value={MKV.Koder.representerer.BRUKER}
                name={databaseIDString}
                disabled={!redigerbart}
              />
              <Nav.Radio
                onChange={rolleChangeHandler}
                checked={representererKode === MKV.Koder.representerer.BEGGE}
                label="Både bruker og arbeidsgiver"
                value={MKV.Koder.representerer.BEGGE}
                name={databaseIDString}
                disabled={!redigerbart}
              />
            </Nav.Fieldset>
            <div role="alert">
              {rolleFeilmelding && <Nav.Typo.Feilmelding>{rolleFeilmelding}</Nav.Typo.Feilmelding>}
            </div>
          </>
        )}
      </Nav.Column>
      <Nav.Column xs="6">
        {org.orgnr && (
          <Kontaktopplysninger
            redigerbart={redigerbart}
            onChange={onKontaktOpplysningerChange}
            kontaktopplysninger={kontaktopplysninger}
            onInputBlur={onKontaktopplysningerInputBlur}
            onSlettKnappClick={onKontaktopplysningerSlettClick}
          />
        )}
      </Nav.Column>
    </Nav.Row>
  );
}

export default FullmektigRedigerer;
