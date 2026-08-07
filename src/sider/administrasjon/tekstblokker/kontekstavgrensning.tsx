import { useMemo, useState } from "react";
import { Alert, BodyShort, Loader, UNSAFE_Combobox as Combobox } from "@navikt/ds-react";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../melosyskodeverk";
import { useKombinasjonstre } from "../../../services/api/kombinasjonstre";
import {
  Avgrensning,
  behandlingstemaerFor,
  Nivaa,
  Ryddenivaa,
  Ryddet,
  ryddNedover,
  sakstemaerFor,
  sakstyperITre,
} from "../../../services/modules/lovligekombinasjoner/kombinasjonstre";

interface Opsjon {
  label: string;
  value: string;
}

// Kodeverket er eneste kilde til visningsnavn. Treet leverer bare koder, så det finnes
// ingen konkurrerende term som kan divergere mellom deploy av api og web.
const tilOpsjoner = (koder: KTObject[]): Opsjon[] =>
  koder.map(({ kode, term }) => ({ label: term ?? kode, value: kode }));

export const sakstypeOpsjoner = tilOpsjoner(MKV.KTObjects.sakstyper);
export const sakstemaOpsjoner = tilOpsjoner(MKV.KTObjects.sakstemaer);
export const behandlingstemaOpsjoner = tilOpsjoner(MKV.KTObjects.behandlinger.behandlingstema);

// Faller tilbake til koden, slik at en avgrensning lagret på en kode vi ikke kjenner
// fortsatt vises i stedet for å bli borte.
const term = (opsjoner: Opsjon[], kode: string): string => opsjoner.find((o) => o.value === kode)?.label ?? kode;

export const termForSakstype = (kode: string): string => term(sakstypeOpsjoner, kode);
export const termForSakstema = (kode: string): string => term(sakstemaOpsjoner, kode);
export const termForBehandlingstema = (kode: string): string => term(behandlingstemaOpsjoner, kode);

const valgteOpsjoner = (opsjoner: Opsjon[], koder: string[]): Opsjon[] =>
  koder.map((kode) => ({ label: term(opsjoner, kode), value: kode }));

// Begrenser kodeverket til kodene treet tillater, og bevarer kodeverkets rekkefølge.
const begrensTil = (opsjoner: Opsjon[], lovligeKoder: string[]): Opsjon[] => {
  const lovlige = new Set(lovligeKoder);
  return opsjoner.filter((o) => lovlige.has(o.value));
};

const toggle = (koder: string[], kode: string, valgt: boolean): string[] =>
  valgt ? [...koder, kode] : koder.filter((k) => k !== kode);

// Feltet admin endret, ikke feltet valget forsvant fra: det er det første som forklarer det andre.
const UTLOESER: Record<Nivaa, string> = { sakstype: "sakstypen", sakstema: "sakstemaet" };

const ALLE_NAA: Record<Ryddenivaa, string> = {
  sakstema: "alle sakstemaer",
  behandlingstema: "alle behandlingstemaer",
};

// Et tømt felt betyr «alle», så ryddingen gjør tekstblokken bredere enn før. Det er den
// konsekvensen admin må se, ikke bare hvilken kode som forsvant.
const ryddemelding = (endret: Nivaa, { fjernet, toemte }: Pick<Ryddet, "fjernet" | "toemte">): string => {
  const termer = [...fjernet.sakstemaer.map(termForSakstema), ...fjernet.behandlingstemaer.map(termForBehandlingstema)];
  const fjernetSetning = `Fjernet fra avgrensningen fordi det ikke er mulig sammen med ${UTLOESER[endret]}: ${termer.join(", ")}.`;
  if (toemte.length === 0) return fjernetSetning;
  return `${fjernetSetning} Tekstblokken gjelder nå ${toemte.map((nivaa) => ALLE_NAA[nivaa]).join(" og ")}.`;
};

interface Props {
  sakstyper: string[];
  setSakstyper: (koder: string[]) => void;
  sakstemaer: string[];
  setSakstemaer: (koder: string[]) => void;
  behandlingstemaer: string[];
  setBehandlingstemaer: (koder: string[]) => void;
}

function Kontekstavgrensning({
  sakstyper,
  setSakstyper,
  sakstemaer,
  setSakstemaer,
  behandlingstemaer,
  setBehandlingstemaer,
}: Props) {
  const { data, isLoading } = useKombinasjonstre();
  // Uten denne forsvinner en chip mens admin ser et annet felt, og oppryddingen blir like
  // usynlig som feiltilstanden den finnes for å hindre.
  const [ryddingsmelding, setRyddingsmelding] = useState<string | null>(null);

  // Ikke `data ?? []`: et svar som ikke er en liste ville nådd flatMap og kastet.
  const tre = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  // Et tomt tre er like ubrukelig som ingen tre: uten grener er det ingenting å kaskadere
  // etter. Begge tilfellene faller tilbake på hele kodeverket, og begge skal si fra.
  const harTre = tre.length > 0;

  const sakstypeValg = useMemo(
    () => (harTre ? begrensTil(sakstypeOpsjoner, sakstyperITre(tre)) : sakstypeOpsjoner),
    [harTre, tre],
  );

  // Nedtrekkene lenger ned viser bare det som er lovlig sammen med valgene over. Slik
  // slipper admin å sette sammen en kombinasjon som ikke finnes i noen sak.
  const sakstemaValg = useMemo(
    () => (harTre ? begrensTil(sakstemaOpsjoner, sakstemaerFor(tre, sakstyper)) : sakstemaOpsjoner),
    [harTre, tre, sakstyper],
  );

  const behandlingstemaValg = useMemo(
    () =>
      harTre
        ? begrensTil(behandlingstemaOpsjoner, behandlingstemaerFor(tre, sakstyper, sakstemaer))
        : behandlingstemaOpsjoner,
    [harTre, tre, sakstyper, sakstemaer],
  );

  // Når et valg lenger opp snevres inn, ryddes valgene under. Uten dette ville en
  // avgrensning bli stående på en kombinasjon som nå er umulig – usynlig for admin,
  // fordi koden ikke lenger står i nedtrekket. Uten tre er ryddNedover en identitet.
  const endre = (endret: Nivaa, neste: Avgrensning) => {
    const { avgrensning, fjernet, toemte } = ryddNedover(tre, endret, neste);
    setSakstyper(avgrensning.sakstyper);
    setSakstemaer(avgrensning.sakstemaer);
    setBehandlingstemaer(avgrensning.behandlingstemaer);
    const antallFjernet = fjernet.sakstemaer.length + fjernet.behandlingstemaer.length;
    setRyddingsmelding(antallFjernet > 0 ? ryddemelding(endret, { fjernet, toemte }) : null);
  };

  // Nederste nivå: ingenting å rydde under, men meldingen beskriver ikke lenger valget.
  const endreBehandlingstemaer = (nye: string[]) => {
    setBehandlingstemaer(nye);
    setRyddingsmelding(null);
  };

  // Nedtrekkene ville vist hele kodeverket mens treet lastes, og et valg tatt i det
  // vinduet ville sluppet unna oppryddingen – nettopp den feiltilstanden kaskaden
  // finnes for å hindre. Da er det riktigere å vente.
  if (isLoading) {
    return (
      <div className="tekstblokker__kontekst">
        <Loader size="small" title="Henter lovlige kombinasjoner" />
      </div>
    );
  }

  return (
    <div className="tekstblokker__kontekst">
      <BodyShort size="small" textColor="subtle">
        Alle avgrensningene må passe (OG): tekstblokken vises bare der sakstypen, sakstemaet og behandlingstemaet
        stemmer. Et tomt felt betyr alle. Listene nedover viser kun det som er lovlig sammen med valgene over.
      </BodyShort>
      {!harTre && (
        <Alert variant="info" size="small" inline>
          Klarte ikke å hente lovlige kombinasjoner, så listene er ikke begrenset. Avgrensningen kan fortsatt lagres.
        </Alert>
      )}
      {ryddingsmelding && (
        <Alert variant="info" size="small" inline>
          {ryddingsmelding}
        </Alert>
      )}
      <Combobox
        label="Gjelder sakstype"
        description="Tomt betyr at den gjelder alle sakstyper"
        size="small"
        isMultiSelect
        options={sakstypeValg}
        selectedOptions={valgteOpsjoner(sakstypeOpsjoner, sakstyper)}
        onToggleSelected={(verdi, valgt) =>
          endre("sakstype", { sakstyper: toggle(sakstyper, verdi, valgt), sakstemaer, behandlingstemaer })
        }
        placeholder="Velg sakstype…"
      />
      <Combobox
        label="Gjelder sakstema"
        description="Tomt betyr at den gjelder alle sakstemaer"
        size="small"
        isMultiSelect
        options={sakstemaValg}
        selectedOptions={valgteOpsjoner(sakstemaOpsjoner, sakstemaer)}
        onToggleSelected={(verdi, valgt) =>
          endre("sakstema", { sakstyper, sakstemaer: toggle(sakstemaer, verdi, valgt), behandlingstemaer })
        }
        placeholder="Velg sakstema…"
      />
      <Combobox
        label="Gjelder behandlingstema"
        description="Tomt betyr at den gjelder alle behandlingstemaer"
        size="small"
        isMultiSelect
        options={behandlingstemaValg}
        selectedOptions={valgteOpsjoner(behandlingstemaOpsjoner, behandlingstemaer)}
        onToggleSelected={(verdi, valgt) => endreBehandlingstemaer(toggle(behandlingstemaer, verdi, valgt))}
        placeholder="Velg behandlingstema…"
      />
    </div>
  );
}

export default Kontekstavgrensning;
