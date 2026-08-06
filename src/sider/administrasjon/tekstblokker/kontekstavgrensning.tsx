import { useMemo } from "react";
import { Alert, BodyShort, UNSAFE_Combobox as Combobox } from "@navikt/ds-react";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../melosyskodeverk";
import { useKombinasjonstre } from "../../../services/api/kombinasjonstre";
import {
  alleKoderITre,
  behandlingstemaerFor,
  behold,
  Kodeverdi,
  sakstemaerFor,
  sakstyperITre,
} from "../../../services/modules/lovligekombinasjoner/kombinasjonstre";

interface Opsjon {
  label: string;
  value: string;
}

const tilOpsjoner = (koder: KTObject[]): Opsjon[] =>
  koder.map(({ kode, term }) => ({ label: term ?? kode, value: kode }));

const kodeverdierTilOpsjoner = (koder: Kodeverdi[]): Opsjon[] =>
  koder.map(({ kode, term }) => ({ label: term || kode, value: kode }));

// Hele kodeverket. Brukes til visningsnavn (også for koder som ikke er med i treet) og
// som reserve hvis kombinasjonstreet ikke kan hentes.
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

const toggle = (koder: string[], kode: string, valgt: boolean): string[] =>
  valgt ? [...koder, kode] : koder.filter((k) => k !== kode);

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
  const { data: tre, isError } = useKombinasjonstre();

  // Uten treet mister vi kaskaden, men admin skal fortsatt kunne avgrense. Da faller vi
  // tilbake på hele kodeverket, altså oppførselen fra før kaskaden ble innført.
  const harTre = Boolean(tre && tre.length > 0);
  const kjenteKoder = useMemo(() => (tre ? alleKoderITre(tre) : new Set<string>()), [tre]);

  const sakstypeValg = useMemo(
    () => (harTre ? kodeverdierTilOpsjoner(sakstyperITre(tre!)) : sakstypeOpsjoner),
    [harTre, tre],
  );

  // Nedtrekkene lenger ned viser bare det som er lovlig sammen med valgene over. Slik
  // slipper admin å sette sammen en kombinasjon som ikke finnes i noen sak.
  const sakstemaValg = useMemo(
    () => (harTre ? kodeverdierTilOpsjoner(sakstemaerFor(tre!, sakstyper)) : sakstemaOpsjoner),
    [harTre, tre, sakstyper],
  );

  const behandlingstemaValg = useMemo(
    () =>
      harTre ? kodeverdierTilOpsjoner(behandlingstemaerFor(tre!, sakstyper, sakstemaer)) : behandlingstemaOpsjoner,
    [harTre, tre, sakstyper, sakstemaer],
  );

  // Når et valg lenger opp snevres inn, ryddes valgene under. Uten dette ville en
  // avgrensning bli stående på en kombinasjon som nå er umulig – usynlig for admin,
  // fordi koden ikke lenger står i nedtrekket.
  const endreSakstyper = (nye: string[]) => {
    setSakstyper(nye);
    if (!harTre) return;
    const nyeSakstemaer = behold(sakstemaer, sakstemaerFor(tre!, nye), kjenteKoder);
    setSakstemaer(nyeSakstemaer);
    setBehandlingstemaer(behold(behandlingstemaer, behandlingstemaerFor(tre!, nye, nyeSakstemaer), kjenteKoder));
  };

  const endreSakstemaer = (nye: string[]) => {
    setSakstemaer(nye);
    if (!harTre) return;
    setBehandlingstemaer(behold(behandlingstemaer, behandlingstemaerFor(tre!, sakstyper, nye), kjenteKoder));
  };

  return (
    <div className="tekstblokker__kontekst">
      <BodyShort size="small" textColor="subtle">
        Alle avgrensningene må passe (OG): tekstblokken vises bare der sakstypen, sakstemaet og behandlingstemaet
        stemmer. Et tomt felt betyr alle. Listene nedover viser kun det som er lovlig sammen med valgene over.
      </BodyShort>
      {isError && (
        <Alert variant="info" size="small" inline>
          Klarte ikke å hente lovlige kombinasjoner, så listene er ikke begrenset. Avgrensningen kan fortsatt lagres.
        </Alert>
      )}
      <Combobox
        label="Gjelder sakstype"
        description="Tomt betyr at den gjelder alle sakstyper"
        size="small"
        isMultiSelect
        options={sakstypeValg}
        selectedOptions={valgteOpsjoner(sakstypeOpsjoner, sakstyper)}
        onToggleSelected={(verdi, valgt) => endreSakstyper(toggle(sakstyper, verdi, valgt))}
        placeholder="Velg sakstype…"
      />
      <Combobox
        label="Gjelder sakstema"
        description="Tomt betyr at den gjelder alle sakstemaer"
        size="small"
        isMultiSelect
        options={sakstemaValg}
        selectedOptions={valgteOpsjoner(sakstemaOpsjoner, sakstemaer)}
        onToggleSelected={(verdi, valgt) => endreSakstemaer(toggle(sakstemaer, verdi, valgt))}
        placeholder="Velg sakstema…"
      />
      <Combobox
        label="Gjelder behandlingstema"
        description="Tomt betyr at den gjelder alle behandlingstemaer"
        size="small"
        isMultiSelect
        options={behandlingstemaValg}
        selectedOptions={valgteOpsjoner(behandlingstemaOpsjoner, behandlingstemaer)}
        onToggleSelected={(verdi, valgt) => setBehandlingstemaer(toggle(behandlingstemaer, verdi, valgt))}
        placeholder="Velg behandlingstema…"
      />
    </div>
  );
}

export default Kontekstavgrensning;
