import { FysiskDokument } from "Domene";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";

interface VedleggRowProps {
  vedlegg: FysiskDokument;
  slettVedlegg: () => void;
}

const VedleggRow = ({ vedlegg, slettVedlegg }: VedleggRowProps) => {
  return (
    <tr className="vedlegg">
      <td>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </td>
      <td>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </td>
      <td className="icon--cell">
        <Mui.IkonKnapp ariaLabel="Fjern vedlegg" ikon={Ikoner.Bin} onClick={slettVedlegg} />
      </td>
    </tr>
  );
};

export default VedleggRow;
