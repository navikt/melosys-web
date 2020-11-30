import { useState, useEffect, SetStateAction, Dispatch } from 'react';

import * as Api from '../../../../services/api';
import * as Utils from '../../../../utils';

import finnKontaktopplysninger from './finnKontaktopplysninger';
import { KontaktOpplysning } from './types';

const useKontaktopplysninger = (saksnummer: string, orgnr: string): [
  KontaktOpplysning,
  Dispatch<SetStateAction<KontaktOpplysning>>,
  () => void,
  () => Promise<boolean>,
] => {
  const [kontaktopplysninger, setKontaktopplysninger] = useState<KontaktOpplysning>({ kontaktorgnr: '', kontaktnavn: '' });

  useEffect(() => {
    if (!Utils.organisasjon.erOrgnrGyldig(orgnr)) return;

    finnKontaktopplysninger(saksnummer, orgnr)
      .then(({ kontaktnavn, kontaktorgnr }) => {
        setKontaktopplysninger({ kontaktnavn: kontaktnavn || undefined, kontaktorgnr: kontaktorgnr || undefined });
      });
  }, [orgnr]);

  const slettKontaktOpplysninger = async () => {
    try {
      await Api.Fagsaker.kontaktopplysninger.slett(saksnummer, orgnr);
      setKontaktopplysninger({});
    } catch (e) {
      if (e.status !== 404) {
        Utils.logger.error(e);
      }
    }
  };

  const lagreKontaktOpplysninger = async () => {
    if (kontaktopplysninger.kontaktorgnr && !Utils.organisasjon.erOrgnrGyldig(kontaktopplysninger.kontaktorgnr)) return false;

    const data = {
      kontaktorgnr: kontaktopplysninger.kontaktorgnr || null,
      kontaktnavn: kontaktopplysninger.kontaktnavn || null,
    };

    try {
      await Api.Fagsaker.kontaktopplysninger.send(saksnummer, orgnr, data);
      return true;
    } catch (e) {
      Utils.logger.error(e);
    }

    return false;
  };

  return [
    kontaktopplysninger,
    setKontaktopplysninger,
    slettKontaktOpplysninger,
    lagreKontaktOpplysninger,
  ];
};

export default useKontaktopplysninger;
