import { formatterDatoTilNorsk } from "../../../../utils/dato";
import * as Mui from "../../../../felleskomponenter/ui";
import { v4 as uuid } from "uuid";
import { FieldArray, WrappedFieldArrayProps } from "redux-form";
import { Medlemsperiode } from "../../../../services/modules/behandlinger/behandling";

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
  oppdaterOgLagreBehandlinger: any;
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
