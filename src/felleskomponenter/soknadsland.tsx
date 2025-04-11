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
  if (!land) return "";

  const { landkoder, flereLandUkjentHvilke } = land;

  if (flereLandUkjentHvilke) return "Flere land. Ikke kjent hvilke.";

  if (!landkoder || landkoder.length === 0) return "-";
  const mapOmTilFulltNavn = (landkode: string) => kodeTilTerm(landkode, landkoderKodeverk) || landkode;

  return visFulltNavn ? landkoder.map(mapOmTilFulltNavn).join(", ") : landkoder.join(", ");
};

export default Soknadsland;
