import MKV from "../melosyskodeverk";

const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

export const erBrukerSkattepliktigIHelePerioden = (skatteforholdsperioder: any) => {
  return !skatteforholdsperioder.some((skatteforhold: any) => skatteforhold.skatteplikttype === IKKE_SKATTEPLIKTIG);
};
