import { getAsJson } from "../../utils";
import { API_BASE_URL, MEDLEMSKAPSPERIODER } from "../../api-constants";

export const hentTrygdedekninger = (bestemmelse: string) =>
  getAsJson(`${API_BASE_URL}${MEDLEMSKAPSPERIODER}/trygdedekning/lovlige-kombinasjoner?bestemmelse=${bestemmelse}`);
