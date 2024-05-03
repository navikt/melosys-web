import { formatterDatoTilNorsk } from "../../../../utils/dato";
import * as Mui from "../../../../felleskomponenter/ui";
import { v4 as uuid } from "uuid";
import { FieldArray, WrappedFieldArrayProps } from "redux-form";
import { Medlemsperiode } from "../../../../services/modules/behandlinger/behandling";

interface TidligereMedlemsperiodeLinjeProps {
  checked: boolean;
  onChange: (periodeID: number) => void;
  periodeMed: Medlemsperiode;
  redigerbart: boolean;
}

const TidligereMedlemsperiodeLinje = ({
  periodeMed,
  onChange,
  checked,
  redigerbart,
}: TidligereMedlemsperiodeLinjeProps) => {
  const { periodeID, periode } = periodeMed;
  const label = `Periode: ${formatterDatoTilNorsk(periode.fom)} - ${formatterDatoTilNorsk(periode.tom)}`;

  return <Mui.Checkbox disabled={!redigerbart} onCheck={() => onChange(periodeID)} label={label} checked={checked} />;
};

type TidligereMedlemskapsperioderProps = TidligereMedlemskapProps & WrappedFieldArrayProps<number>;
const TidligereMedlemskapsperioder = ({
  medlemskap,
  redigerbart,
  fields,
  oppdaterOgLagreBehandlinger,
}: TidligereMedlemskapsperioderProps) => {
  const alleValgtePeriodeID = fields.getAll() ?? [];

  const onChange = (periodeID: number) => {
    const { push, remove } = fields;
    const eksistererVedPosisjon = alleValgtePeriodeID.findIndex((valgt) => valgt === periodeID);

    if (eksistererVedPosisjon === -1) {
      push(periodeID);
    } else {
      remove(eksistererVedPosisjon);
    }
    oppdaterOgLagreBehandlinger();
  };

  return (
    <div>
      {medlemskap?.perioderMed?.map((periodeMed) => (
        <TidligereMedlemsperiodeLinje
          redigerbart={redigerbart}
          onChange={onChange}
          checked={alleValgtePeriodeID.includes(periodeMed.periodeID)}
          key={uuid()}
          periodeMed={periodeMed}
        />
      ))}
    </div>
  );
};

interface TidligereMedlemskapProps {
  oppdaterOgLagreBehandlinger: any;
  redigerbart: boolean;
  medlemskap: {
    perioderMed?: Medlemsperiode[];
    perioderUten?: Medlemsperiode[];
    perioderUavklart?: Medlemsperiode[];
  };
}

const TidligereMedlemskap = (props: TidligereMedlemskapProps) => (
  <div>
    <FieldArray name="tidligeremedlemskap" component={TidligereMedlemskapsperioder} {...props} />
  </div>
);

export default TidligereMedlemskap;
