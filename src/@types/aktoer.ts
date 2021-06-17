/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
type Aktoer = {
  databaseID: number;
  aktoerID: string | null;
  institusjonsID: string | null;
  orgnr: string | null;
  rolleKode: string;
  utenlandskPersonID: string | null;
  representererKode: string | null;
};

export default Aktoer;
