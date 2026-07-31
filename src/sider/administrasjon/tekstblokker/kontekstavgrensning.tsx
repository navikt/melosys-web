import { UNSAFE_Combobox as Combobox } from "@navikt/ds-react";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../melosyskodeverk";

interface Opsjon {
  label: string;
  value: string;
}

const tilOpsjoner = (koder: KTObject[]): Opsjon[] =>
  koder.map(({ kode, term }) => ({ label: term ?? kode, value: kode }));

export const sakstypeOpsjoner = tilOpsjoner(MKV.KTObjects.sakstyper);
export const behandlingstemaOpsjoner = tilOpsjoner(MKV.KTObjects.behandlinger.behandlingstema);

// Faller tilbake til koden, slik at en avgrensning lagret på en kode vi ikke kjenner
// fortsatt vises i stedet for å bli borte.
const term = (opsjoner: Opsjon[], kode: string): string => opsjoner.find((o) => o.value === kode)?.label ?? kode;

export const termForSakstype = (kode: string): string => term(sakstypeOpsjoner, kode);
export const termForBehandlingstema = (kode: string): string => term(behandlingstemaOpsjoner, kode);

const valgteOpsjoner = (opsjoner: Opsjon[], koder: string[]): Opsjon[] =>
  koder.map((kode) => ({ label: term(opsjoner, kode), value: kode }));

const toggle = (koder: string[], kode: string, valgt: boolean): string[] =>
  valgt ? [...koder, kode] : koder.filter((k) => k !== kode);

interface Props {
  sakstyper: string[];
  setSakstyper: (koder: string[]) => void;
  behandlingstemaer: string[];
  setBehandlingstemaer: (koder: string[]) => void;
}

function Kontekstavgrensning({ sakstyper, setSakstyper, behandlingstemaer, setBehandlingstemaer }: Props) {
  return (
    <div className="tekstblokker__kontekst">
      <Combobox
        label="Gjelder sakstype"
        description="Tomt betyr at den gjelder alle sakstyper"
        size="small"
        isMultiSelect
        options={sakstypeOpsjoner}
        selectedOptions={valgteOpsjoner(sakstypeOpsjoner, sakstyper)}
        onToggleSelected={(verdi, valgt) => setSakstyper(toggle(sakstyper, verdi, valgt))}
        placeholder="Velg sakstype…"
      />
      <Combobox
        label="Gjelder behandlingstema"
        description="Tomt betyr at den gjelder alle behandlingstemaer"
        size="small"
        isMultiSelect
        options={behandlingstemaOpsjoner}
        selectedOptions={valgteOpsjoner(behandlingstemaOpsjoner, behandlingstemaer)}
        onToggleSelected={(verdi, valgt) => setBehandlingstemaer(toggle(behandlingstemaer, verdi, valgt))}
        placeholder="Velg behandlingstema…"
      />
    </div>
  );
}

export default Kontekstavgrensning;
