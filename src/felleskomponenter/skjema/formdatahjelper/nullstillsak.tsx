export enum SakFormData {
  sakstype = "sakstype",
  sakstema = "sakstema",
  behandlingstema = "behandlingstema",
  behandlingstype = "behandlingstype",
}

export const nullstillSak = (steg: SakFormData, change: (feltNavn: string, verdi: string | null) => void): void => {
  switch (steg) {
    case SakFormData.sakstype:
      change(SakFormData.sakstema, null);
      change(SakFormData.behandlingstema, null);
      change(SakFormData.behandlingstype, null);
      break;
    case SakFormData.sakstema:
      change(SakFormData.behandlingstema, null);
      change(SakFormData.behandlingstype, null);
      break;
    case SakFormData.behandlingstema:
      change(SakFormData.behandlingstype, null);
      break;
    case SakFormData.behandlingstype:
      break;
    default:
      break;
  }
};
