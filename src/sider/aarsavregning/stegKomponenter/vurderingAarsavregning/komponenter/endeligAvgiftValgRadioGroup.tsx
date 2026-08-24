import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";

const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

interface EndeligAvgiftValgRadioGroupProps {
  control: Control<any>;
  redigerbart: boolean;
  handleEndeligAvgiftValgChange: (value: string) => void;
  endeligAvgiftValg?: string;
}

export function EndeligAvgiftValgRadioGroup({
  control,
  redigerbart,
  handleEndeligAvgiftValgChange,
  endeligAvgiftValg,
}: EndeligAvgiftValgRadioGroupProps) {
  return (
    <div className="endeligAvgiftValg_radio_group">
      <Nav.Heading level="2" className="aarsavregning_seksjon_heading">
        Endelig beregnet trygdeavgift
      </Nav.Heading>
      <Forms.RadioGroup
        name="endeligAvgiftValg"
        control={control}
        legend=""
        hideLegend
        readOnly={!redigerbart}
        onChange={(value) => {
          handleEndeligAvgiftValgChange(value);
        }}
      >
        <Nav.HStack gap="4" align="center">
          <Nav.Radio value={OPPLYSNINGER_ENDRET} className={endeligAvgiftValg === OPPLYSNINGER_ENDRET ? "checked" : ""}>
            Beregn endelig trygdeavgift
          </Nav.Radio>
          <Nav.Radio
            value={MANUELL_ENDELIG_AVGIFT}
            className={endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT ? "checked" : ""}
          >
            Oppgi endelig beregnet trygdeavgift
          </Nav.Radio>
        </Nav.HStack>
      </Forms.RadioGroup>
    </div>
  );
}
