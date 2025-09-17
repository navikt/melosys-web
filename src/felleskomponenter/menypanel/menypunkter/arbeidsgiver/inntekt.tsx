import * as Utils from "../../../../utils";
import TabellArbeidsgiver from "./tabellArbeidsgiver";

import "./inntekt.less";

interface InntektItem {
  opplysningspliktigID?: string;
  levereringstidspunkt?: string;
  utbetaltIPeriode?: string;
  inntektsperiodetype?: string;
  inntektskilde?: string;
  fordel?: string;
  beloep: number;
  inntektsstatus?: string;
  utloeserArbeidsgiveravgift?: boolean;
  opptjeningsland?: string;
  informasjonsstatus?: string;
  virksomhetID?: string;
  beskrivelse?: string;
  inntektsmottakerID?: string;
  inngaarIGrunnlagForTrekk?: boolean;
  aarMaaned: string;
  opptjeningsperiode?: {
    fom?: string;
    tom?: string;
  };
}

interface InntektProps {
  inntektListe?: InntektItem[];
}

function Inntekt({ inntektListe = [] }: InntektProps) {
  if (!inntektListe) return null;

  const harMinstEnInntekt = inntektListe.some((inntekt) => inntekt.beloep > 0);

  if (!harMinstEnInntekt) return null;

  const omvendtInntektListe = [...inntektListe].reverse();

  const inntektArrayed = omvendtInntektListe.map((linje) => [
    Utils.dato.formatterKortDatoTilNorsk(linje.aarMaaned),
    Utils._round(linje.beloep, 2).toString(),
  ]);

  return (
    <div className="inntekt">
      <TabellArbeidsgiver kolonneNavn={["Periode", "Samlet inntekt"]} tabellData={inntektArrayed} linjerPerSide={6} />
    </div>
  );
}

export default Inntekt;
