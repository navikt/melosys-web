import { Avgift } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { InntektskildeDto, SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import * as Utils from "../../../../../utils";
import InntektsperioderTabell from "./inntektsperioderTabell";
import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";

interface Props {
  skatteforholdsperioder?: SkatteforholdDto[];
  inntektsperioder?: InntektskildeDto[];
  avgift?: Avgift;
  erHelseutgiftDekkesPeriode?: boolean;
}

function GrunnlagTabeller({ skatteforholdsperioder, inntektsperioder, avgift, erHelseutgiftDekkesPeriode }: Props) {
  if (Utils._isEmpty(skatteforholdsperioder) && Utils._isEmpty(inntektsperioder)) return null;
  const harGrunnlagAvgift = avgift && avgift.totalAvgift > 0;

  return (
    <>
      <SkatteforholdsPerioderTabell perioder={skatteforholdsperioder} />
      {harGrunnlagAvgift && (
        <InntektsperioderTabell
          erHelseutgiftDekkesPeriode={erHelseutgiftDekkesPeriode}
          perioder={inntektsperioder}
          avgift={avgift}
        />
      )}
    </>
  );
}

export default GrunnlagTabeller;
