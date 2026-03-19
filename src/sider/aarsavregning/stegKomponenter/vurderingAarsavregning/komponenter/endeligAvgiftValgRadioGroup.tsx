import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { MELOSYS_PENSJONIST_EØS } from "../../../../../featuretoggle/toggleNavn";

const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT, OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET } =
  MKV.Koder.endeligAvgiftValg;

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
  const erPensjonistEØSToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST_EØS);

  return (
    <div className="endeligAvgiftValg_radio_group">
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
        <Nav.HStack gap="4">
          <Nav.Radio value={OPPLYSNINGER_ENDRET} className={endeligAvgiftValg === OPPLYSNINGER_ENDRET ? "checked" : ""}>
            Beregn endelig trygdeavgift
          </Nav.Radio>
          {erPensjonistEØSToggleEnabled && (
            <Nav.Radio
              value={OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET}
              className={endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET ? "checked" : ""}
            >
              Beregn trygdeavgift med periode fra avgiftssystemet
            </Nav.Radio>
          )}
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
