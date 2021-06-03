import { useState, useEffect, SetStateAction, Dispatch } from "react";

import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";

import finnKontaktopplysninger from "./finnKontaktopplysninger";
import { KontaktOpplysning } from "./types";

const useKontaktopplysninger = (
  saksnummer: string,
  orgnr: string
): [KontaktOpplysning, Dispatch<SetStateAction<KontaktOpplysning>>, () => Promise<void>, () => Promise<void>] => {
  const [kontaktopplysninger, setKontaktopplysninger] = useState<KontaktOpplysning>({
    kontaktorgnr: "",
    kontaktnavn: "",
  });

  useEffect(() => {
    if (!Utils.organisasjon.erOrgnrGyldig(orgnr)) return;

    finnKontaktopplysninger(saksnummer, orgnr).then(({ kontaktnavn, kontaktorgnr }) => {
      setKontaktopplysninger({ kontaktnavn: kontaktnavn || undefined, kontaktorgnr: kontaktorgnr || undefined });
    });
  }, [orgnr]);

  const slettKontaktOpplysninger = async () => {
    try {
      const res = await Api.Fagsaker.kontaktopplysninger.slett(saksnummer, orgnr);
      setKontaktopplysninger({});
      return res;
    } catch (e) {
      if (e.status >= 500) throw new Error("Teknisk feil ved sletting av kontaktopplysninger");
      else if (e.status >= 400) throw new Error(e.body.message);
      throw e;
    }
  };

  const lagreKontaktOpplysninger = async () => {
    if (kontaktopplysninger.kontaktorgnr && !Utils.organisasjon.erOrgnrGyldig(kontaktopplysninger.kontaktorgnr))
      return Promise.resolve();

    const data = {
      kontaktorgnr: kontaktopplysninger.kontaktorgnr || null,
      kontaktnavn: kontaktopplysninger.kontaktnavn || null,
    };

    try {
      return await Api.Fagsaker.kontaktopplysninger.send(saksnummer, orgnr, data);
    } catch (e) {
      if (e.status >= 500) throw new Error("Teknisk feil ved lagring av kontaktopplysninger");
      else if (e.status >= 400) throw new Error(e.body.message);
      throw e;
    }
  };

  return [kontaktopplysninger, setKontaktopplysninger, slettKontaktOpplysninger, lagreKontaktOpplysninger];
};

export default useKontaktopplysninger;
