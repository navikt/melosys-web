import { InntektskildeDto, SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import * as Nav from "../../../../../navFrontend";
import { Avgift } from "../../../../../services/modules/aarsavregning/aarsavregning";
import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import InntektsperioderTabell from "./inntektsperioderTabell";
import "./tidligereGrunnlagsoversikt.css";

const TidligereGrunnlagsoversikt = ({
  skatteforholdsperioder,
  inntektsperioder,
  avgift,
}: {
  skatteforholdsperioder?: SkatteforholdDto[];
  inntektsperioder?: InntektskildeDto[];
  avgift?: Avgift;
}) => {
  if (!skatteforholdsperioder) return null;

  return (
    <div className="tidligereGrunnlagsoversikt">
      <Nav.Heading size="small">Inntekts- og skatteopplysninger for tidligere beregnet trygdeavgift</Nav.Heading>
      <SkatteforholdsPerioderTabell perioder={skatteforholdsperioder} />
      <InntektsperioderTabell perioder={inntektsperioder} avgift={avgift} />
    </div>
  );
};

export default TidligereGrunnlagsoversikt;
