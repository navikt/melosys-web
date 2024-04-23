import { useEffect } from "react";
import * as Mui from "../../../../felleskomponenter/ui";

import Bestemmelser from "./bestemmelser";
import { Vilkaar } from "../../../../services/modules/vilkar";
import * as Nav from "../../../../navFrontend";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../featuretoggle/toggleNavn";
import MKV from "../../../../melosyskodeverk";

interface VurderingArtikkel12_xProps {
  bekreftOgFortsett: () => void;
  tilstand: {
    harAvklaring: boolean;
    art12_x: Partial<Vilkaar>;
    art16_1: Partial<Vilkaar>;
    artikkelNavn: "12.1" | "12.2";
  };
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  tilbake: () => void;
  redigerbart: boolean;
}

const VurderingArtikkel12_x = ({
  bekreftOgFortsett,
  tilstand: { art12_x, art16_1, harAvklaring, artikkelNavn },
  redigerbart,
  oppdaterData,
  slettData,
  tilbake,
}: VurderingArtikkel12_xProps) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const er12_1 = artikkelNavn === "12.1";

  useEffect(
    () =>
      function cleanup() {
        slettData();
      },
    []
  );

  return (
    <div>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        {konvensjonStorbritanniaToggleEnabled
          ? "Fyller søker kriteriene for for utsendingsbestemmelsen?"
          : `Fyller søker kriteriene for artikkel ${artikkelNavn}?`}
      </Nav.Typo.Innholdstittel>
      <Bestemmelser
        oppdaterData={oppdaterData}
        slettData={slettData}
        redigerbart={redigerbart}
        vilkaar12={art12_x}
        vilkaarNavn12={artikkelNavn}
        vilkaarKode12={er12_1 ? "art12_1" : "art12_2"}
        begrunnelser12={
          er12_1 ? MKV.KTObjects.begrunnelser.art12_1_begrunnelser : MKV.KTObjects.begrunnelser.art12_2_begrunnelser
        }
        vilkaar16={art16_1}
      />
      <Mui.StegKnapper
        bekreftKnappProps={{ disabled: !(redigerbart && harAvklaring), onClick: bekreftOgFortsett }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};

export default VurderingArtikkel12_x;
