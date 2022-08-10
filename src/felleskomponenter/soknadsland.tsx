import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../melosyskodeverk";
import { kodeTilTerm } from "../kodeverk";

interface SoknadslandProps {
  land: {
    landkoder: string[];
    erUkjenteEllerAlleEosLand: boolean;
  };
  fulltNavn?: boolean;
  landkoderKodeverk?: KTObject[];
}

const Soknadsland = ({ land, fulltNavn = false, landkoderKodeverk = MKV.KTObjects.landkoder }: SoknadslandProps) => {
  if (!land) return "(ukjent)";

  const { landkoder, erUkjenteEllerAlleEosLand } = land;

  if (erUkjenteEllerAlleEosLand) return "Flere EØS-land/Sveits. Ikke kjent hvilke.";

  if (!landkoder || landkoder.length === 0) return "(ukjent)";

  return fulltNavn ? landkoder.map((l) => kodeTilTerm(l, landkoderKodeverk) || l).join(", ") : landkoder.join(", ");
};

export default Soknadsland;
