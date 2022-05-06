import { useHentKontaktadresseQuery } from "./hentKontaktadresse.generated";

export type { HentKontaktadresseQuery } from "./hentKontaktadresse.generated";

export const useValiderHarBrukerRegistrertAdresse = (behandlingID: number) => {
  const { error, data } = useHentKontaktadresseQuery({ variables: { behandlingID } });
  if (error) {
    return "Kunne ikke hente registrert adresse";
  }
  if (
    !data ||
    data.hentSaksopplysninger.persondata.kontaktadresser.filter((kontaktadresse) => !kontaktadresse.erHistorisk)
      .length === 0
  ) {
    return "Bruker har ingen registrert adresse.";
  }
  return null;
};
