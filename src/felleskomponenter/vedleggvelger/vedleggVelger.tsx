import { useState } from "react";
import { FysiskDokument } from "Domene";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";

import "./vedleggVelger.less";
import VedleggVelgerModal from "./vedleggVelgerModal";
import * as DokumenterV2 from "../../services/modules/dokumenter-v2";
import { TilgjengeligStandardvedlegg } from "../../services/modules/dokumenter-v2";

interface VedleggVelgerProps {
  dokumenter: FysiskDokument[];
  valgteVedlegg: DokumenterV2.BrevVedleggInterface;
  onChange: (valgteVedlegg: DokumenterV2.BrevVedleggVisningstabellInterface) => void;
  redigerbart: boolean;
  standardvedlegg: DokumenterV2.TilgjengeligStandardvedlegg[];
  onOpen?: () => void;
}

function VedleggVelger({
  dokumenter,
  valgteVedlegg,
  onChange,
  redigerbart,
  standardvedlegg,
  onOpen,
}: VedleggVelgerProps) {
  const [redigerer, setRedigerer] = useState<boolean>(false);

  const toggleRedigerer = () => {
    if (!redigerer && onOpen) {
      onOpen();
    }
    setRedigerer(!redigerer);
  };

  const velgStandardvedlegg = (vedlegg: TilgjengeligStandardvedlegg) => {
    onChange({
      saksvedlegg: valgteVedlegg.saksvedlegg,
      standardvedlegg: [vedlegg],
    });
  };

  const leggTilSaksvedlegg = (vedlegg: FysiskDokument) => {
    onChange({
      saksvedlegg: [...valgteVedlegg.saksvedlegg, vedlegg],
      standardvedlegg: valgteVedlegg.standardvedlegg ? [valgteVedlegg.standardvedlegg] : [],
    });
  };

  const slettSaksvedlegg = (vedlegg: FysiskDokument) => {
    onChange({
      saksvedlegg: valgteVedlegg.saksvedlegg.filter(({ id }) => id !== vedlegg.id),
      standardvedlegg: valgteVedlegg.standardvedlegg ? [valgteVedlegg.standardvedlegg] : [],
    });
  };

  const slettStandardvedlegg = () => {
    onChange({
      saksvedlegg: valgteVedlegg.saksvedlegg,
      standardvedlegg: [],
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
          alleSaksvedlegg={dokumenter}
          standardvedlegg={standardvedlegg}
          valgteVedlegg={valgteVedlegg}
          leggTilSaksvedlegg={leggTilSaksvedlegg}
          velgStandardvedlegg={velgStandardvedlegg}
          slettSaksvedlegg={slettSaksvedlegg}
          slettStandardvedlegg={slettStandardvedlegg}
        />
      )}
    </>
  );
}

export default VedleggVelger;
