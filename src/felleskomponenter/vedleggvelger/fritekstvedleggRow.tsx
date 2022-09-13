import React from "react";
import classNames from "classnames";

import * as Nav from "../../navFrontend";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";
import { Fritekstvedlegg } from "../sideDialog/sendBrev/sendBrev";
import { apnePdfINyFane } from "../../services/utils";

interface FritekstvedleggRowProps {
  fritekstvedlegg: Fritekstvedlegg;
  redigerFritekstvedlegg?: (index: number) => void;
  slettFritekstvedlegg?: (index: number) => void;
  index: number;
  lagPdfUrl?: (index: number) => Promise<string | false>;
}

export const FritekstvedleggRow = ({
  fritekstvedlegg,
  redigerFritekstvedlegg,
  slettFritekstvedlegg,
  index,
  lagPdfUrl,
}: FritekstvedleggRowProps) => {
  const cls = classNames("enkeltvedlegg");

  const aapnePdf = async () => {
    const url = lagPdfUrl ? await lagPdfUrl(index) : null;
    if (url) {
      apnePdfINyFane(url);
    }
  };

  return (
    <tr className={cls}>
      <td>
        <Nav.Lenker href="#" onClick={aapnePdf}>
          {fritekstvedlegg.tittel}
        </Nav.Lenker>
      </td>
      <td />
      <td className="icon--cell">
        <Mui.Knapp
          type="flat"
          ikon={Ikoner.BlyantBlack}
          onClick={() => redigerFritekstvedlegg && redigerFritekstvedlegg(index)}
        />
        <Mui.Knapp
          type="flat"
          ikon={Ikoner.BinBlack}
          onClick={() => slettFritekstvedlegg && slettFritekstvedlegg(index)}
        />
      </td>
    </tr>
  );
};
