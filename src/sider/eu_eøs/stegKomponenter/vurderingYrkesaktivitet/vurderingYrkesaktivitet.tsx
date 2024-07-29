import { useEffect } from "react";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import { konverterAvklartfaktaTilStegData, lagAvklartfakta } from "../../../../felleskomponenter/stegvelger";
import { hentFaktaVerdi } from "../../../../domeneUtils";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../featuretoggle/toggleNavn";
import { MKVUtils } from "../../../../melosyskodeverk";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import "./vurderingYrkesaktivitet.css";

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
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);

  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.YRKESAKTIVITET, yrkesaktivitet));
    return () => {
      slettData();
    };
  }, []);

  const radioEndret = (value: string) => {
    oppdaterData(lagAvklartfakta(KV.Koder.YRKESAKTIVITET, null, value));
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
    <div className="vurderingYrkesaktivitet">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Yrkesaktivitet</Nav.Typo.Innholdstittel>
      <Nav.RadioGroup
        legend="Hva slags type yrkesaktivitet skal bruker utøve?"
        onChange={radioEndret}
        defaultValue={fakta}
        name="yrkesaktivitet"
        readOnly={!redigerbart}
        size="small"
      >
        <Nav.Radio value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}>{labels[0]}</Nav.Radio>
        <Nav.Radio value={KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}>{labels[1]}</Nav.Radio>
        {!skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende && (
          <Nav.Radio value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}>{labels[2]}</Nav.Radio>
        )}
        {!(konvensjonStorbritanniaToggleEnabled && MKVUtils.erUtsendt(behandlingstema)) && (
          <Nav.Radio
            disabled={!erSoknadArbeidFlereLand}
            value={KV.Koder.VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING}
          >
            {labels[3]}
          </Nav.Radio>
        )}
      </Nav.RadioGroup>
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          // @ts-ignore
          "data-cy-nesteknapp": "knapp_steg4",
          onClick: bekreftOgFortsett,
        }}
        // @ts-ignore
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
};

export default VurderingYrkesaktivitet;
