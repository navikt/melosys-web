import React, { useState } from "react";
import classNames from "classnames";
import { FysiskDokument } from "Domene";

import * as Nav from "../../navFrontend";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";

import "./vedleggVelger.css";
import { VedleggTable } from "./vedleggTable";
import VedleggVelgerModal from "./vedleggVelgerModal";

interface VedleggVelgerProps {
  dokumenter: FysiskDokument[];
  valgteVedlegg: FysiskDokument[];
  onChange: (valgteVedlegg: FysiskDokument[]) => void;
  className?: string;
}

const VedleggVelger = ({ dokumenter, valgteVedlegg, onChange, className }: VedleggVelgerProps) => {
  const [redigerer, setRedigerer] = useState<boolean>(false);

  const toggleRedigerer = () => setRedigerer(!redigerer);
  const leggTilVedlegg = (vedlegg: FysiskDokument) => {
    onChange([...valgteVedlegg, vedlegg]);
  };

  const slettVedlegg = (vedleggID: string) => {
    onChange(valgteVedlegg.filter(({ id }) => id !== vedleggID));
  };

  const harValgteVedlegg = valgteVedlegg && valgteVedlegg.length > 0;

  const cls = classNames(className, "vedleggvelger");

  return (
    <Nav.Row className={cls}>
      {harValgteVedlegg && (
        <VedleggTable
          redigerer={false}
          slettVedlegg={slettVedlegg}
          valgteVedlegg={valgteVedlegg}
          alleVedlegg={dokumenter}
          leggTilVedlegg={leggTilVedlegg}
        />
      )}
      <Mui.Lenkeknapp onClick={toggleRedigerer} ikon={Ikoner.Add}>
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
    </Nav.Row>
  );
};

export default VedleggVelger;
