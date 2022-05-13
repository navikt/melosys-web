import { apolloClient, Personopplysninger } from "../index";
import { HentBostedsadresseForPersonDocument } from "./hentBostedsadresseForPerson.generated";

export const hentBostedsadresseForPerson = async (ident: string): Promise<Personopplysninger> => {
  return apolloClient
    .query({ query: HentBostedsadresseForPersonDocument, variables: { ident } })
    .then((response) => {
      return response?.data?.hentPersonopplysninger;
    })
    .catch(() => {
      return null;
    });
};
