import { useEffect } from "react";
import * as Mui from "../../../../felleskomponenter/ui";
import Bestemmelser from "./bestemmelser";
import * as Nav from "../../../../navFrontend";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../featuretoggle/toggleNavn";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import { useSelector } from "react-redux";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";

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
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
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
