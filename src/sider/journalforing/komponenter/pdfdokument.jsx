import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import * as Api from "../../../services/api";
import { fetchAsPDFBlob } from "../../../services/utils";

import "./pdfdokument.css";

function PDFDokument({ journalpostID, dokumentID }) {
  const [pdfDokumentBlob, setPdfDokumentBlob] = useState(null);

  const fetchPDFBlob = useCallback(async () => {
    try {
      const result = await fetchAsPDFBlob(Api.Dokumenter.pdf.uriPath(journalpostID, dokumentID));
      const blobUrl = `${URL.createObjectURL(result)}`;
      setPdfDokumentBlob(blobUrl);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching PDF blob:", error);
    }
  }, [journalpostID, dokumentID]);

  useEffect(() => {
    fetchPDFBlob();
  }, [fetchPDFBlob]);

  return (
    <div id="row" className="pdfdokument">
      <div className="pdfviser">
        <iframe
          title="Dokument"
          className="dokument__pdfwrapper"
          src={`${pdfDokumentBlob}`}
          type="application/pdf"
          width="100%"
          height="100%" // You can adjust the height as needed
        />
      </div>
    </div>
  );
}

PDFDokument.propTypes = {
  journalpostID: PropTypes.string.isRequired,
  dokumentID: PropTypes.string.isRequired,
};

export default PDFDokument;
