import React, { FocusEventHandler, MouseEventHandler, ChangeEventHandler, useState, useEffect } from 'react';
import { Organisasjon } from 'Domene';

import * as Nav from '../../../../utils/navFrontend';
import * as Mui from '../../../ui';
import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';
import * as Types from './types';

import OrganisasjonsAdresse from '../../../adresser/organisasjonsAdresse';

import './kontaktopplysninger.css';

export interface Feilmelding {
  feilmelding: string,
}

interface KontaktOpplysningerProps {
  onChange: (kontaktopplysning: Types.KontaktOpplysning) => void,
  kontaktopplysninger: Types.KontaktOpplysning,
  redigerbart: boolean,
  onKontaktnavnInputBlur: FocusEventHandler<HTMLInputElement>,
  onKontaktorgnrInputBlur: FocusEventHandler<HTMLInputElement>,
  onSlettKnappClick: MouseEventHandler<HTMLButtonElement>,
}

export const KontaktOpplysninger = ({
  onChange,
  kontaktopplysninger,
  redigerbart,
  onKontaktnavnInputBlur,
  onKontaktorgnrInputBlur,
  onSlettKnappClick,
}: KontaktOpplysningerProps) => {
  const [sokeResultat, setSokeResultat] = useState<Organisasjon | null>(null);
  const [orgnrFeilmelding, setOrgnrFeilmelding] = useState<Feilmelding | undefined>(undefined);
  const [renderedWithKontaktorgnrOnce, setRenderedWithKontaktorgnrOnce] = useState(false);

  const finnOrganisasjon = async (kontaktorgnr: string) => {
    if (!kontaktorgnr) return null;

    try {
      return await Api.Organisasjoner.hentOrganisasjon(kontaktorgnr);
    } catch (e) {
      Utils.logger.error(e);
      return null;
    }
  };

  const finnOgVisOrganisasjon = async (kontaktorgnr: string) => {
    const org = await finnOrganisasjon(kontaktorgnr);

    if (org) setSokeResultat(org);
    else setOrgnrFeilmelding({ feilmelding: 'Kunne ikke finne organisasjon' });

    return org;
  };

  const validerOrgnr = (kontaktorgnr: string) => {
    if (!Utils.organisasjon.erOrgnrGyldig(kontaktorgnr)) {
      setOrgnrFeilmelding({ feilmelding: 'Ugyldig orgnr' });
      return false;
    }
    return true;
  };

  const validerOgFinnOrganisasjon = () => {
    const { kontaktorgnr } = kontaktopplysninger;

    if (kontaktorgnr &&
      validerOrgnr(kontaktorgnr)) {
      finnOgVisOrganisasjon(kontaktorgnr);
    }
  };

  useEffect(() => {
    if (kontaktopplysninger.kontaktorgnr && !renderedWithKontaktorgnrOnce) {
      validerOgFinnOrganisasjon();
      setRenderedWithKontaktorgnrOnce(true);
    }
  }, [kontaktopplysninger.kontaktorgnr]);

  const kontaktOrgnrChangeHandler: ChangeEventHandler<HTMLInputElement> = e => {
    onChange({ ...kontaktopplysninger, kontaktorgnr: e.target.value });
    setSokeResultat(null);
    setOrgnrFeilmelding(undefined);
  };

  const kontaktNavnChangeHandler: ChangeEventHandler<HTMLInputElement> = e => {
    onChange({ ...kontaktopplysninger, kontaktnavn: e.target.value });
  };

  const kontaktorgnrBlurHandler: FocusEventHandler<HTMLInputElement> = e => {
    validerOgFinnOrganisasjon();

    onKontaktorgnrInputBlur(e);
  };

  return (
    <div className="kontaktopplysninger">
      <Nav.Fieldset legend="Kontaktopplysninger (valgfritt)">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Input
              disabled={!redigerbart}
              onChange={kontaktNavnChangeHandler}
              value={kontaktopplysninger.kontaktnavn || ''}
              onBlur={onKontaktnavnInputBlur}
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
              value={kontaktopplysninger.kontaktorgnr || ''}
              label="Organisasjonsnummer"
              placeholder="Skriv inn..."
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      {
        sokeResultat && <OrganisasjonsAdresse visTittel={false} className="adresse" organisasjon={sokeResultat} />
      }
      <Mui.Knapp
        className="slett__knapp"
        capitalCase
        disabled={!redigerbart}
        mini
        onClick={onSlettKnappClick}
      >
        Slett kontaktopplysninger
      </Mui.Knapp>
    </div>
  );
};

export default KontaktOpplysninger;
