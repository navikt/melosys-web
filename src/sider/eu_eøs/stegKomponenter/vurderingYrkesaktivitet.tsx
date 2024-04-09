import { ChangeEvent, useEffect } from "react";

import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as Mui from "../../../felleskomponenter/ui";
import { konverterAvklartfaktaTilStegData, lagAvklartfakta } from "../../../felleskomponenter/stegvelger";
import { hentFaktaVerdi } from "../../../domeneUtils";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../featuretoggle/toggleNavn";

interface VurderingYrkesaktivitetProps {
  bekreftOgFortsett: () => void;
  tilbake: () => void;
  tilstand?: {
    skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende?: boolean;
    harAvklaring?: boolean;
    yrkesaktivitet?: any;
  };
  redigerbart: boolean;
  oppdaterData: (data: any) => void;
  slettData: () => void;
  erSoknadArbeidFlereLand: boolean;
}

const VurderingYrkesaktivitet = (props: VurderingYrkesaktivitetProps) => {
  const {
    bekreftOgFortsett,
    tilstand = {},
    redigerbart,
    oppdaterData,
    slettData,
    erSoknadArbeidFlereLand,
    tilbake,
  } = props;
  const { skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende, harAvklaring, yrkesaktivitet } = tilstand;
  const konvensjonEftaLandOgStorbritanniaToggleEnabled = useFeatureToggle(
    MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA
  );
  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.YRKESAKTIVITET, yrkesaktivitet));
    return () => {
      slettData();
    };
  }, []);

  const radioEndret = (event: ChangeEvent<HTMLInputElement>) => {
    oppdaterData(lagAvklartfakta(KV.Koder.YRKESAKTIVITET, null, event.target.value));
  };

  const labels = erSoknadArbeidFlereLand
    ? [
        "Lønnet arbeid i to eller flere land",
        "Selvstendig næringsvirksomhet i to eller flere land",
        "Lønnet arbeid og selvstendig næringsvirksomhet i to eller flere land",
        "Offentlig tjeneste og annen yrkesaktivitet i to eller flere land",
      ]
    : [
        "Lønnet arbeid",
        "Selvstendig næringsvirksomhet",
        "Arbeidstaker eller frilanser og selvstendig næringsdrivende",
        "Tjeneste i norsk statsforvaltning",
      ];

  const fakta = hentFaktaVerdi(yrkesaktivitet);
  // @ts-ignore
  return (
    <div>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Hva slags type yrkesaktivitet skal søkeren utøve?
      </Nav.Typo.Innholdstittel>
      <Nav.Fieldset legend="">
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}
          value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}
          onChange={radioEndret}
          label={labels[0]}
        />
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}
          value={KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}
          onChange={radioEndret}
          label={labels[1]}
        />
        {!skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende && (
          <Nav.Radio
            name="yrkesaktivitet"
            disabled={!redigerbart}
            checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}
            value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}
            onChange={radioEndret}
            label={labels[2]}
          />
        )}
        {(!konvensjonEftaLandOgStorbritanniaToggleEnabled || erSoknadArbeidFlereLand) && (
          <Nav.Radio
            name="yrkesaktivitet"
            disabled={!redigerbart || !erSoknadArbeidFlereLand}
            checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING}
            value={KV.Koder.VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING}
            onChange={radioEndret}
            label={labels[3]}
          />
        )}
      </Nav.Fieldset>
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          // @ts-ignore
          "data-cy-nesteknapp": "knapp_steg4",
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
};

export default VurderingYrkesaktivitet;
