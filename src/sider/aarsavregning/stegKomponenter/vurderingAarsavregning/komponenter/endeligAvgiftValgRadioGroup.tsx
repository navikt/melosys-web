import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { ÅRSAVREGNING_EØS_PENSJONIST } from "../../../../../featuretoggle/toggleNavn";

const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT, OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET } =
  MKV.Koder.endeligAvgiftValg;

interface EndeligAvgiftValgRadioGroupProps {
  control: Control<any>;
  redigerbart: boolean;
  handleEndeligAvgiftValgChange: (value: string) => void;
  endeligAvgiftValg?: string;
  endretPeriodeFraAvgiftssystemetValg?: boolean;
  harInnbetaltTrygdeavgift?: boolean;
  harTidligereTrygdeavgiftsgrunnlag?: boolean;
}

export function EndeligAvgiftValgRadioGroup({
  control,
  redigerbart,
  handleEndeligAvgiftValgChange,
  endeligAvgiftValg,
  endretPeriodeFraAvgiftssystemetValg,
  harInnbetaltTrygdeavgift,
  harTidligereTrygdeavgiftsgrunnlag,
}: EndeligAvgiftValgRadioGroupProps) {
  const erPensjonistEØSToggleEnabled = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST);
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
            Beregn trygdeavgiften
          </Nav.Radio>
          <Nav.Radio
            value={MANUELL_ENDELIG_AVGIFT}
            className={endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT ? "checked" : ""}
          >
            Oppgi beløp for beregnet trygdeavgift
          </Nav.Radio>
          {erPensjonistEØSToggleEnabled &&
            endretPeriodeFraAvgiftssystemetValg &&
            harInnbetaltTrygdeavgift &&
            harTidligereTrygdeavgiftsgrunnlag !== false && (
              <Nav.Radio
                value={OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET}
                className={`endeligAvgiftValg_radio_lang ${
                  endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET ? "checked" : ""
                }`}
              >
                Beregn trygdeavgift med periode fra avgiftssystemet
              </Nav.Radio>
            )}
        </Nav.HStack>
      </Forms.RadioGroup>
    </div>
  );
}
