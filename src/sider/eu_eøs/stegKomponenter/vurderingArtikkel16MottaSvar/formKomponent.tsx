import MKV from "../../../../melosyskodeverk";
import * as Utils from "../../../../utils";
import { lagAnmodningsperiodesvar } from "../../../../felleskomponenter/stegvelger";
import { useCallback, useEffect } from "react";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import { getFormValues, reduxForm } from "redux-form";
import * as KV from "../../../../kodeverk";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurderingArtikkel16MottaSvarSchema from "./vurderingArtikkel16MottaSvarSchema";
import {
  anmodningsperiodesvarOperations,
  anmodningsperiodesvarSelectors,
} from "../../../../ducks/anmodningsperiodesvar";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";
import { RootState } from "AppTypes";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";
import { AnmodningsperiodesvarResDto } from "../../../../services/modules/anmodningsperioder/svar/svar";

const { INNVILGELSE, DELVIS_INNVILGELSE, AVSLAG } = MKV.Koder.anmodningsperiodesvartyper;

interface FormValuesProps {
  anmodningsperiodeSvarType: string;
  endretPeriode: {
    fom: string;
    tom: string;
  };
  begrunnelseFritekst: string;
}

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.ARTIKKEL_16_MOTTA_SVAR)(state) as FormValuesProps,
  initialValues: {
    anmodningsperiodeSvarType: anmodningsperiodesvarSelectors.AnmodningsperiodeSvarTypeSelector(state),
    endretPeriode: {
      fom: Utils.dato.formatterDatoTilNorsk(anmodningsperiodesvarSelectors.EndretPeriodeFomSelector(state)),
      tom: Utils.dato.formatterDatoTilNorsk(anmodningsperiodesvarSelectors.EndretPeriodeTomSelector(state)),
    },
    begrunnelseFritekst: anmodningsperiodesvarSelectors.BegrunnelseFritekstSelector(state),
  },
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type FormKomponentProps = PropsFromRedux & {
  redigerbart: boolean;
  oppdaterData: (data: any) => void;
  soknadsperiode: {
    fom?: string;
    tom?: string;
  };
  formIsValid: boolean;
};

function FormKomponent({ redigerbart, formValues, oppdaterData, formIsValid }: FormKomponentProps) {
  const dispatch = useDispatch();
  const anmodningsperiodeID = useSelector(anmodningsperioderSelectors.AnmodningsperiodeIDSelector);

  const lagreSvar = async (data: FormValuesProps & { formIsValid: boolean }) => {
    if (data.anmodningsperiodeSvarType && data.formIsValid) {
      const sendEndretPeriode = data.anmodningsperiodeSvarType === DELVIS_INNVILGELSE;
      const svar: AnmodningsperiodesvarResDto = {
        anmodningsperiodeSvarType: data.anmodningsperiodeSvarType,
        endretPeriode: {
          fom:
            sendEndretPeriode && data.endretPeriode.fom ? Utils.dato.formatterDatoTilISO(data.endretPeriode.fom) : null,
          tom:
            sendEndretPeriode && data.endretPeriode.tom ? Utils.dato.formatterDatoTilISO(data.endretPeriode.tom) : null,
        },
        begrunnelseFritekst: data.begrunnelseFritekst || null,
      };

      await dispatch(anmodningsperiodesvarOperations.send(anmodningsperiodeID, svar));
      oppdaterData(lagAnmodningsperiodesvar(svar));
    }
  };
  const debouncedLagreSvar = useCallback(Utils._debounce(lagreSvar, 1000), [oppdaterData, lagAnmodningsperiodesvar]);

  useEffect(() => {
    if (redigerbart) {
      debouncedLagreSvar({ ...formValues, formIsValid });
    }
  }, [formValues, formIsValid]);

  if (!formValues) return null;

  const visLovvalgsperiode = formValues.anmodningsperiodeSvarType === DELVIS_INNVILGELSE;
  const visFritekstFelt = [DELVIS_INNVILGELSE, AVSLAG].includes(formValues.anmodningsperiodeSvarType);

  return (
    <form name="anmodningSvar" id="anmodningSvar" onSubmit={(e) => e.preventDefault()}>
      <Nav.Row className="svarFraMyndighetRow">
        <Nav.Column xs="6">
          <Skjema.RadioGroup legend="Svar fra myndighetene" name="anmodningsperiodeSvarType" readOnly={!redigerbart}>
            <Nav.Radio value={INNVILGELSE}>Innvilgelse</Nav.Radio>
            <Nav.Radio value={DELVIS_INNVILGELSE}>Delvis innvilgelse</Nav.Radio>
            <Nav.Radio value={AVSLAG}>Avslag</Nav.Radio>
          </Skjema.RadioGroup>
        </Nav.Column>
      </Nav.Row>
      {visLovvalgsperiode && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Row>
              <Nav.Column xs="6">
                <Skjema.Datovelger label="Startdato" feltNavn="endretPeriode.fom" disabled={!redigerbart} />
              </Nav.Column>
              <Nav.Column xs="6">
                <Skjema.Datovelger label="Sluttdato" feltNavn="endretPeriode.tom" disabled={!redigerbart} />
              </Nav.Column>
            </Nav.Row>
          </Nav.Column>
        </Nav.Row>
      )}
      {visFritekstFelt && (
        <Nav.Row>
          <Nav.Column xs="12">
            <Skjema.Textarea
              feltNavn="begrunnelseFritekst"
              readOnly={!redigerbart}
              label="Begrunnelse"
              maxLength={4000}
            />
          </Nav.Column>
        </Nav.Row>
      )}
    </form>
  );
}

const Artikkel16MottaSvarForm = reduxForm<FormValuesProps, FormKomponentProps>({
  form: KV.Form.ARTIKKEL_16_MOTTA_SVAR,
  enableReinitialize: false,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  touchOnChange: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(vurderingArtikkel16MottaSvarSchema, {
      context: {
        anmodningsperiodeSvarType: props.formValues && props.formValues.anmodningsperiodeSvarType,
        soknadsperiode: props.soknadsperiode,
      },
    })(values),
})(FormKomponent);

export default connector(Artikkel16MottaSvarForm);
