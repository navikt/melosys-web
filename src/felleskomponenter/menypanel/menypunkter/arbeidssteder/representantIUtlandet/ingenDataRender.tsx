import React from "react";
import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";

interface IngenDataRenderProps {
  redigerbart: boolean;
  onClick: () => void;
  lenketekst: string;
}

const IngenDataRender = ({ redigerbart, onClick, lenketekst }: IngenDataRenderProps) => (
  <>
    {redigerbart && (
      <Mui.Knappelenke onClick={onClick} ikon={Ikoner.Add}>
        {lenketekst}
      </Mui.Knappelenke>
    )}
  </>
);

export default IngenDataRender;
