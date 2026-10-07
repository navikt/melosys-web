import { apolloClient } from "../index";
import {
  HentBostedsadresseForPersonDocument,
  HentBostedsadresseForPersonQuery,
  HentBostedsadresseForPersonQueryVariables,
} from "./hentBostedsadresseForPerson.generated";

export const hentBostedsadresseForPerson = async (
  ident: string,
): Promise<HentBostedsadresseForPersonQuery["hentPersonopplysninger"] | null> => {
  return apolloClient
    .query<HentBostedsadresseForPersonQuery, HentBostedsadresseForPersonQueryVariables>({
      query: HentBostedsadresseForPersonDocument,
      variables: { ident },
    })
    .then((response) => {
      return response?.data?.hentPersonopplysninger ?? null;
    })
    .catch(() => {
      return null;
    });
};
