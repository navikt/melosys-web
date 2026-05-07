import "../vurderingAarsavregningInngang.less";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { ÅRSAVREGNING_EØS_PENSJONIST } from "../../../../../featuretoggle/toggleNavn";
import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";

interface InnbetaltTrygdeavgiftInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  redigerbart: boolean;
  erNyAarsavregning: boolean;
  harTidligereTrygdeavgiftsgrunnlag: boolean;
}

export function InnbetaltTrygdeavgiftInput({
  control,
  redigerbart,
  erNyAarsavregning,
  harTidligereTrygdeavgiftsgrunnlag,
}: InnbetaltTrygdeavgiftInputProps) {
  const UTEN_GRUNNLAG_HJELPETEKST = (
    <p>
      Oppgi innbetalt avgift. Dette kan f.eks. være avgift fakturert fra Avgiftssystemet eller avgift som har blitt
      manuelt fakturert. Hvis personen ikke har innbetalt noe, skrive 0,-
    </p>
  );

  const innbetaltTrygdeavgiftTekst = harTidligereTrygdeavgiftsgrunnlag ? (
    "Innbetalt trygdeavgift"
  ) : (
    <LabelMedHjelpetekst label="Innbetalt trygdeavgift" hjelpetekst={UTEN_GRUNNLAG_HJELPETEKST} />
  );

  const innbetaltTrygdeavgiftLabel = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST)
    ? innbetaltTrygdeavgiftTekst
    : "Trygdeavgift fra Avgiftssystemet";

  return (
    <Forms.Input
      label={innbetaltTrygdeavgiftLabel}
      description={erNyAarsavregning ? "Du skal kun endre hvis tidligere oppgitte beløp er feil" : ""}
      name="innbetaltTrygdeavgift"
      control={control}
      readOnly={!redigerbart}
      className="avgift_input"
      autoComplete="off"
      type="text"
      numeric
    />
  );
}
