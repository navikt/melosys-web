import { API_BASE_URL, PERSONER } from "../api-constants";

import { cachedGetAsJson } from "../utils";

import { Person } from "./types";

export const hentPerson = (fnrdnr: string): Promise<Person> => cachedGetAsJson(`${API_BASE_URL}${PERSONER}/${fnrdnr}`);
