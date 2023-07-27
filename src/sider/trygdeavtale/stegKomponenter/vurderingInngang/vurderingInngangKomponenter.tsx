import { KTObject } from "@navikt/melosys-kodeverk";

export const LandValgSomOptions = ({ landValg }: { landValg: KTObject[] }) => {
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
};
