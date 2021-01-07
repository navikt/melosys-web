import { Person } from "Domene";
import { API_BASE_URL, PERSONER } from "../api-constants";

import { cachedGetAsJson } from "../utils";

// eslint-disable-next-line import/prefer-default-export
export const hentPerson = (fnrdnr: string): Promise<Person> => cachedGetAsJson(`${API_BASE_URL}${PERSONER}/${fnrdnr}`);
