import * as Nav from "../../../../../navFrontend";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import {
  erHelseutgiftdekkesperiode,
  erMedlemskapsperiodeEllerLovvalgsperiode,
  erPeriodeListeHelseutgiftdekkesperiode,
} from "../../../../../services/modules/types/periodeTyper";
import MKV from "../../../../../melosyskodeverk";
import { formaterTilNorskBelopUtenDesimaler } from "../../../../../utils";
import { BeregnetTrygdeavgiftDetaljer } from "./beregnetTrygdeavgiftDetaljer";
import { Aarsavregningsmeldinger } from "./aarsavregningsmeldinger";
import GrunnlagTabeller from "./grunnlagTabeller";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";

interface TidligereGrunnlagProps {
  aarsavregningResponse: AarsavregningResponse;
}

export function TidligereGrunnlag({ aarsavregningResponse }: TidligereGrunnlagProps) {
  const erManueltBeregnet = Boolean(
    aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !==
      null &&
      aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !==
        undefined,
  );

  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;

  const erMedlemskapstypePliktig = () => {
    const alleErHelseutgiftdekkesperioder =
      aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.avgiftspliktigperioder?.every(
        erHelseutgiftdekkesperiode,
      );

    if (alleErHelseutgiftdekkesperioder) {
      return true;
    }

    return (
      aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.avgiftspliktigperioder?.every(
        (periode) =>
          erMedlemskapsperiodeEllerLovvalgsperiode(periode) &&
          periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
      ) ?? true
    );
  };

  return (
    <Nav.Box className="tidligereGrunnlag" background="surface-subtle">
      <Nav.Heading level="2" className="aarsavregning_seksjon_heading">
        Tidligere grunnlag
      </Nav.Heading>

      {!erManueltBeregnet && (
        <>
          <Nav.BodyLong size="small">
            Brutto årsinntekt:{" "}
            <strong>
              {formaterTilNorskBelopUtenDesimaler(
                aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!.avgift.totalInntekt,
              )}{" "}
              kr
            </strong>
          </Nav.BodyLong>
          <Nav.ExpansionCard className="beregnetTrygdeavgiftDetaljer" aria-label="trygdeavgiftdetaljer" size="small">
            <Nav.ExpansionCard.Header className="beregnetTrygdeavgiftDetaljer_header">
              <Nav.ExpansionCard.Title size="small">
                Opplysninger om tidligere beregnet trygdeavgift
              </Nav.ExpansionCard.Title>
            </Nav.ExpansionCard.Header>
            <Nav.ExpansionCard.Content className="tidligereGrunnlagAccordion_content">
              <MedlemskapsPerioderTabell
                perioder={
                  aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!.trygdeavgiftsgrunnlag
                    .avgiftspliktigperioder
                }
              />
              <GrunnlagTabeller
                erHelseutgiftDekkesPeriode={erPeriodeListeHelseutgiftdekkesperiode(
                  aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!.trygdeavgiftsgrunnlag
                    .avgiftspliktigperioder,
                )}
                skatteforholdsperioder={
                  aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!.trygdeavgiftsgrunnlag
                    .skatteforholdsperioder
                }
                inntektsperioder={
                  aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!.trygdeavgiftsgrunnlag
                    .inntektskperioder
                }
                avgift={aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!.avgift}
              />

              {!forskuddsvisFakturertTrygdeavgift && (
                <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />
              )}

              {forskuddsvisFakturertTrygdeavgift && (
                <BeregnetTrygdeavgiftDetaljer
                  grunnlag={aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!}
                  medlemskapsTypeErPliktig={erMedlemskapstypePliktig()}
                />
              )}
            </Nav.ExpansionCard.Content>
          </Nav.ExpansionCard>
        </>
      )}

      {erManueltBeregnet && (
        <Nav.BodyLong size="small">
          Tidligere beregnet trygdeavgift:{" "}
          <strong>
            {formaterTilNorskBelopUtenDesimaler(
              aarsavregningResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger!
                .tidligereÅrsavregningManueltAvgiftBeloep!,
            )}{" "}
            kr
          </strong>
        </Nav.BodyLong>
      )}
    </Nav.Box>
  );
}
