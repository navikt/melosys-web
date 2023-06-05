import React, { useState } from "react";

import * as Nav from "../../navFrontend";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";
import { Fritekstvedlegg } from "../sideDialog/sendBrev/sendBrev";
import { apnePdfINyFane } from "../../services/utils";
import SlettFritekstvedleggModal from "./slettFritekstvedleggModal";

interface FritekstvedleggRowProps {
  fritekstvedlegg: Fritekstvedlegg;
  redigerFritekstvedlegg?: (index: number) => void;
  slettFritekstvedlegg?: (index: number) => void;
  index: number;
  lagFritekstPdfUrl?: (index: number) => Promise<string | false>;
}

const FritekstvedleggRow = ({
  fritekstvedlegg,
  redigerFritekstvedlegg,
  slettFritekstvedlegg,
  index,
  lagFritekstPdfUrl,
}: FritekstvedleggRowProps) => {
  const [visBekreftelseModal, setVisBekreftelseModal] = useState<boolean>(false);

  const aapnePdf = async () => {
    const url = lagFritekstPdfUrl ? await lagFritekstPdfUrl(index) : null;
    if (url) {
      apnePdfINyFane(url);
    }
  };

  return (
    <tr className="vedlegg">
      <td>
        <Nav.Lenker href="#" onClick={aapnePdf}>
          {fritekstvedlegg.tittel}
        </Nav.Lenker>
      </td>
      <td />
      <td className="icon--cell">
        <Mui.IkonKnapp
          ikon={Ikoner.Pencil}
          onClick={() => redigerFritekstvedlegg && redigerFritekstvedlegg(index)}
          ariaLabel="Rediger vedlegg"
        />
        <Mui.IkonKnapp ikon={Ikoner.Bin} onClick={() => setVisBekreftelseModal(true)} ariaLabel="Slett vedlegg" />
      </td>
      {visBekreftelseModal ? (
        <SlettFritekstvedleggModal
          onRequestClose={() => setVisBekreftelseModal(false)}
          slettVedlegg={() => slettFritekstvedlegg && slettFritekstvedlegg(index)}
        />
      ) : null}
    </tr>
  );
};

export default FritekstvedleggRow;
