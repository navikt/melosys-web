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
  OrdinaerAvgiftslinje,
} from "../../../services/modules/trygdeavgift";
import { feltId } from "./beregningsforklaringKortContext";

import "./beregningsforklaringKort.less";

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

function visProsent(sats: number): string {
  return `${String(sats).replace(".", ",")} %`;
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
    <div className="beregningsforklaring-kort-steg">
      <div className="beregningsforklaring-kort-steg-tittel">
        <span className="beregningsforklaring-kort-steg-nr">1</span>
        Inntekt som inngår i vurderingen
      </div>
      <div className="beregningsforklaring-kort-kalkyle">
        {inntektsgrunnlag.map((linje, idx) => (
          <div className="beregningsforklaring-kort-rad" key={`inntekt-${idx}`}>
            <div className="beregningsforklaring-kort-rad-tekst">
              <Nav.BodyShort size="small">{visInntektskilde(linje.inntektskilde)}</Nav.BodyShort>
              <Nav.Detail textColor="subtle">
                {linje.fom} – {linje.tom}
              </Nav.Detail>
            </div>
            <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
              {kr(linje.maanedsbeloep)} × {linje.antallMaaneder} mnd = <strong>{kr(linje.sumBeloep)}</strong>
            </Nav.BodyShort>
          </div>
        ))}
        {ekskluderteInntekter.map((linje, idx) => (
          <div className="beregningsforklaring-kort-rad beregningsforklaring-kort-rad--ekskludert" key={`ekskl-${idx}`}>
            <div className="beregningsforklaring-kort-rad-tekst">
              <Nav.BodyShort size="small">{visInntektskilde(linje.inntektskilde)}</Nav.BodyShort>
              <Nav.Detail textColor="subtle">
                {linje.fom} – {linje.tom}
              </Nav.Detail>
            </div>
            <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
              {kr(linje.sumBeloep)}
            </Nav.BodyShort>
          </div>
        ))}
        <div className="beregningsforklaring-kort-rad beregningsforklaring-kort-rad--sum">
          <Nav.BodyShort size="small">Sum inntekt i vurderingen</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
            {kr(sumAarligInntekt)}
          </Nav.BodyShort>
        </div>
      </div>
      {ekskluderteInntekter.length > 0 && (
        <Nav.Alert variant="info" size="small" className="beregningsforklaring-kort-merknad">
          Inntekt der Skatteetaten fastsetter avgiften holdes utenfor minstebeløp- og 25 %-vurderingen.
        </Nav.Alert>
      )}
    </div>
  );
}

function MinstebeloepSjekk({ forklaring }: { forklaring: Beregningsforklaring }) {
  const over = forklaring.sumAarligInntekt >= forklaring.minstebeloep;
  return (
    <div className="beregningsforklaring-kort-steg">
      <div className="beregningsforklaring-kort-steg-tittel">
        <span className="beregningsforklaring-kort-steg-nr">2</span>
        Sjekk mot minstebeløpet
      </div>
      <div className="beregningsforklaring-kort-kalkyle">
        <div className="beregningsforklaring-kort-rad">
          <Nav.BodyShort size="small">Minstebeløp {forklaring.aar}</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
            {kr(forklaring.minstebeloep)}
          </Nav.BodyShort>
        </div>
        <div className="beregningsforklaring-kort-rad">
          <Nav.BodyShort size="small">Sum inntekt i vurderingen</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
            {kr(forklaring.sumAarligInntekt)}
          </Nav.BodyShort>
        </div>
      </div>
      <Nav.Detail textColor="subtle" className="beregningsforklaring-kort-merknad-tekst">
        Minstebeløpet avkortes ikke selv om personen bare skal betale avgift deler av året – hele årets beløp gjelder.
      </Nav.Detail>
      {over ? (
        <Nav.Alert variant="success" size="small" className="beregningsforklaring-kort-merknad">
          {kr(forklaring.sumAarligInntekt)} ≥ {kr(forklaring.minstebeloep)} → inntekten er over minstebeløpet. Avgift
          skal beregnes.
        </Nav.Alert>
      ) : (
        <Nav.Alert variant="warning" size="small" className="beregningsforklaring-kort-merknad">
          {kr(forklaring.sumAarligInntekt)} &lt; {kr(forklaring.minstebeloep)} → inntekten er under minstebeløpet. Det
          skal ikke betales avgift.
        </Nav.Alert>
      )}
    </div>
  );
}

function OrdinaerAvgiftUtregning({
  linjer,
  ordinaerAvgift,
}: {
  linjer: OrdinaerAvgiftslinje[];
  ordinaerAvgift: number;
}) {
  // Uten linjer (eldre svar/ingen utregning) faller vi tilbake til kun totalen.
  if (linjer.length === 0) {
    return (
      <div className="beregningsforklaring-kort-rad">
        <Nav.BodyShort size="small">Ordinær avgift</Nav.BodyShort>
        <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
          {kr(ordinaerAvgift)}
        </Nav.BodyShort>
      </div>
    );
  }
  return (
    <div className="beregningsforklaring-kort-underseksjon">
      <Nav.BodyShort size="small" className="beregningsforklaring-kort-underseksjon-tittel">
        Ordinær avgift
      </Nav.BodyShort>
      {linjer.map((linje, idx) => (
        <div className="beregningsforklaring-kort-rad" key={`ordinaer-${idx}`}>
          <Nav.BodyShort size="small">{visInntektskilde(linje.inntektskilde)}</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
            {kr(linje.grunnlag)} × {visProsent(linje.sats)} = <strong>{kr(linje.beloep)}</strong>
          </Nav.BodyShort>
        </div>
      ))}
      <div className="beregningsforklaring-kort-rad beregningsforklaring-kort-rad--sum">
        <Nav.BodyShort size="small">Sum ordinær avgift</Nav.BodyShort>
        <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
          {kr(ordinaerAvgift)}
        </Nav.BodyShort>
      </div>
    </div>
  );
}

function MaksgrenseSjekk({ forklaring }: { forklaring: Beregningsforklaring }) {
  if (forklaring.inntektOverMinstebeloep === null || forklaring.maksimalAvgift25Prosent === null) return null;

  const begrenset = forklaring.valgtRegel === "TJUEFEM_PROSENT_REGEL";
  return (
    <div className="beregningsforklaring-kort-steg">
      <div className="beregningsforklaring-kort-steg-tittel">
        <span className="beregningsforklaring-kort-steg-nr">3</span>
        25 %-regelen (maksgrense)
      </div>
      <div className="beregningsforklaring-kort-kalkyle">
        <div className="beregningsforklaring-kort-rad">
          <div className="beregningsforklaring-kort-rad-tekst">
            <Nav.BodyShort size="small">Inntekt over minstebeløpet</Nav.BodyShort>
            <Nav.Detail textColor="subtle">
              {kr(forklaring.sumAarligInntekt)} − {kr(forklaring.minstebeloep)}
            </Nav.Detail>
          </div>
          <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
            {kr(forklaring.inntektOverMinstebeloep)}
          </Nav.BodyShort>
        </div>
        <div className="beregningsforklaring-kort-formel">
          Maks avgift = 25 % × {kr(forklaring.inntektOverMinstebeloep)} ={" "}
          <strong>{kr(forklaring.maksimalAvgift25Prosent)}</strong>
        </div>
        <OrdinaerAvgiftUtregning linjer={forklaring.ordinaerAvgiftLinjer} ordinaerAvgift={forklaring.ordinaerAvgift} />
      </div>
      {begrenset ? (
        <Nav.Alert variant="success" size="small" className="beregningsforklaring-kort-merknad">
          Ordinær avgift {kr(forklaring.ordinaerAvgift)} &gt; 25 %-tak {kr(forklaring.maksimalAvgift25Prosent)} → 25
          %-regelen brukes. Avgiften begrenses til {kr(forklaring.maksimalAvgift25Prosent)}.
        </Nav.Alert>
      ) : (
        <Nav.Alert variant="info" size="small" className="beregningsforklaring-kort-merknad">
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
    <div className="beregningsforklaring-kort-felt" id={id} tabIndex={-1}>
      <div className="beregningsforklaring-kort-felt-header">
        <Nav.BodyShort size="small" className="beregningsforklaring-kort-felt-tittel">
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
      {/* Når all inntekt er skattepliktig (ekskludert) er det ingen inntekt i vurderingen,
          og minstebeløpssjekken er meningsløs (0 kr mot minstebeløpet). Da hopper vi over den. */}
      {forklaring.inntektsgrunnlag.length > 0 && <MinstebeloepSjekk forklaring={forklaring} />}
      <MaksgrenseSjekk forklaring={forklaring} />
      <div className="beregningsforklaring-kort-resultat">
        <div className="beregningsforklaring-kort-resultat-tekst">
          <Nav.BodyShort size="small">Fastsatt avgift ({visAarsak(forklaring.aarsak)})</Nav.BodyShort>
          {forklaring.fastsattAvgiftPerMaaned > 0 && (
            <Nav.Detail textColor="subtle">{kr(forklaring.fastsattAvgiftPerMaaned)} per måned</Nav.Detail>
          )}
        </div>
        <span className="beregningsforklaring-kort-resultat-beloep">{kr(forklaring.fastsattAvgift)}</span>
      </div>
    </div>
  );
}

export function BeregningsforklaringKort({
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
    el.classList.remove("beregningsforklaring-kort-felt--blink");
    // Trigger reflow slik at animasjonen kjøres på nytt ved gjentatte klikk.
    void el.offsetWidth;
    el.classList.add("beregningsforklaring-kort-felt--blink");
  }, [open, scrollTilFelt]);

  if (forklaringer.length === 0) return null;

  return (
    <Nav.ExpansionCard
      className="beregningsforklaring-kort-kort"
      aria-label="Beregningsforklaring for trygdeavgift"
      size="small"
      open={open}
      onToggle={onToggle}
    >
      <Nav.ExpansionCard.Header>
        <Nav.ExpansionCard.Title size="small">Beregningsforklaring</Nav.ExpansionCard.Title>
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
