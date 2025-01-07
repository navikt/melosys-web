import { KTObject } from "@navikt/melosys-kodeverk";

export function LandValgSomOptions({ landValg }: { landValg: KTObject[] }) {
  if (!landValg) return null;
  return (
    <>
      {landValg.map(({ kode, term }) => (
        <option key={kode} value={kode}>
          {term}
        </option>
      ))}
    </>
  );
}
