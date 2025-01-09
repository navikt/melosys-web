import { getAsJson } from "../utils";
import { API_BASE_URL, LOVVALGSBESTEMMELSER } from "../api-constants";

export const getLovvalgsbestemmelser = (sakstype: string, sakstema: string, behandlingstema: string, land?: string) =>
  getAsJson(
    `${API_BASE_URL}${LOVVALGSBESTEMMELSER}?sakstype=${sakstype}&sakstema=${sakstema}&behandlingstema=${behandlingstema}&land=${land}`,
  );
