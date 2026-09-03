import { useEffect, useRef } from "react";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";
import { formaterTilNorskBelopUtenDesimaler } from "../../../utils";
import {
  Beregningsforklaring,
  Beregningsregel,
  Beregningsinntektsgruppe,
  BeregningsforklaringAarsak,
  Inntektspost,
  EkskludertInntektspost,
  OrdinaerAvgiftspost,
  OrdinaerAvgiftPerDel,
} from "../../../services/modules/trygdeavgift";
import { feltId } from "./beregningsforklaringKortContext";

import "./beregningsforklaringKort.less";

const INNTEKTSGRUPPE_TEKST: Record<Beregningsinntektsgruppe, string> = {
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

/**
 * Antall måneder kan være desimal (f.eks. 1,97 når en periode ikke dekker hele måneder).
 * Vises på norsk format med inntil 2 desimaler – heltall vises uten desimaler (12 → «12»).
 */
function visAntallMaaneder(antallMaaneder: number): string {
  return antallMaaneder.toLocaleString("nb-NO", { maximumFractionDigits: 2 });
}

function visInntektskilde(inntektskilde: string): string {
  return KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, inntektskilde) ?? inntektskilde;
}

function visInntektsgruppe(inntektsgruppe: Beregningsinntektsgruppe): string {
  return INNTEKTSGRUPPE_TEKST[inntektsgruppe] ?? inntektsgruppe;
}

function visValgtRegel(valgtRegel: Beregningsregel): string {
  return VALGT_REGEL_TEKST[valgtRegel] ?? valgtRegel;
}

function visAarsak(aarsak: BeregningsforklaringAarsak): string {
  return AARSAK_TEKST[aarsak] ?? aarsak;
}

function Inntektsposter({
  inntektsgrunnlag,
  ekskluderteInntekter,
  sumAarligInntekt,
}: {
  inntektsgrunnlag: Inntektspost[];
  ekskluderteInntekter: EkskludertInntektspost[];
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
              {kr(linje.maanedsbeloep)} × {visAntallMaaneder(linje.antallMaaneder)} mnd ={" "}
              <strong>{kr(linje.sumBeloep)}</strong>
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
  // Bruk backendens avgjørelse i stedet for å re-utlede: backend behandler
  // inntekt == minstebeløp som UNDER (avgift beregnes kun når inntekt > minstebeløp).
  const over = forklaring.aarsak !== "INNTEKT_UNDER_MINSTEBELØP";
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
          {kr(forklaring.sumAarligInntekt)} &gt; {kr(forklaring.minstebeloep)} → inntekten er over minstebeløpet. Avgift
          skal beregnes.
        </Nav.Alert>
      ) : (
        <Nav.Alert variant="warning" size="small" className="beregningsforklaring-kort-merknad">
          {kr(forklaring.sumAarligInntekt)} ≤ {kr(forklaring.minstebeloep)} → inntekten er under minstebeløpet. Det skal
          ikke betales avgift.
        </Nav.Alert>
      )}
    </div>
  );
}

function OrdinaerAvgiftUtregning({
  linjer,
  ordinaerAvgift,
}: {
  linjer: OrdinaerAvgiftspost[];
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

function sammenligningstegn(venstre: number, hoeyre: number): string {
  return venstre > hoeyre ? ">" : "≤";
}

function AvgiftPerDelSammenligning({
  deler,
  maksimalAvgift25Prosent,
}: {
  deler: OrdinaerAvgiftPerDel[];
  maksimalAvgift25Prosent: number;
}) {
  return (
    <div className="beregningsforklaring-kort-underseksjon">
      <Nav.BodyShort size="small" className="beregningsforklaring-kort-underseksjon-tittel">
        Hver avgiftsdel målt mot taket
      </Nav.BodyShort>
      {deler.map((del) => (
        <div className="beregningsforklaring-kort-rad" key={del.inntektsgruppe}>
          <Nav.BodyShort size="small">{visInntektsgruppe(del.inntektsgruppe)}</Nav.BodyShort>
          <Nav.BodyShort size="small" className="beregningsforklaring-kort-rad-verdi">
            <strong>{kr(del.ordinaerAvgift)}</strong> {sammenligningstegn(del.ordinaerAvgift, maksimalAvgift25Prosent)}{" "}
            {kr(maksimalAvgift25Prosent)}
          </Nav.BodyShort>
        </div>
      ))}
    </div>
  );
}

function MaksgrenseSjekk({ forklaring }: { forklaring: Beregningsforklaring }) {
  if (forklaring.inntektOverMinstebeloep === null || forklaring.maksimalAvgift25Prosent === null) return null;

  const maksimalAvgift = forklaring.maksimalAvgift25Prosent;
  const begrenset = forklaring.valgtRegel === "TJUEFEM_PROSENT_REGEL";
  const deler = forklaring.ordinaerAvgiftPerDel ?? [];
  // Merknadene utledes av tallene, ikke av at backend antas å ha valgt riktig gren: står det «→
  // ordinær beregning brukes» fordi ingen del overstiger taket, må begge delene faktisk stemme.
  const alleDelerUnderTaket = deler.length > 0 && deler.every((del) => del.ordinaerAvgift <= maksimalAvgift);
  const summenOverstigerTaket = forklaring.ordinaerAvgift > maksimalAvgift;
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
          Maks avgift = 25 % × {kr(forklaring.inntektOverMinstebeloep)} = <strong>{kr(maksimalAvgift)}</strong>
        </div>
        <OrdinaerAvgiftUtregning linjer={forklaring.ordinaerAvgiftPoster} ordinaerAvgift={forklaring.ordinaerAvgift} />
        {deler.length > 0 && <AvgiftPerDelSammenligning deler={deler} maksimalAvgift25Prosent={maksimalAvgift} />}
      </div>
      {begrenset ? (
        <Nav.Alert variant="success" size="small" className="beregningsforklaring-kort-merknad">
          Ordinær avgift {kr(forklaring.ordinaerAvgift)} &gt; 25 %-tak {kr(maksimalAvgift)} → 25 %-regelen brukes.
          Avgiften begrenses til {kr(maksimalAvgift)}.
        </Nav.Alert>
      ) : alleDelerUnderTaket ? (
        <Nav.Alert variant="info" size="small" className="beregningsforklaring-kort-merknad">
          Hver avgiftsdel måles mot taket for seg, og ingen av dem overstiger {kr(maksimalAvgift)} → ordinær beregning
          brukes. Summen av delene, {kr(forklaring.ordinaerAvgift)}, måles ikke mot taket.
        </Nav.Alert>
      ) : summenOverstigerTaket ? (
        <Nav.Alert variant="info" size="small" className="beregningsforklaring-kort-merknad">
          Ordinær avgift {kr(forklaring.ordinaerAvgift)} &gt; 25 %-tak {kr(maksimalAvgift)}, men avgiften ble ikke
          begrenset. Taket ble målt mot hver avgiftsdel for seg, og delbeløpene mangler i denne forklaringen.
        </Nav.Alert>
      ) : (
        <Nav.Alert variant="info" size="small" className="beregningsforklaring-kort-merknad">
          Ordinær avgift {kr(forklaring.ordinaerAvgift)} ≤ 25 %-tak {kr(maksimalAvgift)} → ordinær beregning brukes.
        </Nav.Alert>
      )}
    </div>
  );
}

function Forklaringsfelt({ forklaring }: { forklaring: Beregningsforklaring }) {
  const id = feltId(forklaring.aar, forklaring.inntektsgruppe);
  return (
    <div className="beregningsforklaring-kort-felt" id={id} tabIndex={-1}>
      <div className="beregningsforklaring-kort-felt-header">
        <Nav.BodyShort size="small" className="beregningsforklaring-kort-felt-tittel">
          {forklaring.aar} · {visInntektsgruppe(forklaring.inntektsgruppe)}
        </Nav.BodyShort>
        <Nav.Tag variant={REGEL_TAG_VARIANT[forklaring.valgtRegel] ?? "neutral"} size="xsmall">
          {visValgtRegel(forklaring.valgtRegel)}
        </Nav.Tag>
      </div>
      <Inntektsposter
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
  open: boolean;
  onToggle: (open: boolean) => void;
  /** feltId som det skal scrolles til når kortet åpnes via en `*`/`**`-lenke. */
  scrollTilFelt: string | null;
}) {
  const innholdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !scrollTilFelt) return;
    // getElementById unngår avhengighet av CSS.escape (kan mangle i enkelte test-/runtime-miljø);
    // containment-sjekken sikrer at vi kun reagerer på felt inni dette kortet.
    const el = document.getElementById(scrollTilFelt);
    if (!el || !innholdRef.current?.contains(el)) return;
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
            <Forklaringsfelt key={feltId(forklaring.aar, forklaring.inntektsgruppe)} forklaring={forklaring} />
          ))}
        </div>
      </Nav.ExpansionCard.Content>
    </Nav.ExpansionCard>
  );
}
