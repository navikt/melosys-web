import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { getFormValues, reduxForm } from "redux-form";

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
import "./vurderingAvklarVirksomhet.less";
import { HJELPETEKST, INGEN_VIRKSOMHETER_TEKST } from "./tekster";

interface FormValuesProps {
  virksomhet?: string;
}

interface Props {
  data: Api.Trygdeavtale.StegData;
  fortsett: () => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  tilbake: () => void;
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat) => void;
  aktivtSteg: boolean;
  initialize: (values: object) => void;
}

function VurderingAvklarVirksomhet({
  data,
  fortsett,
  redigerbart,
  resultat,
  steg,
  oppdaterFlyt,
  tilbake,
  aktivtSteg,
  initialize,
}: Props) {
  const virksomheterListe =
    data?.virksomheter?.map((virksomhet: Api.Trygdeavtale.Virksomhet) => ({
      kode: virksomhet.orgId,
      term: virksomhet.navn,
    })) || [];

  const formValues = useSelector((state: RootState) =>
    getFormValues(KV.Form.Trygdeavtale.AVKLAR_VIRKSOMHET)(state),
  ) as FormValuesProps;

  const formIsValid = useSelector((state: RootState) =>
    formSelectors.TrygdeavtaleAvklarVirksomhetFormValidSelector(state),
  );

  useEffect(() => {
    initialize({
      virksomhet: resultat?.virksomhet,
    });
  }, [resultat?.virksomhet, initialize]);

  useEffect(() => {
    if (redigerbart && formValues && aktivtSteg) {
      oppdaterFlyt({
        ...resultat,
        virksomhet: formValues.virksomhet,
      });
    }
  }, [formValues?.virksomhet, redigerbart, aktivtSteg, oppdaterFlyt, resultat]);

  const harVirksomheter = Array.isArray(virksomheterListe) && virksomheterListe.length > 0;

  return (
    <div className="vurderingAvklarVirksomhet">
      <Nav.Heading level="1" className="stegvelgertittel">
        <LabelMedHjelpetekst label="Virksomhet" bold />
      </Nav.Heading>

      {harVirksomheter ? (
        <Skjema.RadioGroup
          legend={<LabelMedHjelpetekst label="Velg virksomhet" hjelpetekst={HJELPETEKST} bold small />}
          hideLegend
          name="virksomhet"
          readOnly={!redigerbart}
        >
          {virksomheterListe.map((virksomhet) => (
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
}

const VurderingAvklarVirksomhetForm = reduxForm<FormValuesProps, Props>({
  form: KV.Form.Trygdeavtale.AVKLAR_VIRKSOMHET,
  destroyOnUnmount: true,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_avklar_virksomhet),
})(VurderingAvklarVirksomhet);

export default VurderingAvklarVirksomhetForm;
