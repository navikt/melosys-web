import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { reduxForm, getFormValues } from "redux-form";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { formSelectors } from "../../../../ducks/form";
import { StegStatus } from "../../stegvelger";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_avklar_virksomhet from "./vurderingAvklarVirksomhetSchema";
import "./vurderingAvklarVirksomhet.css";
import { HJELPETEKST, INGEN_VIRKSOMHETER_TEKST } from "./tekster";

const mapStateToProps = (state: RootState, ownProps: Props) => ({
  virksomheterListe:
    ownProps.data?.virksomheter?.map((virksomhet: Api.Trygdeavtale.Virksomhet) => ({
      kode: virksomhet.orgId,
      term: virksomhet.navn,
    })) || [],
  formValues: getFormValues(KV.Form.Trygdeavtale.AVKLAR_VIRKSOMHET)(state),
  initialValues: {
    virksomhet: ownProps.resultat?.virksomhet,
  },
  formIsValid: formSelectors.TrygdeavtaleAvklarVirksomhetFormValidSelector(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  virksomhet?: string;
}
interface Props {
  data: Api.Trygdeavtale.StegData;
  fortsett: () => void;
  formValues: FormValuesProps;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  tilbake: () => void;
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat) => void;
  aktivtSteg: boolean;
}

const VurderingAvklarVirksomhet = ({
  formValues,
  formIsValid,
  fortsett,
  redigerbart,
  resultat,
  steg,
  oppdaterFlyt,
  tilbake,
  virksomheterListe,
  aktivtSteg,
}: PropsFromRedux & Props) => {
  useEffect(() => {
    if (redigerbart && formValues && aktivtSteg) {
      oppdaterFlyt({
        ...resultat,
        virksomhet: formValues.virksomhet,
      });
    }
  }, [formValues?.virksomhet]);

  return (
    <div className="vurderingAvklarVirksomhet">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        <LabelMedHjelpetekst label="Virksomhet" bold />
      </Nav.Typo.Innholdstittel>

      {virksomheterListe?.length !== 0 ? (
        <Skjema.RadioGroup
          legend={<LabelMedHjelpetekst label="Velg virksomhet" hjelpetekst={HJELPETEKST} bold small />}
          hideLegend
          name="virksomhet"
          readOnly={!redigerbart}
        >
          {virksomheterListe?.map((virksomhet) => (
            <Nav.Radio key={virksomhet.kode} value={virksomhet.kode}>
              {virksomhet.term}
            </Nav.Radio>
          ))}
        </Skjema.RadioGroup>
      ) : (
        <Nav.Alert variant="error" className="alertstripe">
          {INGEN_VIRKSOMHETER_TEKST}
        </Nav.Alert>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fortsett,
          disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};

const VurderingAvklarVirksomhetForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.AVKLAR_VIRKSOMHET,
  destroyOnUnmount: true,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_avklar_virksomhet),
})(VurderingAvklarVirksomhet);

export default connector(VurderingAvklarVirksomhetForm);
