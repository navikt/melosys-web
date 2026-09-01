import { ExternalLinkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { BodyShort, Popover, Search, Tabs, UNSAFE_Combobox as Combobox } from "@navikt/ds-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import * as Nav from "../../navFrontend";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { fagsakSelectors } from "../../ducks/fagsaker";
import { useFiltrerteTekstblokker, useTekstblokker } from "../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkType } from "../../services/modules/tekstblokker";
import { Betingelse, harBetingelseEllerValgTokener, PlaceholderVerdi } from "../../services/modules/placeholdere";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import { BREVBIBLIOTEK } from "../../sider/tekstblokker/ruter";
import * as Constants from "../../constants";
import TekstblokkForhandsvisning from "./tekstblokkForhandsvisning";
import { htmlTilRenTekst } from "./htmlTilRenTekst";
import "./tekstblokkSoek.less";

// «sett-inn» skriver til editoren under. I saksflyter uten HtmlEditor finnes ingen
// editor å skrive til, så «bibliotek» lar brukeren slå opp og kopiere i stedet.
export type TekstblokkSoekModus = "sett-inn" | "bibliotek";

interface Props {
  // Kreves kun i sett-inn-modus; biblioteket kopierer i stedet for å sette inn.
  onVelg?: (html: string) => void;
  disabled?: boolean;
  modus?: TekstblokkSoekModus;
  // Popoveren henger under en knapp nederst i editoren, men over en knapp i topplinja.
  placement?: "top-end" | "bottom-end";
  knappetekst?: string;
  overskrift?: string;
  // I Send brev (sidemenyen) kan brukeren også sette inn hele brevmaler. I selve
  // saksflytene er vedtaksbrevet allerede en mal, så da viser vi kun tekstblokker.
  visBrevmaler?: boolean;
  // Finnes når editoren kan fylle inn verdier – da forhåndsvises tekstblokken ferdig utfylt.
  placeholderVerdier?: PlaceholderVerdi[];
  // Nøklene fra placeholder-katalogen; skiller ukjente nøkler (røde) fra gyldige uten verdi.
  gyldigeNokler?: string[];
  // Nøklene fra betingelseskatalogen; skiller ukjente betingelsesnøkler (røde) fra gyldige.
  gyldigeBetingelsesNokler?: string[];
  // Sakens fakta; med dem forhåndsvises {#hvis …} ferdig oppløst.
  betingelser?: Betingelse[];
}

const SIDE_STORRELSE = 10;

// Luft mot vindukanten, i tråd med shift-paddingen Aksel-popoveren bruker.
const POPOVER_MARG = 16;

// Header, faner og filtre tar rundt 15rem. Under dette blir det ikke plass til treff i
// det hele tatt, så vi lar heller popoveren ta det meste av vinduet enn å vise en tom liste.
const MIN_POPOVER_HOYDE = 384;

// Hvor lenge «Kopiert» står før knappen går tilbake, som i KopierbarTekst.
const KOPIERT_MS = 1000;

function TekstblokkSoek(props: Props) {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  if (!togglePaa) return null;
  return <TekstblokkSoekIntern {...props} />;
}

function TekstblokkSoekIntern({
  onVelg,
  disabled,
  modus = "sett-inn",
  placement = "top-end",
  knappetekst,
  overskrift,
  visBrevmaler = false,
  placeholderVerdier,
  gyldigeNokler,
  gyldigeBetingelsesNokler,
  betingelser,
}: Props) {
  const ankerRef = useRef<HTMLDivElement>(null);
  const [aapen, setAapen] = useState(false);
  const [aktivType, setAktivType] = useState<TekstblokkType>("TEKSTBLOKK");
  // Fritekstsøk og tag-filter holdes adskilt slik at det er tydelig hva som er et
  // søkeord og hva som er en faktisk tag.
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);
  const [antallVist, setAntallVist] = useState(SIDE_STORRELSE);
  // «Vis alle» slår av kontekstavgrensningen for økten i popoveren – den er støyreduksjon, ikke sikkerhet.
  const [ignorerKontekst, setIgnorerKontekst] = useState(false);
  const [tilgjengeligHoyde, setTilgjengeligHoyde] = useState<number | null>(null);

  // Konteksten leses her i stedet for å sendes som props, så alle saksflyt-editorene
  // avgrenses likt. Utenfor en sak (f.eks. i admin) er kodene "" og filtrerer ingenting.
  const sakstype: string = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const sakstema: string = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const behandlingstema: string = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);

  const { data: blokker = [], isLoading } = useTekstblokker(aktivType, aapen);

  const {
    tagAntall,
    synlige: filtrerte,
    antallUtenKontekst,
  } = useFiltrerteTekstblokker(
    blokker,
    soek,
    valgteTags,
    ignorerKontekst ? {} : { sakstype, sakstema, behandlingstema },
    // Api-et skal alt ha filtrert bort utkast; filteret her er belte i tillegg til seler.
    "PUBLISERT",
  );

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

  // Popoveren har fast høyde og kan ikke krympe selv, så vi måler hvor mye plass som
  // faktisk er ledig over og under knappen før den åpnes. Uten dette blir toppen –
  // med søkefelt og tag-filter – klippet bort der det er trangt.
  const aapne = () => {
    const anker = ankerRef.current?.getBoundingClientRect();
    if (anker) {
      const plassOver = anker.top - POPOVER_MARG;
      const plassUnder = window.innerHeight - anker.bottom - POPOVER_MARG;
      const heleVinduet = window.innerHeight - POPOVER_MARG * 2;
      const oenskethoyde = Math.max(plassOver, plassUnder, MIN_POPOVER_HOYDE);
      setTilgjengeligHoyde(Math.min(oenskethoyde, heleVinduet));
    }
    setAapen(true);
  };

  const lukk = () => {
    setAapen(false);
    setAktivType("TEKSTBLOKK");
    setIgnorerKontekst(false);
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

  const erBibliotek = modus === "bibliotek";
  const standardKnappetekst = visBrevmaler ? "Legg til tekstblokker/brevmal" : "Legg til tekstblokker";
  const knapp = knappetekst ?? standardKnappetekst;
  const erBrevmal = visBrevmaler && aktivType === "BREVMAL";
  const typeOrd = erBrevmal ? "brevmaler" : "tekstblokker";
  const typeOrdEntall = erBrevmal ? "brevmal" : "tekstblokk";
  const standardOverskrift = visBrevmaler ? "Sett inn tekstblokk eller brevmal" : "Sett inn tekstblokk";
  const tittel = overskrift ?? standardOverskrift;
  const harAktivtFilter = soek.trim().length > 0 || valgteTags.length > 0;
  // Kontekstavgrensningen skjuler faktisk noe: samme søk/tags/status gir treff uten den. Da
  // hjelper «Vis alle», også når søket er med på å tømme lista.
  const kontekstSkjulerTreff = filtrerte.length === 0 && antallUtenKontekst > 0;

  return (
    <>
      <div className="tekstblokkSoek__verktoylinje" ref={ankerRef}>
        <Nav.Button
          variant="tertiary"
          size="small"
          onClick={() => (aapen ? lukk() : aapne())}
          disabled={disabled}
          type="button"
        >
          {knapp}
        </Nav.Button>
      </div>
      <Popover
        open={aapen}
        onClose={lukk}
        anchorEl={ankerRef.current}
        placement={placement}
        arrow={false}
        className="tekstblokkSoek__popover"
      >
        <Popover.Content
          className="tekstblokkSoek__innhold"
          style={tilgjengeligHoyde ? { height: `min(46rem, ${tilgjengeligHoyde}px)` } : undefined}
        >
          <div className="tekstblokkSoek__topp">
            <div className="tekstblokkSoek__header">
              <Nav.Heading size="xsmall" level="2">
                {tittel}
              </Nav.Heading>
              <div className="tekstblokkSoek__header-knapper">
                {/* Popoveren er trang for lengre blokker. Lenken gir hele biblioteket i
                    ny fane, så saken brukeren står i ikke går tapt. */}
                {erBibliotek && (
                  <Nav.Link
                    href={`${Constants.URL_BASENAME}${BREVBIBLIOTEK}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tekstblokkSoek__bibliotekLenke"
                  >
                    Åpne biblioteket
                    <ExternalLinkIcon aria-hidden />
                  </Nav.Link>
                )}
                <Nav.Button
                  variant="tertiary-neutral"
                  size="small"
                  type="button"
                  icon={<XMarkIcon aria-hidden />}
                  onClick={lukk}
                  title="Lukk"
                />
              </div>
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
              <Search
                label="Søk på tittel eller tag"
                hideLabel={false}
                size="small"
                variant="simple"
                placeholder="Søk…"
                value={soek}
                onChange={setSoek}
              />

              {/* key remounter Combobox ved gjenåpning så uncommittet input-tekst ikke
                  henger igjen (Popover skjuler med CSS, unmounter ikke innholdet). */}
              <Combobox
                key={`tags-${aapen}`}
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
                {/* Med et aktivt filter er det bare søketreffene som er kontekst-skjult –
                    å påstå at ingen blokker gjelder saken ville vært usant. */}
                {kontekstSkjulerTreff && (
                  <BodyShort size="small">
                    {harAktivtFilter
                      ? "Treffene for filtrene dine gjelder ikke denne saken (sakstype/sakstema/behandlingstema)."
                      : `Ingen ${typeOrd} gjelder denne saken (sakstype/sakstema/behandlingstema).`}
                  </BodyShort>
                )}
                {/* Rådet gjelder bare når det faktisk er et filter å endre på – tømmer
                    utkast-filtrering eller en tom liste, ville rådet pekt feil vei. */}
                {harAktivtFilter && (
                  <BodyShort size="small">Prøv et annet søkeord, eller fjern noen av de valgte taggene.</BodyShort>
                )}
                {kontekstSkjulerTreff && (
                  <Nav.Button variant="tertiary" size="small" type="button" onClick={() => setIgnorerKontekst(true)}>
                    Vis alle
                  </Nav.Button>
                )}
              </div>
            )}
            {synlige.map((blokk) => (
              <TekstblokkRad
                key={blokk.id}
                blokk={blokk}
                modus={modus}
                placeholderVerdier={placeholderVerdier}
                gyldigeNokler={gyldigeNokler}
                gyldigeBetingelsesNokler={gyldigeBetingelsesNokler}
                betingelser={betingelser}
                onVelg={(html) => {
                  onVelg?.(html);
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
  modus: TekstblokkSoekModus;
  placeholderVerdier?: PlaceholderVerdi[];
  gyldigeNokler?: string[];
  gyldigeBetingelsesNokler?: string[];
  betingelser?: Betingelse[];
}

type Kopistatus = "klar" | "kopiert" | "feilet";

function TekstblokkRad({
  blokk,
  onVelg,
  modus,
  placeholderVerdier,
  gyldigeNokler,
  gyldigeBetingelsesNokler,
  betingelser,
}: RadProps) {
  // Innhold er skjult som standard – vises kun når brukeren ber om det.
  const [visInnhold, setVisInnhold] = useState(false);
  const [kopistatus, setKopistatus] = useState<Kopistatus>("klar");

  useEffect(() => {
    if (kopistatus === "klar") return undefined;
    const timer = setTimeout(() => setKopistatus("klar"), KOPIERT_MS);
    return () => clearTimeout(timer);
  }, [kopistatus]);

  // Utklippstavla kan avvises av nettleseren (manglende tillatelse, usikker kontekst).
  // Da må brukeren få vite det – ellers tror hen at teksten ligger klar.
  const kopier = async () => {
    try {
      await navigator.clipboard.writeText(htmlTilRenTekst(blokk.innhold));
      setKopistatus("kopiert");
    } catch {
      setKopistatus("feilet");
    }
  };

  const kopitekst = { klar: "Kopier til utklippstavle", kopiert: "Kopiert", feilet: "Kunne ikke kopiere" }[kopistatus];

  // Uten noen av de tre løser ikke editoren tokener ved innsetting, og saksflyten har heller
  // ingen sendevarsel som fanger dem opp senere.
  const utenPlaceholderKontekst =
    placeholderVerdier === undefined && gyldigeNokler === undefined && betingelser === undefined;
  const advarOmTokener = utenPlaceholderKontekst && harBetingelseEllerValgTokener(blokk.innhold);

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
          {advarOmTokener && (
            <div className="tekstblokkSoek__rad-advarsel">
              <Nav.Tag size="xsmall" variant="warning">
                Inneholder felter som ikke fylles ut her
              </Nav.Tag>
              <BodyShort size="small">
                Betingelser og valg settes inn slik de står, og må fjernes eller fylles ut manuelt etterpå.
              </BodyShort>
            </div>
          )}
        </div>
        <div className="tekstblokkSoek__rad-knapper">
          <Nav.Button size="xsmall" variant="tertiary" type="button" onClick={() => setVisInnhold(!visInnhold)}>
            {visInnhold ? "Skjul innhold" : "Vis innhold"}
          </Nav.Button>
          {modus === "bibliotek" ? (
            // Popoveren lukkes ikke: den som slår opp vil gjerne kopiere flere blokker.
            <Nav.Button size="xsmall" variant="secondary" type="button" onClick={kopier}>
              {kopitekst}
            </Nav.Button>
          ) : (
            <Nav.Button size="xsmall" variant="primary" type="button" onClick={() => onVelg(blokk.innhold)}>
              Sett inn
            </Nav.Button>
          )}
        </div>
      </div>
      {/* Statusen står utenfor knappen, ellers ville skjermleseren lest hele teksten på nytt. */}
      <span role="status" aria-live="polite" className="navds-sr-only">
        {kopistatus === "kopiert" && `${blokk.tittel} er kopiert til utklippstavlen`}
        {kopistatus === "feilet" && `Kunne ikke kopiere ${blokk.tittel} til utklippstavlen`}
      </span>
      {visInnhold && (
        <div className="tekstblokkSoek__forhandsvisning tekstblokkSoek__forhandsvisning--full">
          <TekstblokkForhandsvisning
            html={blokk.innhold}
            placeholderVerdier={placeholderVerdier}
            gyldigeNokler={gyldigeNokler}
            gyldigeBetingelsesNokler={gyldigeBetingelsesNokler}
            betingelser={betingelser}
          />
        </div>
      )}
    </div>
  );
}

export default TekstblokkSoek;
