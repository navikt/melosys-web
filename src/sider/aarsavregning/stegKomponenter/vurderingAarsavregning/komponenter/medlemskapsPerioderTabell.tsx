import { Avgiftspliktigperiode, harInnvilgelsesResultat } from "../../../../../services/modules/types/periodeTyper";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import MKV from "../../../../../melosyskodeverk";

const { PLIKTIG, FRIVILLIG, UNNTATT, DELVIS_UNNTATT } = MKV.Koder.medlemskapstyper;

const bestemmelseKoder: string[] = [
  ...Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser),
  ...Object.values(MKV.KTObjects.vertslandsavtale_bestemmelser),
] as string[];

const mapMedlemskapstypeTekst = (kode: string) => {
  if (kode === PLIKTIG) {
    return "Pliktig";
  }
  if (kode === FRIVILLIG) {
    return "Frivillig";
  }
  if (kode === UNNTATT) {
    return "Unntatt";
  }
  if (kode === DELVIS_UNNTATT) {
    return "Delvis unntatt";
  }
  return "";
};

function MedlemskapsPerioderTabell({ perioder }: { perioder?: Avgiftspliktigperiode[] }) {
  if (!perioder) return null;

  const sortertePerioder = [...perioder].sort(Utils.dato.sorterEtterISOFomDato);

  return (
    <Nav.Table size="small" className="periode_tabell">
      <Nav.Table.Header className="header_row">
        <Nav.Table.Row>
          <Nav.Table.HeaderCell scope="col">Medlemskap</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Type</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Bestemmelse</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Dekning</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {sortertePerioder.map((medlemskapsPeriode) => {
          const hasMedlemskapstype = harInnvilgelsesResultat(medlemskapsPeriode);
          return (
            <Nav.Table.Row className="border_top" key={Utils._uuid()}>
              <Nav.Table.DataCell>
                {`${Utils.dato.formatterDatoTilNorsk(medlemskapsPeriode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
                  medlemskapsPeriode.tomDato,
                )}`}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell>
                {hasMedlemskapstype ? mapMedlemskapstypeTekst(medlemskapsPeriode.medlemskapstype) : "-"}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell>
                {hasMedlemskapstype ? KV.kodeTilTerm(medlemskapsPeriode.bestemmelse, bestemmelseKoder) : "-"}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell>
                {hasMedlemskapstype
                  ? KV.kodeTilTerm(medlemskapsPeriode.trygdedekning, MKV.KTObjects.trygdedekninger)
                  : "-"}
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          );
        })}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

export default MedlemskapsPerioderTabell;
