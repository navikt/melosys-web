import { useState } from "react";
import { FysiskDokument } from "Domene";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";

import "./vedleggVelger.css";
import VedleggVelgerModal from "./vedleggVelgerModal";
import * as DokumenterV2 from "../../services/modules/dokumenter-v2";

interface VedleggVelgerProps {
  dokumenter: FysiskDokument[];
  valgteVedlegg: DokumenterV2.BrevVedleggInterface;
  onChange: (valgteVedlegg: DokumenterV2.BrevVedleggInterface) => void;
  redigerbart: boolean;
  standardvedlegg: DokumenterV2.TilgjengeligeStandardvedleggResDto | undefined;
}

function VedleggVelger({ dokumenter, valgteVedlegg, onChange, redigerbart, standardvedlegg }: VedleggVelgerProps) {
  const [redigerer, setRedigerer] = useState<boolean>(false);

  const toggleRedigerer = () => setRedigerer(!redigerer);
  const leggTilVedlegg = (vedlegg: FysiskDokument) => {
    onChange({
      saksvedlegg: [...valgteVedlegg.saksvedlegg, vedlegg],
      standardvedlegg: valgteVedlegg.standardvedlegg,
    });
  };

  const slettVedlegg = (vedleggID: string) => {
    onChange({
      saksvedlegg: valgteVedlegg.saksvedlegg.filter(({ id }) => id !== vedleggID),
      standardvedlegg: valgteVedlegg.standardvedlegg,
    });
  };

  return (
    <>
      <Mui.Lenkeknapp className="vedleggvelger" onClick={toggleRedigerer} ikon={Ikoner.Add} disabled={!redigerbart}>
        Legg til vedlegg
      </Mui.Lenkeknapp>
      {redigerer && (
        <VedleggVelgerModal
          onRequestClose={toggleRedigerer}
          alleVedlegg={dokumenter}
          standardvedlegg={standardvedlegg}
          valgteVedlegg={valgteVedlegg}
          leggTilVedlegg={leggTilVedlegg}
          slettVedlegg={slettVedlegg}
        />
      )}
    </>
  );
}

export default VedleggVelger;
