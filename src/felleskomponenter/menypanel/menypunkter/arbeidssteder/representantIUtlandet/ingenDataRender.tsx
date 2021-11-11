import React from "react";
import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";

interface IngenDataRenderProps {
  redigerbart: boolean;
  apneRedigering: () => void;
  initialize: () => void;
}

const IngenDataRender = ({ redigerbart, apneRedigering, initialize }: IngenDataRenderProps) => (
  <>
    {redigerbart && (
      <Mui.Knappelenke
        onClick={async () => {
          await initialize();
          apneRedigering();
        }}
        ikon={Ikoner.Add}
      >
        Legg til representant i utlandet
      </Mui.Knappelenke>
    )}
  </>
);

export default IngenDataRender;
