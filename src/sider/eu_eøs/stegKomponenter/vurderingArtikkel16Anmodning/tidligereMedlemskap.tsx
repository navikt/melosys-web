import { formatterDatoTilNorsk } from "../../../../utils/dato";
import * as Nav from "../../../../navFrontend";
import { v4 as uuid } from "uuid";
import { FieldArray, WrappedFieldArrayProps } from "redux-form";
import { Medlemsperiode } from "../../../../services/modules/behandlinger/behandling";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { behandlingsperioderOperations } from "../../../../ducks/behandlingsperioder";

type TidligereMedlemskapsperioderProps = TidligereMedlemskapProps & WrappedFieldArrayProps<number>;
const TidligereMedlemskapsperioder = ({ medlemskap, redigerbart, fields, land }: TidligereMedlemskapsperioderProps) => {
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

  if (!medlemskap?.perioderMed) return null;
  return (
    <Nav.CheckboxGroup
      legend={`Velg direkte forutgående perioder i ${land}`}
      readOnly={!redigerbart}
      defaultValue={alleValgtePeriodeID}
    >
      {medlemskap?.perioderMed?.map((periodeMed) => {
        const { periodeID, periode } = periodeMed;
        return (
          <Nav.Checkbox key={uuid()} value={periodeID} onChange={() => onChange(periodeID)}>
            {`Periode: ${formatterDatoTilNorsk(periode.fom)} - ${formatterDatoTilNorsk(periode.tom)}`}
          </Nav.Checkbox>
        );
      })}
    </Nav.CheckboxGroup>
  );
};

interface TidligereMedlemskapProps {
  redigerbart: boolean;
  medlemskap: {
    perioderMed?: Medlemsperiode[];
    perioderUten?: Medlemsperiode[];
    perioderUavklart?: Medlemsperiode[];
  };
  land: string;
}

const TidligereMedlemskap = (props: TidligereMedlemskapProps) => (
  <FieldArray name="tidligeremedlemskap" component={TidligereMedlemskapsperioder} {...props} />
);

export default TidligereMedlemskap;
