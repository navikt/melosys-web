import React, { useEffect } from "react";
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
      <Nav.Typo.Undertittel className="undertittel">
        <LabelMedHjelpetekst label="Velg virksomhet" hjelpetekst={HJELPETEKST} hjelpetekstClassName="hjelpetekst" />
      </Nav.Typo.Undertittel>

      {virksomheterListe?.length !== 0 ? (
        <Skjema.RadioGruppe feltNavn="virksomhet" label="">
          {virksomheterListe?.map((virksomhet) => (
            <Skjema.Radio
              feltNavn="virksomhet"
              label={virksomhet.term}
              key={virksomhet.kode}
              value={virksomhet.kode}
              disabled={!redigerbart}
            />
          ))}
        </Skjema.RadioGruppe>
      ) : (
        <Nav.AlertStripeFeil className="alertstripe">{INGEN_VIRKSOMHETER_TEKST}</Nav.AlertStripeFeil>
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
