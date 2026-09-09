import { MouseEvent, useState } from "react";

import * as Nav from "../../navFrontend";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";
import { apnePdfINyFane } from "../../services/utils";
import SlettFritekstvedleggModal from "./slettFritekstvedleggModal";
import { Fritekstvedlegg } from "../sideDialog/sendBrev/brevVedlegg/brevVedlegg";
import "./vedleggRow.less";

interface FritekstvedleggRowProps {
  fritekstvedlegg: Fritekstvedlegg;
  redigerFritekstvedlegg?: (index: number) => void;
  slettFritekstvedlegg?: (index: number) => void;
  index: number;
  lagFritekstPdfUrl?: (index: number) => Promise<string | false>;
  redigerbart: boolean;
}

function FritekstvedleggRow({
  fritekstvedlegg,
  redigerFritekstvedlegg,
  slettFritekstvedlegg,
  index,
  lagFritekstPdfUrl,
  redigerbart,
}: FritekstvedleggRowProps) {
  const [visBekreftelseModal, setVisBekreftelseModal] = useState<boolean>(false);

  const aapnePdf = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const url = lagFritekstPdfUrl ? await lagFritekstPdfUrl(index) : null;
    if (url) {
      apnePdfINyFane(url, fritekstvedlegg.tittel);
    }
  };

  return (
    <Nav.Table.Row className="vedlegg-row">
      <Nav.Table.DataCell>
        <Ikoner.Binders className="document-icon" />
        <Nav.Link href="#" title="Åpnes i ny fane" aria-label="Åpnes i ny fane" onClick={aapnePdf}>
          {fritekstvedlegg.tittel}
          <Ikoner.ExternalLink />
        </Nav.Link>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell />
      <Nav.Table.DataCell className="icon__cell">
        <Mui.IkonKnapp
          ikon={Ikoner.Pencil}
          onClick={() => redigerFritekstvedlegg && redigerFritekstvedlegg(index)}
          ariaLabel="Rediger vedlegg"
          disabled={!redigerbart}
        />
        <Mui.IkonKnapp
          ikon={Ikoner.Bin}
          onClick={() => setVisBekreftelseModal(true)}
          ariaLabel="Slett vedlegg"
          disabled={!redigerbart}
        />
      </Nav.Table.DataCell>
      <SlettFritekstvedleggModal
        open={visBekreftelseModal}
        lukkModal={() => setVisBekreftelseModal(false)}
        slettVedlegg={() => slettFritekstvedlegg && slettFritekstvedlegg(index)}
      />
    </Nav.Table.Row>
  );
}

export default FritekstvedleggRow;
