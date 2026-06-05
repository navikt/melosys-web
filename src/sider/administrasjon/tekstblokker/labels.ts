import { TekstblokkType } from "../../../services/modules/tekstblokker";

export const labelForType = (type: TekstblokkType): string => (type === "BREVMAL" ? "brevmal" : "tekstblokk");
