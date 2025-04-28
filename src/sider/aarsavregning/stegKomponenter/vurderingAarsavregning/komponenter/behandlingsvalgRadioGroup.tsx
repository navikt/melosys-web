import { useId } from "react";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../navFrontend";
import MKV from "../../../../../melosyskodeverk";

const { OPPLYSNINGER_ENDRET, OPPLYSNINGER_UENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.aarsavregningBehandlingsvalg;

interface BehandlingsvalgRadioGroupProps {
  control: Control<any>;
  redigerbart: boolean;
  behandlingsvalg: string;
  handleBehandlingsvalgChange: (value: string) => void;
  debouncedOppdaterManueltAvgiftBeloep: (value: string) => void;
}

export function BehandlingsvalgRadioGroup({
  control,
  redigerbart,
  behandlingsvalg,
  handleBehandlingsvalgChange,
  debouncedOppdaterManueltAvgiftBeloep,
}: BehandlingsvalgRadioGroupProps) {
  const manueltAvgiftBeloepId = useId();

  return (
    <>
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
        <Nav.Radio value={OPPLYSNINGER_ENDRET}>
          <b>Jeg skal gjøre endringer.</b> Inntekts- og/eller skatteopplysningene er endret siden tidligere beregning
        </Nav.Radio>
        <Nav.Radio value={OPPLYSNINGER_UENDRET}>
          <b>Det er ingen endringer.</b> Inntekts- og skatteopplysningene er like som ved tidligere beregning
        </Nav.Radio>
        <Nav.Radio value={MANUELL_ENDELIG_AVGIFT}>
          <b>Jeg skal oppgi endelig avgift selv.</b> Endelig trygdeavgift er manuelt beregnet utenfor Melosys
        </Nav.Radio>
      </Forms.RadioGroup>

      {behandlingsvalg === MANUELL_ENDELIG_AVGIFT && (
        <Forms.Input
          label="Endelig beregnet trygdeavgift"
          name="manueltAvgiftBeloep"
          control={control}
          readOnly={!redigerbart}
          className="avgift_input"
          autoComplete="off"
          type="text"
          numeric
          tillattNegativeTall
          onChange={debouncedOppdaterManueltAvgiftBeloep}
          key={manueltAvgiftBeloepId}
        />
      )}
    </>
  );
}
