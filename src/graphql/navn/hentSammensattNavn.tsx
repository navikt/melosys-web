import { apolloClient } from "../index";
import { HentNavnDocument } from "./hentnavn.generated";
import * as Utils from "../../utils";

export const hentSammensattNavn = async (ident: string): Promise<string> => {
  return apolloClient
    .query({ query: HentNavnDocument, variables: { ident } })
    .then((response) => {
      return response?.data?.hentPersonopplysninger?.navn
        ? Utils.person.tilSammensattNavnFraObjekt(response.data.hentPersonopplysninger.navn)
        : "";
    })
    .catch(() => {
      return "";
    });
};
