import * as Nav from "../../../../../navFrontend";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import MKV from "../../../../../melosyskodeverk";
import { BeregnetTrygdeavgiftDetaljer } from "./beregnetTrygdeavgiftDetaljer";
import { Aarsavregningsmeldinger } from "./aarsavregningsmeldinger";
import TidligereGrunnlagsoversikt from "./tidligereGrunnlagsoversikt";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";

interface TidligereGrunnlagAccordionProps {
  aarsavregningResponse: AarsavregningResponse;
}

export function TidligereGrunnlagAccordion({ aarsavregningResponse }: TidligereGrunnlagAccordionProps) {
  const harTidligereGrunnlag = Boolean(aarsavregningResponse.tidligereGrunnlagsopplysninger);
  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;

  const accordionTittel = harTidligereGrunnlag
    ? `Tidligere grunnlag - Total bruttoinntekt i ${aarsavregningResponse.aar}: ${
        aarsavregningResponse.tidligereGrunnlagsopplysninger?.avgift?.totalInntekt?.toLocaleString("no-NO") || "Ukjent"
      } kr`
    : `Tidligere grunnlag - Ingen informasjon om perioder med medlemskap i ${aarsavregningResponse.aar}`;

  return (
    <Nav.ExpansionCard className="beregnetTrygdeavgiftDetaljer" aria-label="trygdeavgiftdetaljer" size="small">
      <Nav.ExpansionCard.Header className="beregnetTrygdeavgiftDetaljer_header">
        <Nav.ExpansionCard.Title size="small">{accordionTittel}</Nav.ExpansionCard.Title>
      </Nav.ExpansionCard.Header>
      <Nav.ExpansionCard.Content className="beregnetTrygdeavgiftDetaljer_content">
        {harTidligereGrunnlag ? (
          <>
            <MedlemskapsPerioderTabell
              perioder={aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.medlemskapsperioder}
            />
            <TidligereGrunnlagsoversikt
              skatteforholdsperioder={
                aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.skatteforholdsperioder
              }
              inntektsperioder={
                aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.inntektskperioder
              }
              avgift={aarsavregningResponse.tidligereGrunnlagsopplysninger!.avgift}
            />

            {!forskuddsvisFakturertTrygdeavgift && <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />}

            <BeregnetTrygdeavgiftDetaljer
              grunnlag={aarsavregningResponse.tidligereGrunnlagsopplysninger!}
              medlemskapsTypeErPliktig={
                aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.medlemskapsperioder?.every(
                  (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
                ) ?? true
              }
              tittel="Tidligere beregnet trygdeavgift"
            />
          </>
        ) : (
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
      </Nav.ExpansionCard.Content>
    </Nav.ExpansionCard>
  );
}
