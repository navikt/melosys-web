import * as Nav from "../../../../../navFrontend";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import MKV from "../../../../../melosyskodeverk";
import { formaterTilNorskBelopUtenDesimaler } from "../../../../../utils";
import { BeregnetTrygdeavgiftDetaljer } from "./beregnetTrygdeavgiftDetaljer";
import { Aarsavregningsmeldinger } from "./aarsavregningsmeldinger";
import TidligereGrunnlagsoversikt from "./tidligereGrunnlagsoversikt";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";

function getAccordionTittel(
  erManueltBeregnet: boolean,
  harTidligereGrunnlag: boolean,
  aarsavregningResponse: AarsavregningResponse,
): string {
  if (erManueltBeregnet) {
    return `Tidligere grunnlag - ${aarsavregningResponse.aar}`;
  }

  if (harTidligereGrunnlag) {
    const totalInntekt = aarsavregningResponse.tidligereGrunnlagsopplysninger?.avgift?.totalInntekt;
    const formattedInntekt = totalInntekt?.toLocaleString("no-NO") || "Ukjent";
    return `Tidligere grunnlag - Total bruttoinntekt i ${aarsavregningResponse.aar}: ${formattedInntekt} kr`;
  }

  return `Tidligere grunnlag - Ingen informasjon om perioder med medlemskap i ${aarsavregningResponse.aar}`;
}

function renderAccordionContent(
  harTidligereGrunnlag: boolean,
  erManueltBeregnet: boolean,
  aarsavregningResponse: AarsavregningResponse,
  forskuddsvisFakturertTrygdeavgift: boolean,
): JSX.Element {
  if (!harTidligereGrunnlag) {
    return (
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
    );
  }

  if (erManueltBeregnet) {
    return (
      <>
        <MedlemskapsPerioderTabell
          perioder={aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.medlemskapsperioder}
        />

        <div className="tidligereGrunnlagPanel">
          <Nav.Heading size="small" level="3">
            Tidligere beregnet trygdeavgift
          </Nav.Heading>
          <Nav.BodyLong size="small">
            Manuelt beregnet trygdeavgift:{" "}
            <strong>
              {formaterTilNorskBelopUtenDesimaler(
                aarsavregningResponse.tidligereGrunnlagsopplysninger!.tidligereÅrsavregningManueltAvgiftBeloep!,
              )}{" "}
              kr
            </strong>
          </Nav.BodyLong>
        </div>
      </>
    );
  }

  return (
    <>
      <MedlemskapsPerioderTabell
        perioder={aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.medlemskapsperioder}
      />
      <TidligereGrunnlagsoversikt
        skatteforholdsperioder={
          aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.skatteforholdsperioder
        }
        inntektsperioder={aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.inntektskperioder}
        avgift={aarsavregningResponse.tidligereGrunnlagsopplysninger!.avgift}
      />

      {!forskuddsvisFakturertTrygdeavgift && <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />}

      <Nav.Heading size="small" level="3">
        Tidligere beregnet trygdeavgift
      </Nav.Heading>
      <BeregnetTrygdeavgiftDetaljer
        grunnlag={aarsavregningResponse.tidligereGrunnlagsopplysninger!}
        medlemskapsTypeErPliktig={
          aarsavregningResponse.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag.medlemskapsperioder?.every(
            (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
          ) ?? true
        }
      />
    </>
  );
}

interface TidligereGrunnlagAccordionProps {
  aarsavregningResponse: AarsavregningResponse;
}

export function TidligereGrunnlagAccordion({ aarsavregningResponse }: TidligereGrunnlagAccordionProps) {
  const harTidligereGrunnlag = Boolean(aarsavregningResponse.tidligereGrunnlagsopplysninger);

  const erManueltBeregnet = Boolean(
    aarsavregningResponse.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== null,
  );

  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;

  const accordionTittel = getAccordionTittel(erManueltBeregnet, harTidligereGrunnlag, aarsavregningResponse);

  return (
    <Nav.ExpansionCard className="beregnetTrygdeavgiftDetaljer" aria-label="trygdeavgiftdetaljer" size="small">
      <Nav.ExpansionCard.Header className="beregnetTrygdeavgiftDetaljer_header">
        <Nav.ExpansionCard.Title size="small">{accordionTittel}</Nav.ExpansionCard.Title>
      </Nav.ExpansionCard.Header>
      <Nav.ExpansionCard.Content className="tidligereGrunnlagAccordion_content">
        {renderAccordionContent(
          harTidligereGrunnlag,
          erManueltBeregnet,
          aarsavregningResponse,
          forskuddsvisFakturertTrygdeavgift,
        )}
      </Nav.ExpansionCard.Content>
    </Nav.ExpansionCard>
  );
}
