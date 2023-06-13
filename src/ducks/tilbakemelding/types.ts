export const OPPDATER_TILBAKEMELDING = "tilbakemelding/OPPDATER_TILBAKEMELDING";

export interface Data {
  synlig: boolean;
  tekst: string;
}

export type Action = {
  type: typeof OPPDATER_TILBAKEMELDING;
  data: Data;
};
