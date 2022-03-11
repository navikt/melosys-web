import React from "react";
import { DokumentOversikt, Mottaksretning } from "Domene";

import MKV from "../../melosyskodeverk";

import PdfLink from "../pdfLink";
import { formatterDatoTilNorsk } from "../../utils/dato";
import * as Ikoner from "../../resources/images";

import "./sideDialogDokumenter.css";
import { hentDato } from "../../ducks/dokumenter/selectors";

const uuid = require("uuid/v4");

interface MottaksretningIkonProps {
  mottaksretning: Mottaksretning;
}

const MottaksretningIkon = ({ mottaksretning }: MottaksretningIkonProps) => {
  const { kode } = mottaksretning;

  switch (kode) {
    case MKV.Koder.mottaksretning.INN:
      return <Ikoner.InnBrev />;
    case MKV.Koder.mottaksretning.UT:
      return <Ikoner.Svar />;
    default:
      return <Ikoner.Svar />;
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
  <tr>
    <td>
      <MottaksretningIkon mottaksretning={mottaksretning} />
    </td>
    <td>
      <span>
        <PdfLink journalpostID={journalpostID} dokumentID={hoveddokument.dokumentID} tittel={hoveddokument.tittel} />
        {hoveddokument.logiskeVedlegg.map((logiskVedlegg) => (
          <VedleggLink key={uuid()} journalpostID={journalpostID} dokument={{ tittel: logiskVedlegg }} />
        ))}
        {vedlegg.map((vedleggDokument) => (
          <VedleggLink key={uuid()} journalpostID={journalpostID} dokument={vedleggDokument} />
        ))}
      </span>
    </td>
    <td>{avsenderEllerMottaker}</td>
    <td>{formatterDatoTilNorsk(hentDato(mottaksretning, mottattDato, journalforingDato))}</td>
  </tr>
);
interface SideDialogDokumenterProps {
  dokumentOversikt: DokumentOversikt[];
}

const SideDialogDokumenter = ({ dokumentOversikt }: SideDialogDokumenterProps) => (
  <div className="sideDialogDokumenter">
    <table width="100%" className="dokumentTabell" aria-label="Liste over dokumenter knyttet til saken">
      <thead>
        <tr>
          <th aria-label="Mottaksretning" />
          <th>Dokument</th>
          <th>Avsender/mottaker</th>
          <th>Dato</th>
        </tr>
      </thead>
      <tbody>
        {dokumentOversikt.map((oversikt) => (
          <OversiktRad key={uuid()} dokumentOversikt={oversikt} />
        ))}
      </tbody>
    </table>
  </div>
);

export default SideDialogDokumenter;
