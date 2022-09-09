import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";

import * as Nav from "../../../../navFrontend";
import * as Etiketter from "../../etiketter";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Ikoner from "../../../../resources/images";
import * as Skjema from "../../../skjema";

import { behandlingsgrunnlagOperations } from "../../../../ducks/behandlingsgrunnlag";
import { BOOLSK_STRING } from "../../../../constants";
import EditerbartElement, { Status } from "../editerbartElement";

import "./lonnOgGodtgjorelser.css";

type BooleanFeltRedigererProps = {
  tekst: string;
  feltNavn: string;
  redigerbart: boolean;
};

const BooleanFeltRedigerer = ({ tekst, feltNavn, redigerbart }: BooleanFeltRedigererProps) => {
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
            disabled={!redigerbart}
          />
          <Skjema.Radio
            feltNavn={`loennOgGodtgjoerelse.${feltNavn}`}
            label="Nei"
            value={false}
            id={`${navn}.${BOOLSK_STRING.USANN}`}
            disabled={!redigerbart}
          />
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  );
};

type BooleanFeltRedigeringUtfortProps = {
  tekst: string;
  verdi: boolean | null;
};

export const BooleanFeltRedigeringUtfort = ({ tekst, verdi }: BooleanFeltRedigeringUtfortProps) => (
  <Nav.Row>
    <Nav.Column xs="12" className="boolean-felt-redigering-utfort">
      <Nav.Typo.Normaltekst className="typo-normal">{tekst}</Nav.Typo.Normaltekst>
      <Nav.Typo.Element className="typo-element">
        {verdi === null ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(verdi))}
      </Nav.Typo.Element>
    </Nav.Column>
  </Nav.Row>
);

type InntektRedigererProps = {
  tittel: string;
  feltNavn: string;
  redigerbart: boolean;
};

const InntektRedigerer = ({ tittel, feltNavn, redigerbart }: InntektRedigererProps) => (
  <Nav.Column xs="4" className="inntekt-redigerer">
    <Skjema.Input feltNavn={`loennOgGodtgjoerelse.${feltNavn}`} label={tittel} bredde="S" disabled={!redigerbart} />
  </Nav.Column>
);

export const FormatertInntekt = ({ inntekt }: { inntekt: number }) => (
  <>
    {Intl.NumberFormat("NO-nb", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(inntekt)}
    <Ikoner.Inntekt className="inntekt-ikon" />
  </>
);

export const InntektRedigeringUtfortUndertittel = ({ verdi }: { verdi: number | string | null }) => {
  const inntekt = Utils.streng.tryParseFloat(verdi);

  return (
    <Nav.Typo.Undertittel className="inntekt-undertittel">
      {inntekt !== null ? <FormatertInntekt inntekt={inntekt} /> : "-"}
    </Nav.Typo.Undertittel>
  );
};

type InntektRedigeringUtfortProps = {
  tittel: string;
  verdi: number | string | null;
};

const InntektRedigeringUtfort = ({ tittel, verdi }: InntektRedigeringUtfortProps) => (
  <Nav.Column xs="4" className="inntekt-redigering-utfort">
    <Nav.Typo.Normaltekst>{tittel}</Nav.Typo.Normaltekst>
    <InntektRedigeringUtfortUndertittel verdi={verdi} />
  </Nav.Column>
);

type LonnOgNaturalytelserType = {
  norskArbgUtbetalerLoenn: boolean | null;
  erArbeidstakerAnsattHelePerioden: boolean | null;
  utlArbgUtbetalerLoenn: boolean | null;
  bruttoLoennPerMnd: number | null;
  bruttoLoennUtlandPerMnd: number | null;
  mottarNaturalytelser: boolean | null;
  samletVerdiNaturalytelser: number | null;
  utlArbTilhoererSammeKonsern: boolean | null;
};

const LonnOgNaturalytelserRedigerer = ({ redigerbart }: { redigerbart: boolean }) => {
  return (
    <>
      <Nav.Row>
        <Nav.Column xs="12">
          <BooleanFeltRedigerer
            tekst="Vil arbeidsgiver i Norge utbetale lønn i utsendingsperioden?"
            feltNavn="norskArbgUtbetalerLoenn"
            redigerbart={redigerbart}
          />
          <BooleanFeltRedigerer
            tekst="Vil arbeidstakeren fortsatt være ansatt i utsendingsperioden?"
            feltNavn="erArbeidstakerAnsattHelePerioden"
            redigerbart={redigerbart}
          />
          <BooleanFeltRedigerer
            tekst="Vil utenlandsk virksomhet utbetale lønn som ikke blir fakturert arbeidsgiver?"
            feltNavn="utlArbgUtbetalerLoenn"
            redigerbart={redigerbart}
          />
          <BooleanFeltRedigerer
            tekst="Vil arbeidstakeren motta naturalytelser betalt av en utenlandsk virksomhet?"
            feltNavn="mottarNaturalytelser"
            redigerbart={redigerbart}
          />
          <BooleanFeltRedigerer
            tekst="Tilhører det utenlandske foretaket samme konsern som arbeidsgiver?"
            feltNavn="utlArbTilhoererSammeKonsern"
            redigerbart={redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <InntektRedigerer feltNavn="bruttoLoennPerMnd" tittel="Lønn fra Norge" redigerbart={redigerbart} />
        <InntektRedigerer feltNavn="bruttoLoennUtlandPerMnd" tittel="Lønn fra utlandet" redigerbart={redigerbart} />
        <InntektRedigerer
          feltNavn="samletVerdiNaturalytelser"
          tittel="Naturalytelser fra utlandet"
          redigerbart={redigerbart}
        />
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
}: LonnOgNaturalytelserType) => (
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

const symbolsynlighet = { [Status.RedigeringUtfort]: { bin: false, pencil: true } };

type LonnOgNaturalytelserProps = LonnOgNaturalytelserType & { lagreHandler: () => boolean; redigerbart: boolean };

const LonnOgNaturalytelser = ({ redigerbart, lagreHandler, ...lonnOgNaturalytelser }: LonnOgNaturalytelserProps) => (
  <EditerbartElement
    redigerbart={redigerbart}
    harData
    tittel={KV.Menypunkter.LonnOgGodtgjorelser.undertitler.lonnOgNaturalytelser}
    visLagreKnapp
    onLagreClick={lagreHandler}
    symbolsynlighet={symbolsynlighet}
    redigererRender={() => <LonnOgNaturalytelserRedigerer redigerbart={redigerbart} />}
    redigeringUtfortRender={() => <LonnOgNaturalytelserRedigeringUtfort {...lonnOgNaturalytelser} />}
  />
);

type ArbeidsgiveravgiftOgTrygdeavgiftType = {
  erArbeidsgiveravgiftHelePerioden: boolean | null;
  erTrukketTrygdeavgift: boolean | null;
};

const ArbeidsgiveravgiftOgTrygdeavgiftRedigerer = ({ redigerbart }: { redigerbart: boolean }) => (
  <Nav.Row>
    <Nav.Column xs="12">
      <BooleanFeltRedigerer
        tekst="Vil arbeidsgiver betale arbeidsgiveravgift av all lønn utbetalt i hele perioden?"
        feltNavn="erArbeidsgiveravgiftHelePerioden"
        redigerbart={redigerbart}
      />
      <BooleanFeltRedigerer
        tekst="Vil det bli trukket trygdeavgift gjennom skatten i hele perioden?"
        feltNavn="erTrukketTrygdeavgift"
        redigerbart={redigerbart}
      />
    </Nav.Column>
  </Nav.Row>
);

const ArbeidsgiveravgiftOgTrygdeavgiftRedigeringUtfort = ({
  erArbeidsgiveravgiftHelePerioden,
  erTrukketTrygdeavgift,
}: ArbeidsgiveravgiftOgTrygdeavgiftType) => (
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

type ArbeidsgiveravgiftOgTrygdeavgiftProps = ArbeidsgiveravgiftOgTrygdeavgiftType & {
  lagreHandler: () => boolean;
  redigerbart: boolean;
};

const ArbeidsgiveravgiftOgTrygdeavgift = ({
  redigerbart,
  lagreHandler,
  ...arbeidsgiveravgiftOgTrygdeavgift
}: ArbeidsgiveravgiftOgTrygdeavgiftProps) => (
  <EditerbartElement
    redigerbart={redigerbart}
    harData
    tittel={KV.Menypunkter.LonnOgGodtgjorelser.undertitler.arbeidsgiveravgiftOgTrygdeavgift}
    symbolsynlighet={symbolsynlighet}
    visLagreKnapp
    onLagreClick={lagreHandler}
    redigererRender={() => <ArbeidsgiveravgiftOgTrygdeavgiftRedigerer redigerbart={redigerbart} />}
    redigeringUtfortRender={() => (
      <ArbeidsgiveravgiftOgTrygdeavgiftRedigeringUtfort {...arbeidsgiveravgiftOgTrygdeavgift} />
    )}
  />
);

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);
const lonnOgGodtgjorelseSelector = (
  state: RootState
): LonnOgNaturalytelserType & ArbeidsgiveravgiftOgTrygdeavgiftType =>
  soknadFormValueSelector(state, "loennOgGodtgjoerelse");

const lonnOgNaturalytelserSelector = (state: RootState): LonnOgNaturalytelserType => lonnOgGodtgjorelseSelector(state);
const arbeidsgiveravgiftOgTrygdeavgiftSelector = (state: RootState): ArbeidsgiveravgiftOgTrygdeavgiftType =>
  lonnOgGodtgjorelseSelector(state);

const mapStateToProps = (state: RootState) => ({
  lonnOgNaturalytelser: lonnOgNaturalytelserSelector(state),
  arbeidsgiveravgiftOgTrygdeavgift: arbeidsgiveravgiftOgTrygdeavgiftSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type LonnOgGodtgjorelserProps = {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
};

const LonnOgGodtgjorelser = connector(
  ({
    redigerbart,
    oppdaterBehandlingsgrunnlag,
    lonnOgNaturalytelser,
    arbeidsgiveravgiftOgTrygdeavgift,
    visArbeidsforholdRolleEtiketter,
  }: PropsFromRedux & LonnOgGodtgjorelserProps) => {
    const lagreHandler = () => {
      oppdaterBehandlingsgrunnlag();
      return true;
    };

    return (
      <Nav.Container fluid className="lonnOgGodtgjorelser">
        <Nav.Row className="tittel">
          <Nav.Column xs="12">
            <Nav.Typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
              {KV.Menypunkter.LonnOgGodtgjorelser.tittel}
            </Nav.Typo.Innholdstittel>
            {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
            <LonnOgNaturalytelser redigerbart={redigerbart} lagreHandler={lagreHandler} {...lonnOgNaturalytelser} />
            <ArbeidsgiveravgiftOgTrygdeavgift
              redigerbart={redigerbart}
              lagreHandler={lagreHandler}
              {...arbeidsgiveravgiftOgTrygdeavgift}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    );
  }
);

export default LonnOgGodtgjorelser;
