import * as Api from "../../../../services/api";

const finnKontaktopplysninger = async (
  saksnummer: string,
  orgnr: string
): Promise<Api.Fagsaker.kontaktopplysninger.HentKontaktopplysningerResponse> => {
  try {
    const kontaktopplysninger = await Api.Fagsaker.kontaktopplysninger.hent(saksnummer, orgnr);
    return kontaktopplysninger;
  } catch (e) {
    return {
      kontaktnavn: null,
      kontaktorgnr: null,
      kontakttelefon: null,
    };
  }
};

export default finnKontaktopplysninger;
