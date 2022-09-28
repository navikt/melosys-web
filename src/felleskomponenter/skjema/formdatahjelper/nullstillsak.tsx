export enum FormDataVerdi {
  sakstype = "sakstype",
  sakstema = "sakstema",
  behandlingstema = "opprettnysak_behandlingstema",
  behandlingstype = "opprettnysak_behandlingstype",
}

export const nullstillFormdataVerdier = (
  steg: FormDataVerdi,
  change: (feltNavn: string, verdi: string | null) => void
): void => {
  switch (steg) {
    case FormDataVerdi.sakstype:
      change(FormDataVerdi.sakstema, null);
      change(FormDataVerdi.behandlingstema, null);
      change(FormDataVerdi.behandlingstype, null);
      break;
    case FormDataVerdi.sakstema:
      change(FormDataVerdi.behandlingstema, null);
      change(FormDataVerdi.behandlingstype, null);
      break;
    case FormDataVerdi.behandlingstema:
      change(FormDataVerdi.behandlingstype, null);
      break;
    case FormDataVerdi.behandlingstype:
      break;
    default:
      break;
  }
};
