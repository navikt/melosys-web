import * as Nav from "../../../../../navFrontend";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import MKV from "../../../../../melosyskodeverk";
import { formaterTilNorskBelopUtenDesimaler } from "../../../../../utils";
import { BeregnetTrygdeavgiftDetaljer } from "./beregnetTrygdeavgiftDetaljer";
import { Aarsavregningsmeldinger } from "./aarsavregningsmeldinger";
import GrunnlagTabeller from "./grunnlagTabeller";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";

interface TidligereGrunnlagAccordionProps {
  aarsavregningResponse: AarsavregningResponse;
}

export function TidligereGrunnlagAccordion({ aarsavregningResponse }: TidligereGrunnlagAccordionProps) {
  const harTidligereGrunnlag = Boolean(aarsavregningResponse.tidligereGrunnlagsopplysninger);

  const erManueltBeregnet = Boolean(
    aarsavregningResponse.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== null &&
      aarsavregningResponse.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== undefined,
  );

  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;

  return (
    <Nav.Box className="tidligereGrunnlag" background="surface-subtle">
      <Nav.Heading size="small" level="3">
        Tidligere grunnlag
      </Nav.Heading>

      {harTidligereGrunnlag && !erManueltBeregnet && (
        <>
          <Nav.BodyLong size="small">
            Brutto årsinntekt:{" "}
            <strong>
              {formaterTilNorskBelopUtenDesimaler(
                aarsavregningResponse.tidligereGrunnlagsopplysninger!.avgift.totalInntekt,
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
                  aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.medlemskapsperioder
                }
              />
              <GrunnlagTabeller
                skatteforholdsperioder={
                  aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.skatteforholdsperioder
                }
                inntektsperioder={
                  aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.inntektskperioder
                }
                avgift={aarsavregningResponse.tidligereGrunnlagsopplysninger!.avgift}
              />

              {!forskuddsvisFakturertTrygdeavgift && (
                <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />
              )}

              <BeregnetTrygdeavgiftDetaljer
                grunnlag={aarsavregningResponse.tidligereGrunnlagsopplysninger!}
                medlemskapsTypeErPliktig={
                  aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.medlemskapsperioder?.every(
                    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
                  ) ?? true
                }
              />
            </Nav.ExpansionCard.Content>
          </Nav.ExpansionCard>
        </>
      )}

      {erManueltBeregnet && (
        <Nav.BodyLong size="small">
          Tidligere beregnet trygdeavgift:{" "}
          <strong>
            {formaterTilNorskBelopUtenDesimaler(
              aarsavregningResponse.tidligereGrunnlagsopplysninger!.tidligereÅrsavregningManueltAvgiftBeloep!,
            )}{" "}
            kr
          </strong>
        </Nav.BodyLong>
      )}

      {!harTidligereGrunnlag && (
        <Nav.Alert variant="info" size="small">
          <Nav.BodyLong size="small">
            Det er ingen informasjon om perioder med medlemskap og forskuddsvis fakturert trygdeavgift i Melosys.
          </Nav.BodyLong>
          <ul>
            <li>
              Hvis trygdeavgiften er forskuddsvis fakturert fra avgiftssystemet, oppgi totalbeløpet som er fakturert.
            </li>
            <li>
              Hvis trygdeavgiften tidligere har vært årsavregnet i avgiftssystemet, oppgi totalbeløpet for endelig
              beregnet trygdeavgift.
            </li>
            <li>Hvis trygdeavgiften ikke er forskuddsvis fakturert, la det være tomt.</li>
          </ul>
        </Nav.Alert>
      )}
    </Nav.Box>
  );
}
