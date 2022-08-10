import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../melosyskodeverk";
import { kodeTilTerm } from "../kodeverk";

interface SoknadslandProps {
  land: {
    landkoder: string[];
    erUkjenteEllerAlleEosLand: boolean;
  };
  visFulltNavn?: boolean;
  landkoderKodeverk?: KTObject[];
}

const Soknadsland = ({ land, visFulltNavn = false, landkoderKodeverk = MKV.KTObjects.landkoder }: SoknadslandProps) => {
  if (!land) return "(ukjent)";

  const { landkoder, erUkjenteEllerAlleEosLand } = land;

  if (erUkjenteEllerAlleEosLand) return "Flere EØS-land/Sveits. Ikke kjent hvilke.";

  if (!landkoder || landkoder.length === 0) return "(ukjent)";

  const mapOmTilFulltNavn = (landkode: string) => kodeTilTerm(landkode, landkoderKodeverk) || landkode;

  return visFulltNavn ? landkoder.map(mapOmTilFulltNavn).join(", ") : landkoder.join(", ");
};

export default Soknadsland;
