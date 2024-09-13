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
      <Nav.Typo.Systemtittel>Inntekts- og skatteopplysninger for forskuddsberegningen</Nav.Typo.Systemtittel>
      <SkatteforholdsPerioderTabell perioder={skatteforholdsperioder} />
      <InntektsperioderTabell perioder={inntektsperioder} avgift={avgift} />
    </div>
  );
};

export default TidligereGrunnlagsoversikt;
