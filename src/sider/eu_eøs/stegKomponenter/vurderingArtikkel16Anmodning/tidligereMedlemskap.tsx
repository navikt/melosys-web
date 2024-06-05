import { formatterDatoTilNorsk } from "../../../../utils/dato";
import * as Mui from "../../../../felleskomponenter/ui";
import { v4 as uuid } from "uuid";
import { FieldArray, WrappedFieldArrayProps } from "redux-form";
import { Medlemsperiode } from "../../../../services/modules/behandlinger/behandling";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { behandlingsperioderOperations } from "../../../../ducks/behandlingsperioder";

type TidligereMedlemskapsperioderProps = TidligereMedlemskapProps & WrappedFieldArrayProps<number>;
const TidligereMedlemskapsperioder = ({ medlemskap, redigerbart, fields }: TidligereMedlemskapsperioderProps) => {
  const dispatch = useDispatch();
  const alleValgtePeriodeID = fields.getAll() ?? [];

  const onChange = (periodeID: number) => {
    const { push, remove } = fields;
    const eksistererVedPosisjon = alleValgtePeriodeID.findIndex((valgt) => valgt === periodeID);

    if (eksistererVedPosisjon === -1) {
      push(periodeID);
    } else {
      remove(eksistererVedPosisjon);
    }
  };

  const oppdaterOgLagreTidligerePerioder = async () => {
    await dispatch(behandlingsperioderOperations.oppdaterPerioderState({ tidligeremedlemskap: alleValgtePeriodeID }));
    await dispatch(behandlingsperioderOperations.lagre());
  };

  useEffect(() => {
    if (redigerbart) oppdaterOgLagreTidligerePerioder();
  }, [alleValgtePeriodeID]);

  return (
    <>
      {medlemskap?.perioderMed?.map((periodeMed) => {
        const { periodeID, periode } = periodeMed;
        return (
          <Mui.Checkbox
            key={uuid()}
            disabled={!redigerbart}
            onCheck={() => onChange(periodeID)}
            label={`Periode: ${formatterDatoTilNorsk(periode.fom)} - ${formatterDatoTilNorsk(periode.tom)}`}
            checked={alleValgtePeriodeID.includes(periodeID)}
          />
        );
      })}
    </>
  );
};

interface TidligereMedlemskapProps {
  redigerbart: boolean;
  medlemskap: {
    perioderMed?: Medlemsperiode[];
    perioderUten?: Medlemsperiode[];
    perioderUavklart?: Medlemsperiode[];
  };
}

const TidligereMedlemskap = (props: TidligereMedlemskapProps) => (
  <FieldArray name="tidligeremedlemskap" component={TidligereMedlemskapsperioder} {...props} />
);

export default TidligereMedlemskap;
