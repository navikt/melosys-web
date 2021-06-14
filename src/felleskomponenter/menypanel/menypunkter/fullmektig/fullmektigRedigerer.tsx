import React, { ChangeEventHandler, FocusEventHandler, MouseEventHandler, useState } from "react";

import MKV from "../../../../melosyskodeverk";

import * as Nav from "../../../../utils/navFrontend";

import { Organisasjon } from "../../../../services/api";

import Kontaktopplysninger, { KontaktOpplysning } from "../kontaktopplysninger";
import OrganisasjonsAdresse from "../../../adresser/organisasjonsAdresse";
import SokFullmektigOrg from "./sokFullmektigOrg";

import "./fullmektigRedigerer.css";

interface FullmektigRedigererProps {
  onRolleChange: (rolle: string, org?: string) => Promise<any>;
  redigerbart: boolean;
  databaseID: number;
  onOrgFunnet: (orgnr: string) => Promise<any>;
  representererKode: string | null;
  org: Partial<Organisasjon>;
  onKontaktOpplysningerChange: (kontaktopplysning: KontaktOpplysning) => void;
  kontaktopplysninger: KontaktOpplysning;
  onKontaktopplysningerInputBlur: FocusEventHandler<HTMLInputElement>;
  onKontaktopplysningerSlettClick: MouseEventHandler<HTMLButtonElement>;
}

function FullmektigRedigerer(props: FullmektigRedigererProps) {
  const {
    redigerbart,
    databaseID = -1,
    onOrgFunnet,
    onRolleChange,
    representererKode,
    org,
    onKontaktOpplysningerChange,
    kontaktopplysninger,
    onKontaktopplysningerInputBlur,
    onKontaktopplysningerSlettClick,
  } = props;

  const [rolleFeilmelding, setRolleFeilmelding] = useState("");

  const rolleChangeHandler: ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      await onRolleChange(event.target.value, org.orgnr);
    } catch (error) {
      setRolleFeilmelding(error.message);
    }
  };

  const databaseIDString = databaseID.toString();

  return (
    <Nav.Row className="fullmektig__redigerer">
      <Nav.Column xs="6">
        <SokFullmektigOrg onOrgFunnet={onOrgFunnet} defaultOrgnr={org.orgnr || ""} />
        {org.orgnr && <OrganisasjonsAdresse organisasjon={org} className="adresse" visNavn={false} visTittel={false} />}
        {org.orgnr && (
          <>
            <Nav.Fieldset legend="Hvem er dette fullmektig for?" className="radioknapper">
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
                label="Arbeidstaker"
                value={MKV.Koder.representerer.BRUKER}
                name={databaseIDString}
                disabled={!redigerbart}
              />
              <Nav.Radio
                onChange={rolleChangeHandler}
                checked={representererKode === MKV.Koder.representerer.BEGGE}
                label="Både arbeidstaker og arbeidsgiver"
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
