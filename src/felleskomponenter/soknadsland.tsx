interface SoknadslandProps {
  land: {
    landkoder: string[];
    erUkjenteEllerAlleEosLand: boolean;
  };
}

const Soknadsland = ({ land }: SoknadslandProps) => {
  if (!land) return "(ukjent)";

  const { landkoder, erUkjenteEllerAlleEosLand } = land;
  if (erUkjenteEllerAlleEosLand) return "Flere EØS-land/Sveits. Ikke kjent hvilke.";

  return landkoder?.length > 0 ? landkoder.join(", ") : "(ukjent)";
};

export default Soknadsland;
