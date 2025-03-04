import { InntektskildeDto, SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import * as Nav from "../../../../../navFrontend";
import { Avgift } from "../../../../../services/modules/aarsavregning/aarsavregning";
import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import InntektsperioderTabell from "./inntektsperioderTabell";
import "./tidligereGrunnlagsoversikt.css";

interface Props {
  skatteforholdsperioder?: SkatteforholdDto[];
  inntektsperioder?: InntektskildeDto[];
  avgift?: Avgift;
}

function TidligereGrunnlagsoversikt({ skatteforholdsperioder, inntektsperioder, avgift }: Props) {
  if (!skatteforholdsperioder && !inntektsperioder) return null;
  const harGrunnlagAvgift = avgift && avgift.totalAvgift > 0;

  return (
    <div className="tidligereGrunnlagsoversikt">
      <Nav.Heading size="small">Inntekts- og skatteopplysninger for tidligere beregnet trygdeavgift</Nav.Heading>
      <SkatteforholdsPerioderTabell perioder={skatteforholdsperioder} />
      {harGrunnlagAvgift && <InntektsperioderTabell perioder={inntektsperioder} avgift={avgift} />}
    </div>
  );
}

export default TidligereGrunnlagsoversikt;
