import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { reduxForm, getFormValues } from "redux-form";

import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";
import * as Nav from "../../../navFrontend";

import { formSelectors } from "../../../ducks/form";
import { lagYupToReduxformErrorMapper } from "../../../yup";
import { StegStatus } from "../stegvelger";
import vurdering_avklar_virksomhet from "./vurderingAvklarVirksomhetSchema";

import "./vurderingAvklarVirksomhet.css";

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
  oppdaterFlyt: (data: Api.Trygdeavtale.FlytReqDto) => void;
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
}: PropsFromRedux & Props) => {
  const hjelpetekst =
    "Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. " +
    'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';

  useEffect(() => {
    if (redigerbart && formValues) {
      oppdaterFlyt({
        resultat: { ...resultat, virksomhet: formValues.virksomhet },
      });
    }
  }, [formValues]);

  return (
    <div className="vurderingAvklarVirksomhet">
      <Nav.Typo.Undertittel className="undertittel">
        Velg virksomhet
        <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
          {hjelpetekst}
        </Nav.Hjelpetekst>
      </Nav.Typo.Undertittel>

      <Skjema.RadioGruppe feltNavn="virksomhet" label="">
        {virksomheterListe?.map((virksomhet) => (
          <Skjema.Radio feltNavn="virksomhet" label={virksomhet.term} id={virksomhet.kode} value={virksomhet.kode} />
        ))}
      </Skjema.RadioGruppe>

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
