import React, { ReactNode } from "react";
import { connect, ConnectedProps } from "react-redux";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";

import * as Nav from "../../../../utils/navFrontend";
import * as Etiketter from "../../etiketter";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Ikoner from "../../../../resources/images";
import * as Skjema from "../../../skjema";

import { BOOLSK_STRING } from "../../../../constants";
import EditerbartElement, { Status } from "../editerbartElement";

import "./lonnOgGodtgjorelser.css";

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);
const lonnOgGodtgjorelseSelector = (state: RootState) => soknadFormValueSelector(state, "loennOgGodtgjoerelse");

const mapStateToProps = (state: RootState) => ({
  // todo
  lonnOgNaturalytelser: lonnOgGodtgjorelseSelector(state),
  arbeidsgiveravgiftOgTrygdeavgift: lonnOgGodtgjorelseSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type LonnOgGodtgjorelserProps = {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  behandlingsgrunnlagEtikett: ReactNode;
};

const LonnOgGodtgjorelser = connector((props: /* todo */ PropsFromRedux & LonnOgGodtgjorelserProps) => (
  <Nav.Container fluid className="lonnOgGodtgjorelser">
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
          {KV.Menypunkter.LonnOgGodtgjorelser.tittel}
        </Nav.typo.Innholdstittel>
        <span>{props.behandlingsgrunnlagEtikett}</span>
        {/* todo toggle og margin og listecomp?? */}
        {props.visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
        <LonnOgNaturalytelser redigerbart={props.redigerbart} {...props.lonnOgNaturalytelser} />
        <ArbeidsgiveravgiftOgTrygdeavgift redigerbart={props.redigerbart} {...props.arbeidsgiveravgiftOgTrygdeavgift} />
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
));

type LonnOgNaturalytelserProps = {
  norskArbgUtbetalerLoenn: boolean;
  erArbeidstakerAnsattHelePerioden: boolean;
  utlArbgUtbetalerLoenn: boolean;
  bruttoLoennPerMnd: number;
  bruttoLoennUtlandPerMnd: number;
  mottarNaturalytelser: boolean;
  samletVerdiNaturalytelser: number;
  utlArbTilhoererSammeKonsern: boolean;
};

const symbolsynlighetMap = new Map([
  [Status.Redigerer, { bin: false, pencil: false }],
  [Status.IngenData, { bin: false, pencil: false }],
  [Status.RedigeringUtfort, { bin: false, pencil: true }],
] as const);

const LonnOgNaturalytelser = (props: LonnOgNaturalytelserProps & { redigerbart: boolean }) => (
  <EditerbartElement
    redigerbart={props.redigerbart}
    harData
    tittel={KV.Menypunkter.LonnOgGodtgjorelser.undertitler.lonnOgNaturalytelser}
    hentNyStatusVedHarData={false}
    onBinClick={() => {}}
    visLagreKnapp
    symbolsynlighetMap={symbolsynlighetMap}
    redigererRender={() => <LonnOgNaturalytelserRedigerer />}
    redigeringUtfortRender={() => <LonnOgNaturalytelserRedigeringUtfort {...props} />}
  />
);

const LonnOgNaturalytelserRedigerer = () => {
  return (
    <>
      <Nav.Row>
        <Nav.Column xs="12">
          <BooleanFeltRedigerer
            tekst="Vil arbeidsgiver i Norge utbetale lønn i utsendingsperioden?"
            feltNavn="norskArbgUtbetalerLoenn"
          />
          <BooleanFeltRedigerer
            tekst="Vil arbeidstakeren fortsatt være ansatt i utsendingsperioden?"
            feltNavn="erArbeidstakerAnsattHelePerioden"
          />
          <BooleanFeltRedigerer
            tekst="Vil utenlandsk virksomhet utbetale lønn som ikke blir fakturert arbeidsgiver?"
            feltNavn="utlArbgUtbetalerLoenn"
          />
          <BooleanFeltRedigerer
            tekst="Vil arbeidstakeren motta naturalytelser betalt av en utenlandsk virksomhet?"
            feltNavn="mottarNaturalytelser"
          />
          <BooleanFeltRedigerer
            tekst="Tilhører det utenlandske foretaket samme konsern som arbeidsgiver?"
            feltNavn="utlArbTilhoererSammeKonsern"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <InntektRedigerer feltNavn="bruttoLoennPerMnd" tittel="Lønn fra Norge" />
        <InntektRedigerer feltNavn="bruttoLoennUtlandPerMnd" tittel="Lønn fra utlandet" />
        <InntektRedigerer feltNavn="samletVerdiNaturalytelser" tittel="Naturalytelser fra utlandet" />
      </Nav.Row>
    </>
  );
};

const LonnOgNaturalytelserRedigeringUtfort = ({
  norskArbgUtbetalerLoenn,
  erArbeidstakerAnsattHelePerioden,
  utlArbgUtbetalerLoenn,
  bruttoLoennPerMnd,
  bruttoLoennUtlandPerMnd,
  mottarNaturalytelser,
  samletVerdiNaturalytelser,
  utlArbTilhoererSammeKonsern,
}: LonnOgNaturalytelserProps) => (
  <>
    <Nav.Row>
      <Nav.Column xs="12">
        <BooleanFeltRedigeringUtfort
          tekst="Vil arbeidsgiver i Norge utbetale lønn i utsendingsperioden?"
          verdi={norskArbgUtbetalerLoenn}
        />
        <BooleanFeltRedigeringUtfort
          tekst="Vil arbeidstakeren fortsatt være ansatt i utsendingsperioden?"
          verdi={erArbeidstakerAnsattHelePerioden}
        />
        <BooleanFeltRedigeringUtfort
          tekst="Vil utenlandsk virksomhet utbetale lønn som ikke blir fakturert arbeidsgiver?"
          verdi={utlArbgUtbetalerLoenn}
        />
        <BooleanFeltRedigeringUtfort
          tekst="Vil arbeidstakeren motta naturalytelser betalt av en utenlandsk virksomhet?"
          verdi={mottarNaturalytelser}
        />
        <BooleanFeltRedigeringUtfort
          tekst="Tilhører det utenlandske foretaket samme konsern som arbeidsgiver?"
          verdi={utlArbTilhoererSammeKonsern}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <InntektRedigeringUtfort tittel="Lønn fra Norge" verdi={bruttoLoennPerMnd} />
      <InntektRedigeringUtfort tittel="Lønn fra utlandet" verdi={bruttoLoennUtlandPerMnd} />
      <InntektRedigeringUtfort tittel="Naturalytelser fra utlandet" verdi={samletVerdiNaturalytelser} />
    </Nav.Row>
  </>
);

type ArbeidsgiveravgiftOgTrygdeavgiftProps = {
  erArbeidsgiveravgiftHelePerioden: boolean;
  erTrukketTrygdeavgift: boolean;
};

const ArbeidsgiveravgiftOgTrygdeavgift = (props: ArbeidsgiveravgiftOgTrygdeavgiftProps & { redigerbart: boolean }) => (
  <EditerbartElement
    redigerbart={props.redigerbart}
    harData
    tittel={KV.Menypunkter.LonnOgGodtgjorelser.undertitler.arbeidsgiveravgiftOgTrygdeavgift}
    hentNyStatusVedHarData={false}
    onBinClick={() => {}}
    symbolsynlighetMap={symbolsynlighetMap}
    visLagreKnapp
    redigererRender={() => <ArbeidsgiveravgiftOgTrygdeavgiftRedigerer />}
    redigeringUtfortRender={() => <ArbeidsgiveravgiftOgTrygdeavgiftRedigeringUtfort {...props} />}
  />
);

const ArbeidsgiveravgiftOgTrygdeavgiftRedigerer = () => (
  <Nav.Row>
    <Nav.Column xs="12">
      <BooleanFeltRedigerer
        tekst="Vil arbeidsgiver betale arbeidsgiveravgift av all lønn utbetalt i hele perioden?"
        feltNavn="erArbeidsgiveravgiftHelePerioden"
      />
      <BooleanFeltRedigerer
        tekst="Vil det bli trukket trygdeavgift gjennom skatten i hele perioden?"
        feltNavn="erTrukketTrygdeavgift"
      />
    </Nav.Column>
  </Nav.Row>
);

const ArbeidsgiveravgiftOgTrygdeavgiftRedigeringUtfort = ({
  erArbeidsgiveravgiftHelePerioden,
  erTrukketTrygdeavgift,
}: ArbeidsgiveravgiftOgTrygdeavgiftProps) => (
  <Nav.Row>
    <Nav.Column xs="12">
      <BooleanFeltRedigeringUtfort
        tekst="Vil arbeidsgiver betale arbeidsgiveravgift av all lønn utbetalt i hele perioden?"
        verdi={erArbeidsgiveravgiftHelePerioden}
      />
      <BooleanFeltRedigeringUtfort
        tekst="Vil det bli trukket trygdeavgift gjennom skatten i hele perioden?"
        verdi={erTrukketTrygdeavgift}
      />
    </Nav.Column>
  </Nav.Row>
);

const BooleanFeltRedigerer = ({ tekst, feltNavn }: { tekst: string; feltNavn: string }) => {
  const navn = Utils._uuid();

  return (
    <Nav.Row>
      <Nav.Column xs="12">
        <Nav.Fieldset legend={tekst} className="boolean-felt-redigerer">
          <Skjema.Radio
            feltNavn={`loennOgGodtgjoerelse.${feltNavn}`}
            label="Ja"
            value
            id={`${navn}.${BOOLSK_STRING.SANN}`}
            disabled={false}
            /*
            todo redigerbart
*/
          />
          <Skjema.Radio
            feltNavn={`loennOgGodtgjoerelse.${feltNavn}`}
            label="Nei"
            value={false}
            id={`${navn}.${BOOLSK_STRING.USANN}`}
            disabled={false}
          />
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  );
};

const BooleanFeltRedigeringUtfort = ({ tekst, verdi }: { tekst: string; verdi: boolean | null }) => (
  <Nav.Row>
    <Nav.Column xs="12" className="boolean-felt-redigerering-utfort">
      <Nav.typo.Normaltekst>{tekst}</Nav.typo.Normaltekst>
      <Nav.typo.Element>{verdi === null ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(verdi))}</Nav.typo.Element>
    </Nav.Column>
  </Nav.Row>
);

// todo ingen input -> null - ikke 0
const InntektRedigerer = ({ tittel, feltNavn }: { tittel: string; feltNavn: string }) => (
  <Nav.Column xs="4" className="inntekt-redigerer">
    {/*
    <Nav.typo.Normaltekst>kr</Nav.typo.Normaltekst>
*/}
    <Skjema.Input feltNavn={`loennOgGodtgjoerelse.${feltNavn}`} label={tittel} bredde="S" datoFelt={false} />
  </Nav.Column>
);

const InntektRedigeringUtfort = ({ tittel, verdi }: { tittel: string; verdi: number | null }) => {
  /*
  const skalRendreInntekt: boolean = verdi !== null && !isNaN(verdi);
  const formaterVerdi = () => Intl.NumberFormat("NO-nb", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(verdi)
*/

  return (
    <Nav.Column xs="4" className="inntekt-redigering-utfort">
      <Nav.typo.Normaltekst>{tittel}</Nav.typo.Normaltekst>
      <Nav.typo.Undertittel className="inntekt-undertittel">
        {verdi === null || Number.isNaN(verdi) ? ( // todo isNaN finnes
          "-"
        ) : (
          <>
            {Intl.NumberFormat("NO-nb", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }).format(verdi)}
            <Ikoner.Inntekt className="inntekt-ikon" />
          </>
        )}
      </Nav.typo.Undertittel>
    </Nav.Column>
  );
};

export default LonnOgGodtgjorelser;
