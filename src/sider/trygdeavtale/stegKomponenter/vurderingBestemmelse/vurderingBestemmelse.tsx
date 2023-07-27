import { useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { change, getFormValues, reduxForm, untouch } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";

import { formSelectors } from "../../../../ducks/form";
import { StegStatus } from "../../stegvelger";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_bestemmelse from "./vurderingBestemmelseSchema";

import "./vurderingBestemmelse.css";
import BestemmelseHjelpetekst from "./bestemmelseHjelpetekst/bestemmelseHjelpetekst";
import { TomFlytMelding, UnntakHjelpetekst } from "../../../../felleskomponenter/alertmeldinger";

const { NEI_ANMODE_OM_UNNTAK, NEI_AVSLAG, NEI_SENDE_TIL_DEPARTEMENTET } = KV.Koder.AVTALELAND_UTFALL;

const mapStateToProps = (state: RootState, ownProps: Props) => ({
  formIsValid: formSelectors.TrygdeavtaleBestemmelseFormValidSelector(state),
  formValues: getFormValues(KV.Form.Trygdeavtale.BESTEMMELSE)(state),
  initialValues: {
    vedtak: ownProps.resultat?.vedtak,
    bestemmelse: ownProps.resultat?.bestemmelse,
    tilleggsbestemmelse: Boolean(ownProps.resultat?.tilleggsbestemmelse),
  },
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  resetField: (field: string) => {
    dispatch(change(KV.Form.Trygdeavtale.BESTEMMELSE, field, null));
    dispatch(untouch(KV.Form.Trygdeavtale.BESTEMMELSE, field));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  vedtak?: string;
  bestemmelse?: string;
  tilleggsbestemmelse?: boolean;
}

interface Props {
  data: Api.Trygdeavtale.StegData;
  formValues: FormValuesProps;
  fortsett: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat, callback?: () => void) => void;
  aktivtSteg: boolean;
}

const VurderingBestemmelse = ({
  data: { vedtakValg, bestemmelseValg, tilleggsbestemmelseValg },
  formIsValid,
  formValues,
  fortsett,
  tilbake,
  redigerbart,
  resetField,
  resultat,
  steg,
  oppdaterFlyt,
  aktivtSteg,
}: PropsFromRedux & Props) => {
  const [updatePending, setUpdatePending] = useState(false);

  const skalLagreVedtaksvalg = formValues?.vedtak !== NEI_ANMODE_OM_UNNTAK && formValues?.vedtak !== NEI_AVSLAG;

  useEffect(() => {
    if (redigerbart && formValues && aktivtSteg) {
      setUpdatePending(true);
      oppdaterFlyt(
        {
          ...resultat,
          vedtak: skalLagreVedtaksvalg ? formValues?.vedtak : undefined,
          bestemmelse: formValues?.bestemmelse,
          tilleggsbestemmelse: formValues.tilleggsbestemmelse ? tilleggsbestemmelseValg?.kode : undefined,
        },
        () => setUpdatePending(false)
      );
    }
  }, [formValues?.vedtak, formValues?.bestemmelse, formValues?.tilleggsbestemmelse]);

  if (!formValues) return null;

  return (
    <div className="vurderingBestemmelse">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Bestemmelse og vurdering</Nav.Typo.Innholdstittel>

      <Nav.Fieldset legend="Hva er din vurdering av søknaden?">
        {vedtakValg?.map((valg) => (
          <Skjema.Radio
            key={valg.kode}
            feltNavn="vedtak"
            label={valg.term}
            value={valg.kode}
            disabled={!redigerbart || updatePending || valg.kode === NEI_SENDE_TIL_DEPARTEMENTET}
            onChange={() => {
              resetField("tilleggsbestemmelse");
              resetField("bestemmelse");
            }}
          />
        ))}
      </Nav.Fieldset>

      {formValues?.vedtak && !Utils._isEmpty(bestemmelseValg) && (
        <Nav.Fieldset legend="Velg bestemmelse" className="bestemmelseValg">
          <Nav.Row>
            <Nav.Column xs="10">
              <Skjema.Select
                label=""
                feltNavn="bestemmelse"
                disabled={!redigerbart || updatePending}
                emptyFieldDisabled={!!formValues.bestemmelse}
                onChange={() => resetField("tilleggsbestemmelse")}
              >
                {bestemmelseValg?.map((bestemmelse: KTObject) => (
                  <option key={bestemmelse.kode} value={bestemmelse.kode}>
                    {bestemmelse.term}
                  </option>
                ))}
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      )}

      {formValues?.vedtak && !Utils._isEmpty(tilleggsbestemmelseValg) && (
        <Nav.Row>
          <Nav.Column xs="10">
            <Skjema.Checkbox
              feltNavn="tilleggsbestemmelse"
              label={tilleggsbestemmelseValg?.term}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues?.vedtak === NEI_ANMODE_OM_UNNTAK && (
        <Nav.Row>
          <Nav.Column xs="10" className="unntakTekst">
            <UnntakHjelpetekst />
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues?.vedtak === NEI_AVSLAG && (
        <Nav.Row>
          <Nav.Column xs="10">
            <TomFlytMelding />
          </Nav.Column>
        </Nav.Row>
      )}

      <Nav.Row>
        <Nav.Column xs="10" className="bestemmelseTekst">
          <BestemmelseHjelpetekst bestemmelse={formValues.bestemmelse} />
        </Nav.Column>
      </Nav.Row>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fortsett,
          disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart || updatePending,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};

const VurderingBestemmelseForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.BESTEMMELSE,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_bestemmelse),
})(VurderingBestemmelse);

export default connector(VurderingBestemmelseForm);
