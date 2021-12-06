import { useHentPersonstatusQuery } from "./hentPersonstatus.generated";

type PersonstatusProps = {
  kode: string;
  tekst: string;
  master: string;
  kilde?: string | null;
  fregGyldighetstidspunkt?: string | null;
  erHistorisk: boolean;
}[];

const hentPersonstatus = (behandlingID: number): PersonstatusProps => {
  const { data, error } = useHentPersonstatusQuery({ variables: { behandlingID } });

  const person = data?.hentSaksopplysninger.persondata;
  if (error || !person) return [];

  return person.folkeregisterpersonstatuser;
};

export default hentPersonstatus;
