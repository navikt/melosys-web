import { InntektskildeDto, SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import * as Nav from "../../../../../navFrontend";
import { Avgift } from "../../../../../services/modules/aarsavregning/aarsavregning";
import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import InntektsperioderTabell from "./inntektsperioderTabell";
import "./tidligereGrunnlagsoversikt.css";

interface Props {
  harFakturerbareInntektskilder: boolean;
  skatteforholdsperioder?: SkatteforholdDto[];
  inntektsperioder?: InntektskildeDto[];
  avgift?: Avgift;
}

function TidligereGrunnlagsoversikt({
  harFakturerbareInntektskilder,
  skatteforholdsperioder,
  inntektsperioder,
  avgift,
}: Props) {
  if (!skatteforholdsperioder) return null;

  return (
    <div className="tidligereGrunnlagsoversikt">
      <Nav.Heading size="small">Inntekts- og skatteopplysninger for tidligere beregnet trygdeavgift</Nav.Heading>
      <SkatteforholdsPerioderTabell perioder={skatteforholdsperioder} />
      {harFakturerbareInntektskilder && <InntektsperioderTabell perioder={inntektsperioder} avgift={avgift} />}
    </div>
  );
}

export default TidligereGrunnlagsoversikt;
