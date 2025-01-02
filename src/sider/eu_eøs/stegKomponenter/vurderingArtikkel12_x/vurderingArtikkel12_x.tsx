import { useEffect } from "react";
import * as Mui from "../../../../felleskomponenter/ui";
import Bestemmelser from "./bestemmelser";
import * as Nav from "../../../../navFrontend";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import { useSelector } from "react-redux";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";

import "./vurderingArtikkel12_x.css";

interface VurderingArtikkel12_xProps {
  bekreftOgFortsett: () => void;
  tilstand: {
    harAvklaring: boolean;
    artikkelNavn: "12.1" | "12.2";
  };
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  tilbake: () => void;
  redigerbart: boolean;
}

const VurderingArtikkel12_x = ({
  bekreftOgFortsett,
  tilstand: { harAvklaring, artikkelNavn },
  redigerbart,
  oppdaterData,
  slettData,
  tilbake,
}: VurderingArtikkel12_xProps) => {
  const erVurderingArbeidstaker = artikkelNavn === "12.1";
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandSelector);
  const visStorbritanniaKonvensjon = MKVUtils.enesteLandErStorbritannia(arbeidsland);

  useEffect(
    () =>
      function cleanup() {
        slettData();
      },
    []
  );

  return (
    <div className="vurderingArtikkel12_x">
      <Nav.Heading level="1" className="stegvelgertittel">
        Vurdering {erVurderingArbeidstaker ? "arbeidstaker" : "næringsdrivende"}
      </Nav.Heading>
      <Bestemmelser
        oppdaterData={oppdaterData}
        slettData={slettData}
        redigerbart={redigerbart}
        visStorbritanniaKonvensjon={visStorbritanniaKonvensjon}
        vilkaarNavn12={artikkelNavn}
        begrunnelserUtsending={
          erVurderingArbeidstaker
            ? MKV.KTObjects.begrunnelser.utsendt_arbeidstaker_begrunnelser
            : MKV.KTObjects.begrunnelser.utsendt_naeringsdrivende_begrunnelser
        }
      />
      <Mui.StegKnapper
        bekreftKnappProps={{ disabled: !(redigerbart && harAvklaring), onClick: bekreftOgFortsett }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};

export default VurderingArtikkel12_x;
