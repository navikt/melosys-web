import { useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";

import * as Nav from "../../../../navFrontend";
import * as Tags from "../../tags";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Ikoner from "../../../../resources/images";
import * as Skjema from "../../../skjema";

import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";
import { formSelectors } from "../../../../ducks/form";
import { BOOLSK_STRING } from "../../../../constants";

import EditerbartElement, { Status } from "../editerbartElement";
import "./lonnOgGodtgjorelser.css";

interface BooleanFeltRedigererProps {
  tekst: string;
  feltNavn: string;
  redigerbart: boolean;
}

function BooleanFeltRedigerer({ tekst, feltNavn, redigerbart }: BooleanFeltRedigererProps) {
  const navn = Utils._uuid();

  return (
    <Nav.Row>
      <Nav.Column xs="12">
        <Skjema.RadioGroup legend={tekst} name={`loennOgGodtgjoerelse.${feltNavn}`} readOnly={!redigerbart}>
          <Nav.Radio value id={`${navn}.${BOOLSK_STRING.SANN}`}>
            Ja
          </Nav.Radio>
          <Nav.Radio value={false} id={`${navn}.${BOOLSK_STRING.USANN}`}>
            Nei
          </Nav.Radio>
        </Skjema.RadioGroup>
      </Nav.Column>
    </Nav.Row>
  );
}

interface BooleanFeltRedigeringUtfortProps {
  tekst: string;
  verdi: boolean | null;
}

export function BooleanFeltRedigeringUtfort({ tekst, verdi }: BooleanFeltRedigeringUtfortProps) {
  return (
    <Nav.Row>
      <Nav.Column xs="12" className="boolean-felt-redigering-utfort">
        <Nav.BodyLong size="small" className="typo-normal">
          {tekst}
        </Nav.BodyLong>
        <Nav.BodyLong weight="semibold" size="small" className="typo-element">
          {verdi === null ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(verdi))}
        </Nav.BodyLong>
      </Nav.Column>
    </Nav.Row>
  );
}

interface InntektRedigererProps {
  tittel: string;
  feltNavn: string;
  redigerbart: boolean;
}

function InntektRedigerer({ tittel, feltNavn, redigerbart }: InntektRedigererProps) {
  return (
    <Nav.Column xs="4" className="inntekt-redigerer">
      <Skjema.Input feltNavn={`loennOgGodtgjoerelse.${feltNavn}`} label={tittel} disabled={!redigerbart} />
    </Nav.Column>
  );
}

export function FormatertInntekt({ inntekt }: { inntekt: number }) {
  return (
    <>
      {Intl.NumberFormat("NO-nb", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(inntekt)}
      <Ikoner.Inntekt className="inntekt-ikon" />
    </>
  );
}

export function InntektRedigeringUtfortUndertittel({ verdi }: { verdi: number | string | null }) {
  const inntekt = Utils.streng.tryParseFloat(verdi);

  return (
    <Nav.Heading size="xsmall" className="inntekt-undertittel">
      {inntekt !== null ? <FormatertInntekt inntekt={inntekt} /> : "-"}
    </Nav.Heading>
  );
}

interface InntektRedigeringUtfortProps {
  tittel: string;
  verdi: number | string | null;
}

function InntektRedigeringUtfort({ tittel, verdi }: InntektRedigeringUtfortProps) {
  return (
    <Nav.Column xs="4" className="inntekt-redigering-utfort">
      <Nav.BodyLong size="small">{tittel}</Nav.BodyLong>
      <InntektRedigeringUtfortUndertittel verdi={verdi} />
    </Nav.Column>
  );
}

interface LonnOgNaturalytelserType {
  norskArbgUtbetalerLoenn: boolean | null;
  erArbeidstakerAnsattHelePerioden: boolean | null;
  utlArbgUtbetalerLoenn: boolean | null;
  bruttoLoennPerMnd: number | null;
  bruttoLoennUtlandPerMnd: number | null;
  mottarNaturalytelser: boolean | null;
  samletVerdiNaturalytelser: number | null;
  utlArbTilhoererSammeKonsern: boolean | null;
}

function LonnOgNaturalytelserRedigerer({ redigerbart }: { redigerbart: boolean }) {
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
}

function LonnOgNaturalytelserRedigeringUtfort({
  norskArbgUtbetalerLoenn,
  erArbeidstakerAnsattHelePerioden,
  utlArbgUtbetalerLoenn,
  bruttoLoennPerMnd,
  bruttoLoennUtlandPerMnd,
  mottarNaturalytelser,
  samletVerdiNaturalytelser,
  utlArbTilhoererSammeKonsern,
}: LonnOgNaturalytelserType) {
  return (
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
}

const symbolsynlighet = { [Status.RedigeringUtfort]: { bin: false, pencil: true } };

type LonnOgNaturalytelserProps = LonnOgNaturalytelserType & { lagreHandler: () => boolean; redigerbart: boolean };

function LonnOgNaturalytelser({ redigerbart, lagreHandler, ...lonnOgNaturalytelser }: LonnOgNaturalytelserProps) {
  return (
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
}

interface ArbeidsgiveravgiftOgTrygdeavgiftType {
  erArbeidsgiveravgiftHelePerioden: boolean | null;
  erTrukketTrygdeavgift: boolean | null;
}

function ArbeidsgiveravgiftOgTrygdeavgiftRedigerer({ redigerbart }: { redigerbart: boolean }) {
  return (
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
}

function ArbeidsgiveravgiftOgTrygdeavgiftRedigeringUtfort({
  erArbeidsgiveravgiftHelePerioden,
  erTrukketTrygdeavgift,
}: ArbeidsgiveravgiftOgTrygdeavgiftType) {
  return (
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
}

type ArbeidsgiveravgiftOgTrygdeavgiftProps = ArbeidsgiveravgiftOgTrygdeavgiftType & {
  lagreHandler: () => boolean;
  redigerbart: boolean;
};

function ArbeidsgiveravgiftOgTrygdeavgift({
  redigerbart,
  lagreHandler,
  ...arbeidsgiveravgiftOgTrygdeavgift
}: ArbeidsgiveravgiftOgTrygdeavgiftProps) {
  return (
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
}

interface LonnOgGodtgjorelserProps {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
}

function LonnOgGodtgjorelser({ redigerbart, visArbeidsforholdRolleEtiketter }: LonnOgGodtgjorelserProps) {
  const dispatch = useDispatch();
  const lagreHandler = () => {
    dispatch(mottatteOpplysningerOperations.oppdaterState());
    return true;
  };
  const lønnOgGodtgjørelse = useSelector(formSelectors.SoknadFormValuesSelector)?.loennOgGodtgjoerelse;

  return (
    <Nav.Container fluid className="lonnOgGodtgjorelser">
      <Nav.Row className="tittel">
        <Nav.Column xs="12">
          <Nav.Heading size="small" style={{ display: "inline", marginRight: "1em" }}>
            {KV.Menypunkter.LonnOgGodtgjorelser.tittel}
          </Nav.Heading>
          {visArbeidsforholdRolleEtiketter && <Tags.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
          <LonnOgNaturalytelser
            redigerbart={redigerbart}
            lagreHandler={lagreHandler}
            {...(lønnOgGodtgjørelse as LonnOgNaturalytelserType)}
          />
          <ArbeidsgiveravgiftOgTrygdeavgift
            redigerbart={redigerbart}
            lagreHandler={lagreHandler}
            {...(lønnOgGodtgjørelse as ArbeidsgiveravgiftOgTrygdeavgiftType)}
          />
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
}

export default LonnOgGodtgjorelser;
