import { useEffect, useRef } from "react";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";
import { formaterTilNorskBelopUtenDesimaler } from "../../../utils";
import {
  Beregningsforklaring,
  Beregningsregel,
  Beregningsregelgruppe,
  BeregningsforklaringAarsak,
  Inntektslinje,
  EkskludertInntektslinje,
} from "../../../services/modules/trygdeavgift";
import { feltId } from "./beregningsgrunnlagContext";

import "./beregningsgrunnlag.less";

const REGELGRUPPE_TEKST: Record<Beregningsregelgruppe, string> = {
  SAMLET: "Samlet inntekt",
  HELSEDEL: "Helsedel",
  PENSJONSDEL: "Pensjonsdel",
  MISJONAER: "Misjonærinntekt",
};

const VALGT_REGEL_TEKST: Record<Beregningsregel, string> = {
  ORDINÆR: "Ordinær beregning",
  TJUEFEM_PROSENT_REGEL: "25 %-regelen",
  MINSTEBELØP: "Under minstebeløpet",
};

const AARSAK_TEKST: Record<BeregningsforklaringAarsak, string> = {
  BEREGNET: "Avgift beregnet",
  INNTEKT_UNDER_MINSTEBELØP: "Inntekt under minstebeløpet",
  INGEN_INNTEKT: "Ingen inntekt",
};

const REGEL_TAG_VARIANT: Record<Beregningsregel, "neutral" | "info" | "warning"> = {
  ORDINÆR: "neutral",
  TJUEFEM_PROSENT_REGEL: "info",
  MINSTEBELØP: "warning",
};

function kr(beloep: number | null | undefined): string {
  if (beloep === null || beloep === undefined) return "–";
  return `${formaterTilNorskBelopUtenDesimaler(beloep)} kr`;
}

function visInntektskilde(inntektskilde: string): string {
  return KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, inntektskilde) ?? inntektskilde;
}

function visRegelgruppe(regelgruppe: Beregningsregelgruppe): string {
  return REGELGRUPPE_TEKST[regelgruppe] ?? regelgruppe;
}

function visValgtRegel(valgtRegel: Beregningsregel): string {
  return VALGT_REGEL_TEKST[valgtRegel] ?? valgtRegel;
}

function visAarsak(aarsak: BeregningsforklaringAarsak): string {
  return AARSAK_TEKST[aarsak] ?? aarsak;
}

function Inntektslinjer({
  inntektsgrunnlag,
  ekskluderteInntekter,
  sumAarligInntekt,
}: {
  inntektsgrunnlag: Inntektslinje[];
  ekskluderteInntekter: EkskludertInntektslinje[];
  sumAarligInntekt: number;
}) {
  return (
    <div className="beregningsgrunnlag-steg">
      <div className="beregningsgrunnlag-steg-tittel">
        <span className="beregningsgrunnlag-steg-nr">1</span>
        Inntekt som inngår i vurderingen
      </div>
      <div className="beregningsgrunnlag-kalkyle">
        {inntektsgrunnlag.map((linje, idx) => (
          <div className="beregningsgrunnlag-rad" key={`inntekt-${idx}`}>
            <div className="beregningsgrunnlag-rad-tekst">
              <Nav.BodyShort size="small">{visInntektskilde(linje.inntektskilde)}</Nav.BodyShort>
              <Nav.Detail textColor="subtle">
                {linje.fom} – {linje.tom}
              </Nav.Detail>
            </div>
            <Nav.BodyShort size="small" className="beregningsgrunnlag-rad-verdi">
              {kr(linje.maanedsbeloep)} × {linje.antallMaaneder} mnd = <strong>{kr(linje.sumBeloep)}</strong>
            </Nav.BodyShort>
          </div>
        ))}
        {ekskluderteInntekter.map((linje, idx) => (
          <div className="beregningsgrunnlag-rad beregningsgrunnlag-rad--ekskludert" key={`ekskl-${idx}`}>
            <div className="beregningsgrunnlag-rad-tekst">
              <Nav.BodyShort size="small">{visInntektskilde(linje.inntektskilde)}</Nav.BodyShort>
              <Nav.Detail textColor="subtle">
                {linje.fom} – {linje.tom}
              </Nav.Detail>
            </div>
            <Nav.BodyShort size="small" className="beregningsgrunnlag-rad-verdi">
              {kr(linje.sumBeloep)}
            </Nav.BodyShort>
          </div>
        ))}
        <div className="beregningsgrunnlag-rad beregningsgrunnlag-rad--sum">
          <Nav.BodyShort size="small">Sum inntekt i vurderingen</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsgrunnlag-rad-verdi">
            {kr(sumAarligInntekt)}
          </Nav.BodyShort>
        </div>
      </div>
      {ekskluderteInntekter.length > 0 && (
        <Nav.Alert variant="info" size="small" className="beregningsgrunnlag-merknad">
          Inntekt der Skatteetaten fastsetter avgiften holdes utenfor minstebeløp- og 25 %-vurderingen.
        </Nav.Alert>
      )}
    </div>
  );
}

function MinstebeloepSjekk({ forklaring }: { forklaring: Beregningsforklaring }) {
  const over = forklaring.sumAarligInntekt >= forklaring.minstebeloep;
  return (
    <div className="beregningsgrunnlag-steg">
      <div className="beregningsgrunnlag-steg-tittel">
        <span className="beregningsgrunnlag-steg-nr">2</span>
        Sjekk mot minstebeløpet
      </div>
      <div className="beregningsgrunnlag-kalkyle">
        <div className="beregningsgrunnlag-rad">
          <Nav.BodyShort size="small">Minstebeløp {forklaring.aar}</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsgrunnlag-rad-verdi">
            {kr(forklaring.minstebeloep)}
          </Nav.BodyShort>
        </div>
        <div className="beregningsgrunnlag-rad">
          <Nav.BodyShort size="small">Sum inntekt i vurderingen</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsgrunnlag-rad-verdi">
            {kr(forklaring.sumAarligInntekt)}
          </Nav.BodyShort>
        </div>
      </div>
      <Nav.Detail textColor="subtle" className="beregningsgrunnlag-merknad-tekst">
        Minstebeløpet avkortes ikke selv om personen bare skal betale avgift deler av året – hele årets beløp gjelder.
      </Nav.Detail>
      {over ? (
        <Nav.Alert variant="success" size="small" className="beregningsgrunnlag-merknad">
          {kr(forklaring.sumAarligInntekt)} ≥ {kr(forklaring.minstebeloep)} → inntekten er over minstebeløpet. Avgift
          skal beregnes.
        </Nav.Alert>
      ) : (
        <Nav.Alert variant="warning" size="small" className="beregningsgrunnlag-merknad">
          {kr(forklaring.sumAarligInntekt)} &lt; {kr(forklaring.minstebeloep)} → inntekten er under minstebeløpet. Det
          skal ikke betales avgift.
        </Nav.Alert>
      )}
    </div>
  );
}

function MaksgrenseSjekk({ forklaring }: { forklaring: Beregningsforklaring }) {
  if (forklaring.inntektOverMinstebeloep === null || forklaring.maksimalAvgift25Prosent === null) return null;

  const begrenset = forklaring.valgtRegel === "TJUEFEM_PROSENT_REGEL";
  return (
    <div className="beregningsgrunnlag-steg">
      <div className="beregningsgrunnlag-steg-tittel">
        <span className="beregningsgrunnlag-steg-nr">3</span>
        25 %-regelen (maksgrense)
      </div>
      <div className="beregningsgrunnlag-kalkyle">
        <div className="beregningsgrunnlag-rad">
          <div className="beregningsgrunnlag-rad-tekst">
            <Nav.BodyShort size="small">Inntekt over minstebeløpet</Nav.BodyShort>
            <Nav.Detail textColor="subtle">
              {kr(forklaring.sumAarligInntekt)} − {kr(forklaring.minstebeloep)}
            </Nav.Detail>
          </div>
          <Nav.BodyShort size="small" className="beregningsgrunnlag-rad-verdi">
            {kr(forklaring.inntektOverMinstebeloep)}
          </Nav.BodyShort>
        </div>
        <div className="beregningsgrunnlag-formel">
          Maks avgift = 25 % × {kr(forklaring.inntektOverMinstebeloep)} ={" "}
          <strong>{kr(forklaring.maksimalAvgift25Prosent)}</strong>
        </div>
        <div className="beregningsgrunnlag-rad">
          <Nav.BodyShort size="small">Ordinær avgift</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsgrunnlag-rad-verdi">
            {kr(forklaring.ordinaerAvgift)}
          </Nav.BodyShort>
        </div>
      </div>
      {begrenset ? (
        <Nav.Alert variant="success" size="small" className="beregningsgrunnlag-merknad">
          Ordinær avgift {kr(forklaring.ordinaerAvgift)} &gt; 25 %-tak {kr(forklaring.maksimalAvgift25Prosent)} → 25
          %-regelen brukes. Avgiften begrenses til {kr(forklaring.maksimalAvgift25Prosent)}.
        </Nav.Alert>
      ) : (
        <Nav.Alert variant="info" size="small" className="beregningsgrunnlag-merknad">
          Ordinær avgift {kr(forklaring.ordinaerAvgift)} ≤ 25 %-tak {kr(forklaring.maksimalAvgift25Prosent)} → ordinær
          beregning brukes.
        </Nav.Alert>
      )}
    </div>
  );
}

function Forklaringsfelt({ forklaring }: { forklaring: Beregningsforklaring }) {
  const id = feltId(forklaring.aar, forklaring.regelgruppe);
  return (
    <div className="beregningsgrunnlag-felt" id={id} tabIndex={-1}>
      <div className="beregningsgrunnlag-felt-header">
        <Nav.BodyShort size="small" className="beregningsgrunnlag-felt-tittel">
          {forklaring.aar} · {visRegelgruppe(forklaring.regelgruppe)}
        </Nav.BodyShort>
        <Nav.Tag variant={REGEL_TAG_VARIANT[forklaring.valgtRegel] ?? "neutral"} size="xsmall">
          {visValgtRegel(forklaring.valgtRegel)}
        </Nav.Tag>
      </div>
      <Inntektslinjer
        inntektsgrunnlag={forklaring.inntektsgrunnlag}
        ekskluderteInntekter={forklaring.ekskluderteInntekter}
        sumAarligInntekt={forklaring.sumAarligInntekt}
      />
      <MinstebeloepSjekk forklaring={forklaring} />
      <MaksgrenseSjekk forklaring={forklaring} />
      <div className="beregningsgrunnlag-resultat">
        <Nav.BodyShort size="small">Fastsatt avgift ({visAarsak(forklaring.aarsak)})</Nav.BodyShort>
        <span className="beregningsgrunnlag-resultat-beloep">{kr(forklaring.fastsattAvgift)}</span>
      </div>
    </div>
  );
}

export function Beregningsgrunnlag({
  forklaringer,
  open,
  onToggle,
  scrollTilFelt,
}: {
  forklaringer: Beregningsforklaring[];
  /** Styrt åpen/lukket-tilstand fra tabellen. */
  open: boolean;
  onToggle: (open: boolean) => void;
  /** feltId som det skal scrolles til når kortet åpnes via en `*`/`**`-lenke. */
  scrollTilFelt: string | null;
}) {
  const innholdRef = useRef<HTMLDivElement>(null);

  // Scroll til riktig felt når kortet er åpent og et felt er valgt.
  useEffect(() => {
    if (!open || !scrollTilFelt) return;
    const el = innholdRef.current?.querySelector<HTMLElement>(`#${CSS.escape(scrollTilFelt)}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("beregningsgrunnlag-felt--blink");
    // Trigger reflow slik at animasjonen kjøres på nytt ved gjentatte klikk.
    void el.offsetWidth;
    el.classList.add("beregningsgrunnlag-felt--blink");
  }, [open, scrollTilFelt]);

  if (forklaringer.length === 0) return null;

  return (
    <Nav.ExpansionCard
      className="beregningsgrunnlag-kort"
      aria-label="Beregningsgrunnlag for trygdeavgift"
      size="small"
      open={open}
      onToggle={onToggle}
    >
      <Nav.ExpansionCard.Header>
        <Nav.ExpansionCard.Title size="small">Beregningsgrunnlag</Nav.ExpansionCard.Title>
        <Nav.ExpansionCard.Description>Inntektsgrunnlag, minstebeløp og 25 %-vurdering</Nav.ExpansionCard.Description>
      </Nav.ExpansionCard.Header>
      <Nav.ExpansionCard.Content>
        <div ref={innholdRef}>
          {forklaringer.map((forklaring) => (
            <Forklaringsfelt key={feltId(forklaring.aar, forklaring.regelgruppe)} forklaring={forklaring} />
          ))}
        </div>
      </Nav.ExpansionCard.Content>
    </Nav.ExpansionCard>
  );
}
