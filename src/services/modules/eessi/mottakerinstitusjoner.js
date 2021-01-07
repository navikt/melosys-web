import { getAsJson } from "../../utils";
import { API_BASE_URL, EESSI } from "../../api-constants";

export const hent = (bucType, landkoder) =>
  getAsJson(
    `${API_BASE_URL}${EESSI}/mottakerinstitusjoner/${bucType}?landkoder=${landkoder ? landkoder.join(",") : ""}`
  );
