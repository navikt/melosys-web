import { XMarkIcon } from "@navikt/aksel-icons";
import { BodyShort, Popover, Search, Tabs, UNSAFE_Combobox as Combobox } from "@navikt/ds-react";
import { useEffect, useMemo, useRef, useState } from "react";

import * as Nav from "../../navFrontend";
import { useFiltrerteTekstblokker, useTekstblokker } from "../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkType } from "../../services/modules/tekstblokker";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import TekstblokkForhandsvisning from "./tekstblokkForhandsvisning";
import "./tekstblokkSoek.less";

interface Props {
  onVelg: (html: string) => void;
  disabled?: boolean;
  // I Send brev (sidemenyen) kan brukeren også sette inn hele brevmaler. I selve
  // saksflytene er vedtaksbrevet allerede en mal, så da viser vi kun tekstblokker.
  visBrevmaler?: boolean;
}

const SIDE_STORRELSE = 10;

function TekstblokkSoek({ onVelg, disabled, visBrevmaler = false }: Props) {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  if (!togglePaa) return null;
  return <TekstblokkSoekIntern onVelg={onVelg} disabled={disabled} visBrevmaler={visBrevmaler} />;
}

function TekstblokkSoekIntern({ onVelg, disabled, visBrevmaler = false }: Props) {
  const ankerRef = useRef<HTMLDivElement>(null);
  const [aapen, setAapen] = useState(false);
  const [aktivType, setAktivType] = useState<TekstblokkType>("TEKSTBLOKK");
  // Fritekstsøk og tag-filter holdes adskilt slik at det er tydelig hva som er et
  // søkeord og hva som er en faktisk tag.
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);
  const [antallVist, setAntallVist] = useState(SIDE_STORRELSE);

  const { data: blokker = [], isLoading } = useTekstblokker(aktivType, aapen);

  const { tagAntall, synlige: filtrerte } = useFiltrerteTekstblokker(blokker, soek, valgteTags);

  // Kun reelle tags vises i nedtrekket – med antall treff – så det er tydelig
  // hvilke tags som faktisk finnes.
  const tagOpsjoner = useMemo(
    () => tagAntall.map(([tag, antall]) => ({ label: `${tag} (${antall})`, value: tag })),
    [tagAntall],
  );
  const valgteTagOpsjoner = useMemo(() => valgteTags.map((tag) => ({ label: tag, value: tag })), [valgteTags]);

  // Vis et begrenset antall om gangen; nullstill når søk/filter/type endres.
  useEffect(() => setAntallVist(SIDE_STORRELSE), [soek, valgteTags, aktivType]);

  const synlige = filtrerte.slice(0, antallVist);
  const gjenstaaende = filtrerte.length - synlige.length;

  const nullstillFiltre = () => {
    setSoek("");
    setValgteTags([]);
  };

  const lukk = () => {
    setAapen(false);
    setAktivType("TEKSTBLOKK");
    nullstillFiltre();
  };

  const byttType = (verdi: string) => {
    setAktivType(verdi as TekstblokkType);
    nullstillFiltre();
  };

  const toggleTag = (verdi: string, valgt: boolean) =>
    setValgteTags((forrige) =>
      valgt ? [...forrige, verdi] : forrige.filter((t) => t.toLowerCase() !== verdi.toLowerCase()),
    );

  const knappetekst = visBrevmaler ? "Legg til tekstblokker/brevmal" : "Legg til tekstblokker";
  const erBrevmal = visBrevmaler && aktivType === "BREVMAL";
  const typeOrd = erBrevmal ? "brevmaler" : "tekstblokker";
  const typeOrdEntall = erBrevmal ? "brevmal" : "tekstblokk";
  const overskrift = visBrevmaler ? "Sett inn tekstblokk eller brevmal" : "Sett inn tekstblokk";
  const harAktivtFilter = soek.trim().length > 0 || valgteTags.length > 0;

  return (
    <>
      <div className="tekstblokkSoek__verktoylinje" ref={ankerRef}>
        <Nav.Button
          variant="tertiary"
          size="small"
          onClick={() => (aapen ? lukk() : setAapen(true))}
          disabled={disabled}
          type="button"
        >
          {knappetekst}
        </Nav.Button>
      </div>
      <Popover
        open={aapen}
        onClose={lukk}
        anchorEl={ankerRef.current}
        placement="top-end"
        arrow={false}
        className="tekstblokkSoek__popover"
      >
        <Popover.Content className="tekstblokkSoek__innhold">
          <div className="tekstblokkSoek__topp">
            <div className="tekstblokkSoek__header">
              <Nav.Heading size="xsmall" level="2">
                {overskrift}
              </Nav.Heading>
              <Nav.Button
                variant="tertiary-neutral"
                size="small"
                type="button"
                icon={<XMarkIcon aria-hidden />}
                onClick={lukk}
                title="Lukk"
              />
            </div>

            {visBrevmaler && (
              <Tabs value={aktivType} onChange={byttType} size="small" className="tekstblokkSoek__faner">
                <Tabs.List>
                  <Tabs.Tab value="TEKSTBLOKK" label="Tekstblokker" />
                  <Tabs.Tab value="BREVMAL" label="Brevmaler" />
                </Tabs.List>
              </Tabs>
            )}

            <div className="tekstblokkSoek__filtre">
              {/* Popover skjuler med CSS uten å unmounte, så autoFocus krever samme
                  key-remount som Comboboxen for å faktisk gi fokus ved åpning. */}
              <Search
                key={aapen ? "apen" : "lukket"}
                label="Søk på tittel eller tag"
                hideLabel={false}
                size="small"
                variant="simple"
                placeholder="Søk…"
                value={soek}
                onChange={setSoek}
                autoFocus
              />

              {/* key remounter Combobox ved gjenåpning så uncommittet input-tekst ikke
                  henger igjen (Popover skjuler med CSS, unmounter ikke innholdet). */}
              <Combobox
                key={aapen ? "apen" : "lukket"}
                label="Filtrer på tags"
                size="small"
                isMultiSelect
                options={tagOpsjoner}
                selectedOptions={valgteTagOpsjoner}
                onToggleSelected={toggleTag}
                placeholder={tagOpsjoner.length ? "Velg tag…" : "Ingen tags tilgjengelig"}
              />
            </div>

            <div className="tekstblokkSoek__resultatlinje">
              <BodyShort size="small">
                {filtrerte.length} {filtrerte.length === 1 ? typeOrdEntall : typeOrd}
              </BodyShort>
              {harAktivtFilter && (
                <Nav.Button variant="tertiary" size="xsmall" type="button" onClick={nullstillFiltre}>
                  Nullstill filter
                </Nav.Button>
              )}
            </div>
          </div>

          <div className="tekstblokkSoek__liste">
            {isLoading && (
              <div className="tekstblokkSoek__laster">
                <Nav.Loader size="small" />
              </div>
            )}
            {!isLoading && filtrerte.length === 0 && (
              <div className="tekstblokkSoek__tom">
                <BodyShort size="small" weight="semibold">
                  Fant ingen {typeOrd}
                </BodyShort>
                <BodyShort size="small">Prøv et annet søkeord, eller fjern noen av de valgte taggene.</BodyShort>
              </div>
            )}
            {synlige.map((blokk) => (
              <TekstblokkRad
                key={blokk.id}
                blokk={blokk}
                onVelg={(html) => {
                  onVelg(html);
                  lukk();
                }}
              />
            ))}

            {gjenstaaende > 0 && (
              <Nav.Button
                variant="tertiary"
                size="small"
                type="button"
                className="tekstblokkSoek__visFlere"
                onClick={() => setAntallVist((n) => n + SIDE_STORRELSE)}
              >
                Vis {Math.min(gjenstaaende, SIDE_STORRELSE)} flere ({gjenstaaende} igjen)
              </Nav.Button>
            )}
          </div>
        </Popover.Content>
      </Popover>
    </>
  );
}

interface RadProps {
  blokk: TekstblokkOversikt;
  onVelg: (html: string) => void;
}

function TekstblokkRad({ blokk, onVelg }: RadProps) {
  // Innhold er skjult som standard – vises kun når brukeren ber om det.
  const [visInnhold, setVisInnhold] = useState(false);

  return (
    <div className={`tekstblokkSoek__rad${visInnhold ? " tekstblokkSoek__rad--utvidet" : ""}`}>
      <div className="tekstblokkSoek__rad-topp">
        <div className="tekstblokkSoek__rad-info">
          <div className="tekstblokkSoek__rad-tittel">{blokk.tittel}</div>
          {blokk.tags.length > 0 && (
            <div className="tekstblokkSoek__rad-tags">
              {blokk.tags.map((tag) => (
                <Nav.Tag key={tag} size="xsmall" variant="neutral">
                  {tag}
                </Nav.Tag>
              ))}
            </div>
          )}
        </div>
        <div className="tekstblokkSoek__rad-knapper">
          <Nav.Button size="xsmall" variant="tertiary" type="button" onClick={() => setVisInnhold(!visInnhold)}>
            {visInnhold ? "Skjul innhold" : "Vis innhold"}
          </Nav.Button>
          <Nav.Button size="xsmall" variant="primary" type="button" onClick={() => onVelg(blokk.innhold)}>
            Sett inn
          </Nav.Button>
        </div>
      </div>
      {visInnhold && (
        <div className="tekstblokkSoek__forhandsvisning tekstblokkSoek__forhandsvisning--full">
          <TekstblokkForhandsvisning html={blokk.innhold} />
        </div>
      )}
    </div>
  );
}

export default TekstblokkSoek;
