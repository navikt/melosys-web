import { useState } from "react";
import { FysiskDokument } from "Domene";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";

import "./vedleggVelger.css";
import VedleggVelgerModal from "./vedleggVelgerModal";

interface VedleggVelgerProps {
  dokumenter: FysiskDokument[];
  valgteVedlegg: FysiskDokument[];
  onChange: (valgteVedlegg: FysiskDokument[]) => void;
}

const VedleggVelger = ({ dokumenter, valgteVedlegg, onChange }: VedleggVelgerProps) => {
  const [redigerer, setRedigerer] = useState<boolean>(false);

  const toggleRedigerer = () => setRedigerer(!redigerer);
  const leggTilVedlegg = (vedlegg: FysiskDokument) => {
    onChange([...valgteVedlegg, vedlegg]);
  };

  const slettVedlegg = (vedleggID: string) => {
    onChange(valgteVedlegg.filter(({ id }) => id !== vedleggID));
  };

  return (
    <>
      <Mui.Lenkeknapp className="vedleggvelger" onClick={toggleRedigerer} ikon={Ikoner.Add}>
        Legg til vedlegg
      </Mui.Lenkeknapp>
      {redigerer && (
        <VedleggVelgerModal
          contentLabel="Dokumenter tilknyttet saken"
          onRequestClose={toggleRedigerer}
          alleVedlegg={dokumenter}
          valgteVedlegg={valgteVedlegg}
          leggTilVedlegg={leggTilVedlegg}
          slettVedlegg={slettVedlegg}
        />
      )}
    </>
  );
};

export default VedleggVelger;
