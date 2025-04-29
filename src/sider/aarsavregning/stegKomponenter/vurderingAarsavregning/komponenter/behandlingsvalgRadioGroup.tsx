import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";

const { OPPLYSNINGER_ENDRET, OPPLYSNINGER_UENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.aarsavregningBehandlingsvalg;

interface BehandlingsvalgRadioGroupProps {
  control: Control<any>;
  redigerbart: boolean;
  handleBehandlingsvalgChange: (value: string) => void;
  erMedGrunnlagFlyt: boolean;
}

export function BehandlingsvalgRadioGroup({
  control,
  redigerbart,
  handleBehandlingsvalgChange,
  erMedGrunnlagFlyt,
}: BehandlingsvalgRadioGroupProps) {
  const radioOptions = [
    {
      value: OPPLYSNINGER_ENDRET,
      label: <b>Jeg skal gjøre endringer.</b>,
      description: " Inntekts- og/eller skatteopplysningene er endret siden tidligere beregning",
    },
    {
      value: OPPLYSNINGER_UENDRET,
      label: <b>Det er ingen endringer.</b>,
      description: " Inntekts- og skatteopplysningene er like som ved tidligere beregning",
    },
    {
      value: MANUELL_ENDELIG_AVGIFT,
      label: <b>Jeg skal oppgi endelig avgift selv.</b>,
      description: " Endelig trygdeavgift er manuelt beregnet utenfor Melosys",
    },
  ];

  const filteredOptions = erMedGrunnlagFlyt
    ? radioOptions
    : radioOptions.filter((option) => option.value !== OPPLYSNINGER_UENDRET);

  return (
    <Forms.RadioGroup
      name="behandlingsvalg"
      control={control}
      legend="Hva ønsker du å gjøre?"
      readOnly={!redigerbart}
      onChange={(value) => {
        handleBehandlingsvalgChange(value);
      }}
      className="behandlingsvalg_radio_group"
    >
      {filteredOptions.map((option) => (
        <Nav.Radio key={option.value} value={option.value}>
          {option.label}
          {option.description}
        </Nav.Radio>
      ))}
    </Forms.RadioGroup>
  );
}
