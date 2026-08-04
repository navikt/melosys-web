import useFeatureToggle from "./useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER, MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "./toggleNavn";

interface PlaceholderToggles {
  tekstblokkerPaa: boolean | undefined;
  dynamiskPlaceholderPaa: boolean | undefined;
  // Backend krever begge: placeholdere er en utvidelse av tekstblokk-funksjonaliteten.
  placeholderAktiv: boolean;
}

// Toggle-paret hører sammen overalt der placeholdere brukes; delt her så en flate ikke kan
// bli hengende igjen på én toggle når kombinasjonen endres.
export const usePlaceholderToggles = (): PlaceholderToggles => {
  const tekstblokkerPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  return {
    tekstblokkerPaa,
    dynamiskPlaceholderPaa,
    placeholderAktiv: Boolean(tekstblokkerPaa && dynamiskPlaceholderPaa),
  };
};

export default usePlaceholderToggles;
