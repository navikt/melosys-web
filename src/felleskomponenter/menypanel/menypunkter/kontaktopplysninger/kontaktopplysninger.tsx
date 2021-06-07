import React, {
  FocusEventHandler,
  MouseEventHandler,
  ChangeEventHandler,
  useState,
  useEffect,
  FocusEvent,
  MouseEvent,
} from "react";

import * as Nav from "../../../../utils/navFrontend";
import * as Mui from "../../../ui";
import * as Utils from "../../../../utils";
import * as Api from "../../../../services/api";
import * as Types from "./types";

import OrganisasjonsAdresse from "../../../adresser/organisasjonsAdresse";

import "./kontaktopplysninger.css";

export interface Feilmelding {
  feilmelding: string;
}

interface KontaktOpplysningerProps {
  onChange: (kontaktopplysning: Types.KontaktOpplysning) => void;
  kontaktopplysninger: Types.KontaktOpplysning;
  redigerbart: boolean;
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => Promise<any> | void;
  onSlettKnappClick: (e: MouseEvent<HTMLButtonElement>) => Promise<any> | void;
}

export const KontaktOpplysninger = ({
  onChange,
  kontaktopplysninger,
  redigerbart,
  onInputBlur,
  onSlettKnappClick,
}: KontaktOpplysningerProps) => {
  const [sokeResultat, setSokeResultat] = useState<Api.Types.Organisasjon | null>(null);
  const [lagreFeilmelding, setLagreFeilmelding] = useState("");
  const [slettFeilmelding, setSlettFeilmelding] = useState("");
  const [orgnrFeilmelding, setOrgnrFeilmelding] = useState<Feilmelding | undefined>(undefined);
  const [renderedWithKontaktorgnrOnce, setRenderedWithKontaktorgnrOnce] = useState(false);

  const finnOrganisasjon = async (kontaktorgnr: string) => {
    if (!kontaktorgnr) return null;

    try {
      return await Api.Organisasjoner.hentOrganisasjon(kontaktorgnr);
    } catch (e) {
      return null;
    }
  };

  const finnOgVisOrganisasjon = async (kontaktorgnr: string) => {
    const org = await finnOrganisasjon(kontaktorgnr);

    if (org) setSokeResultat(org);
    else setOrgnrFeilmelding({ feilmelding: "Kunne ikke finne organisasjon" });

    return org;
  };

  const validerOrgnr = (kontaktorgnr: string) => {
    if (!Utils.organisasjon.erOrgnrGyldig(kontaktorgnr)) {
      setOrgnrFeilmelding({ feilmelding: "Ugyldig orgnr" });
      return false;
    }
    return true;
  };

  const validerOgFinnOrganisasjon = () => {
    const { kontaktorgnr } = kontaktopplysninger;

    if (kontaktorgnr && validerOrgnr(kontaktorgnr)) {
      finnOgVisOrganisasjon(kontaktorgnr);
    }
  };

  useEffect(() => {
    if (kontaktopplysninger.kontaktorgnr && !renderedWithKontaktorgnrOnce) {
      validerOgFinnOrganisasjon();
      setRenderedWithKontaktorgnrOnce(true);
    }
  }, [kontaktopplysninger.kontaktorgnr]);

  const kontaktOrgnrChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange({ ...kontaktopplysninger, kontaktorgnr: e.target.value });
    setSokeResultat(null);
    setOrgnrFeilmelding(undefined);
  };

  const kontaktNavnChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange({ ...kontaktopplysninger, kontaktnavn: e.target.value });
  };

  const kontaktNavnBlurHandler: FocusEventHandler<HTMLInputElement> = async (event) => {
    setLagreFeilmelding("");

    try {
      await onInputBlur(event);
    } catch (error) {
      setLagreFeilmelding(error.message);
    }
  };

  const kontaktorgnrBlurHandler: FocusEventHandler<HTMLInputElement> = async (event) => {
    setLagreFeilmelding("");

    validerOgFinnOrganisasjon();

    try {
      await onInputBlur(event);
    } catch (error) {
      setLagreFeilmelding(error.message);
    }
  };

  const slettKnappClickHandler: MouseEventHandler<HTMLButtonElement> = async (event) => {
    setSlettFeilmelding("");

    try {
      await onSlettKnappClick(event);
    } catch (error) {
      setSlettFeilmelding(error.message);
    }
  };

  return (
    <div className="kontaktopplysninger">
      <Nav.Fieldset legend="Kontaktopplysninger (valgfritt)">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Input
              disabled={!redigerbart}
              onChange={kontaktNavnChangeHandler}
              value={kontaktopplysninger.kontaktnavn || ""}
              onBlur={kontaktNavnBlurHandler}
              label="Kontaktperson"
              placeholder="Skriv inn..."
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Input
              disabled={!redigerbart}
              feil={orgnrFeilmelding}
              onChange={kontaktOrgnrChangeHandler}
              onBlur={kontaktorgnrBlurHandler}
              value={kontaktopplysninger.kontaktorgnr || ""}
              label="Organisasjonsnummer"
              placeholder="Skriv inn..."
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      <div role="alert">{lagreFeilmelding && <Nav.Typo.Feilmelding>{lagreFeilmelding}</Nav.Typo.Feilmelding>}</div>
      {sokeResultat && (
        <OrganisasjonsAdresse visTittel={false} className="kontaktopplysninger__adresse" organisasjon={sokeResultat} />
      )}
      <Mui.Knapp
        className="kontaktopplysninger__slett-knapp"
        disabled={!redigerbart}
        mini
        onClick={slettKnappClickHandler}
      >
        Slett kontaktopplysninger
      </Mui.Knapp>
      <div role="alert" className="kontaktopplysninger__slett-feilmelding">
        {slettFeilmelding && <Nav.Typo.Feilmelding>{slettFeilmelding}</Nav.Typo.Feilmelding>}
      </div>
    </div>
  );
};

export default KontaktOpplysninger;
