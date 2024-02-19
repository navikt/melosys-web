import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../melosyskodeverk";
import { kodeTilTerm } from "../kodeverk";

interface SoknadslandProps {
  land: {
    landkoder: string[];
    flereLandUkjentHvilke: boolean;
  };
  visFulltNavn?: boolean;
  landkoderKodeverk?: KTObject[];
}

const Soknadsland = ({ land, visFulltNavn = false, landkoderKodeverk = MKV.KTObjects.landkoder }: SoknadslandProps) => {
  if (!land) return "(ukjent)";

  const { landkoder, flereLandUkjentHvilke } = land;

  if (flereLandUkjentHvilke) return "Flere EØS-land/Sveits. Ikke kjent hvilke.";

  if (!landkoder || landkoder.length === 0) return "(ukjent)";
  const mapOmTilFulltNavn = (landkode: string) => kodeTilTerm(landkode, landkoderKodeverk) || landkode;

  return visFulltNavn ? landkoder.map(mapOmTilFulltNavn).join(", ") : landkoder.join(", ");
};

export default Soknadsland;
