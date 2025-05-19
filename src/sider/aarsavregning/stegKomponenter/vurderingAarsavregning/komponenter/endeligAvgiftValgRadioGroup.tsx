import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";

const { OPPLYSNINGER_ENDRET, OPPLYSNINGER_UENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

interface EndeligAvgiftValgRadioGroupProps {
  control: Control<any>;
  redigerbart: boolean;
  handleEndeligAvgiftValgChange: (value: string) => void;
  erMedGrunnlagFlyt: boolean;
}

export function EndeligAvgiftValgRadioGroup({
  control,
  redigerbart,
  handleEndeligAvgiftValgChange,
  erMedGrunnlagFlyt,
}: EndeligAvgiftValgRadioGroupProps) {
  const radioOptions = [
    {
      value: OPPLYSNINGER_ENDRET,
      label: <b>{erMedGrunnlagFlyt ? "Jeg skal gjøre endringer." : "Jeg skal registrere opplysninger."}</b>,
      description: erMedGrunnlagFlyt
        ? " Inntekts- og/eller skatteopplysningene er endret siden tidligere beregning"
        : " Endelig trygdeavgift beregnes i Melosys",
    },
    {
      value: OPPLYSNINGER_UENDRET,
      label: <b>Det er ingen endringer.</b>,
      description: " Inntekts- og skatteopplysningene er like som ved tidligere beregning",
    },
    {
      value: MANUELL_ENDELIG_AVGIFT,
      label: <b>Jeg skal oppgi endelig avgift.</b>,
      description: " Endelig trygdeavgift er manuelt beregnet utenfor Melosys",
    },
  ];

  const filteredOptions = erMedGrunnlagFlyt
    ? radioOptions
    : radioOptions.filter((option) => option.value !== OPPLYSNINGER_UENDRET);

  return (
    <div className="endeligAvgiftValg_radio_group">
      <Forms.RadioGroup
        name="endeligAvgiftValg"
        control={control}
        legend="Hva ønsker du å gjøre?"
        readOnly={!redigerbart}
        onChange={(value) => {
          handleEndeligAvgiftValgChange(value);
        }}
      >
        {filteredOptions.map((option) => (
          <Nav.Radio key={option.value} value={option.value}>
            {option.label}
            {option.description}
          </Nav.Radio>
        ))}
      </Forms.RadioGroup>
    </div>
  );
}
