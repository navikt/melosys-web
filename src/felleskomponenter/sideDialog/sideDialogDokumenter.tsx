import { useDispatch } from "react-redux";
import { DokumentOversikt, Mottaksretning } from "Domene";
import { change } from "redux-form";
import { v4 as uuid } from "uuid";

import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";
import * as KV from "../../kodeverk";
import * as Ikoner from "../../resources/images";
import * as Nav from "../../navFrontend";

import { hentDato } from "../../ducks/dokumenter/selectors";
import { formatterDatoTilNorsk } from "../../utils/dato";
import { useAsyncCallbackState } from "../../hooks";
import PdfLink from "../pdfLink";
import LagredeUtkast from "./sendBrev/brevutkast/lagredeUtkast";

import "./sideDialogDokumenter.css";
import { Table } from "@navikt/ds-react";

interface MottaksretningIkonProps {
  mottaksretning: Mottaksretning;
}

const MottaksretningIkon = ({ mottaksretning }: MottaksretningIkonProps) => {
  const { kode } = mottaksretning;

  switch (kode) {
    case MKV.Koder.mottaksretning.INN:
      return (
        <Nav.Tag variant="info" size="small">
          inn
        </Nav.Tag>
      );
    case MKV.Koder.mottaksretning.UT:
      return (
        <Nav.Tag variant="neutral" size="small">
          ut
        </Nav.Tag>
      );
    case MKV.Koder.mottaksretning.NOTAT:
      return <Nav.Tag variant="neutral">notat</Nav.Tag>;
    default:
      return <Nav.Tag variant="warning">ukjent</Nav.Tag>;
  }
};

interface VedleggLinkProps {
  journalpostID: string;
  dokument: { dokumentID?: string; tittel: string };
}

const VedleggLink = ({ journalpostID, dokument: { dokumentID, tittel } }: VedleggLinkProps) => (
  <div>
    <Ikoner.Binders />
    &nbsp;
    {dokumentID && <PdfLink journalpostID={journalpostID} dokumentID={dokumentID} tittel={tittel} />}
    {!dokumentID && <span>{tittel}</span>}
  </div>
);

interface OversiktradProps {
  dokumentOversikt: DokumentOversikt;
}

const OversiktRad = ({
  dokumentOversikt: {
    mottattDato,
    journalforingDato,
    mottaksretning,
    avsenderEllerMottaker,
    journalpostID,
    hoveddokument,
    vedlegg,
  },
}: OversiktradProps) => (
  <Table.Row>
    <Table.DataCell>
      <MottaksretningIkon mottaksretning={mottaksretning} />
    </Table.DataCell>
    <Table.DataCell>
      <span>
        <PdfLink journalpostID={journalpostID} dokumentID={hoveddokument.dokumentID} tittel={hoveddokument.tittel} />
        {hoveddokument.logiskeVedlegg.map((logiskVedlegg) => (
          <VedleggLink key={uuid()} journalpostID={journalpostID} dokument={{ tittel: logiskVedlegg }} />
        ))}
        {vedlegg.map((vedleggDokument) => (
          <VedleggLink key={uuid()} journalpostID={journalpostID} dokument={vedleggDokument} />
        ))}
      </span>
    </Table.DataCell>
    <Table.DataCell>{avsenderEllerMottaker}</Table.DataCell>
    <Table.DataCell>{formatterDatoTilNorsk(hentDato(mottaksretning, mottattDato, journalforingDato))}</Table.DataCell>
  </Table.Row>
);
interface SideDialogDokumenterProps {
  behandlingID: number;
  dokumentOversikt: DokumentOversikt[];
  setAktivTab: (fanenavn: string) => void;
}

const SideDialogDokumenter = ({ behandlingID, dokumentOversikt, setAktivTab }: SideDialogDokumenterProps) => {
  const [utkast] = useAsyncCallbackState(() => Api.Brevutkast.hentBrevutkast(behandlingID), [], []);
  const dispatch = useDispatch();
  const handleValgtUtkast = (valgtUtkast: Api.Brevutkast.BrevutkastResDto | null) => {
    dispatch(change(KV.Form.SEND_BREV, "aktivtUtkast", valgtUtkast));
    setAktivTab("brevbestilling");
  };
  return (
    <div className="sideDialogDokumenter">
      <LagredeUtkast alleUtkast={utkast} settAktivtUtkast={handleValgtUtkast} />
      <Table size="small" aria-label="Liste over dokumenter knyttet til saken">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell aria-label="Mottaksretning" />
            <Table.HeaderCell>Dokument</Table.HeaderCell>
            <Table.HeaderCell>Avsender/mottaker</Table.HeaderCell>
            <Table.HeaderCell>Dato</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {dokumentOversikt.map((oversikt) => (
            <OversiktRad key={uuid()} dokumentOversikt={oversikt} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default SideDialogDokumenter;
