import { useEffect } from "react";
import { RootState } from "AppTypes";
import { getFormValues, reduxForm } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { formSelectors } from "../../../../ducks/form";
import { BOOLSK_STRING } from "../../../../constants";
import { StegStatus } from "../../stegvelger";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_familie from "./vurderingFamilieSchema";

import "./vurderingFamilie.css";
import { HJELPETEKST, OBS_TEKST } from "./tekster";

const initializeFamilieFormValues = (data: Api.Trygdeavtale.StegData, resultat: Api.Trygdeavtale.Resultat) => ({
  barn: {
    fritekst: (resultat.barn && resultat.barn[0]?.begrunnelseFritekst) || "",
    ...Object.fromEntries(
      data.barnValg
        ? data.barnValg.map((barn) => [
            barn.uuid,
            {
              innvilget: Utils.streng.boolTilUppercaseStreng(
                resultat.barn?.find((x: Api.Trygdeavtale.Familiemedlem) => x.uuid === barn.uuid)?.omfattet
              ),
              begrunnelse:
                resultat.barn?.find((x: Api.Trygdeavtale.Familiemedlem) => x.uuid === barn.uuid)?.begrunnelseKode || "",
            },
          ])
        : []
    ),
  },
  ektefelle: data.ektefelleValg
    ? {
        fritekst: resultat.ektefelle?.begrunnelseFritekst || "",
        innvilget: Utils.streng.boolTilUppercaseStreng(resultat.ektefelle?.omfattet),
        begrunnelse: resultat.ektefelle?.begrunnelseKode || "",
      }
    : {},
});

const mapStateToProps = (state: RootState, ownProps: Props) => ({
  formIsValid: formSelectors.TrygdeavtaleFamilieFormValidSelector(state),
  formValues: getFormValues(KV.Form.Trygdeavtale.FAMILIE)(state),
  initialValues: initializeFamilieFormValues(ownProps.data, ownProps.resultat),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FamilieProps {
  innvilget: string | null;
  begrunnelse: string | null;
}

interface BarnProps {
  [key: string]: FamilieProps;
}

interface FormValuesProps {
  barn?: BarnProps & {
    fritekst: string | null;
  };
  ektefelle?: FamilieProps & {
    fritekst: string | null;
  };
}

interface Props {
  data: Api.Trygdeavtale.StegData;
  formValues: FormValuesProps;
  fortsett: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat) => void;
  aktivtSteg: boolean;
}

const VurderingFamilie = ({
  data: {
    barnValg: tilknyttedeBarn,
    barnBegrunnelseValg,
    ektefelleValg: tilknyttetEktefelle,
    ektefelleBegrunnelseValg,
  },
  formIsValid,
  formValues,
  fortsett,
  tilbake,
  redigerbart,
  resultat,
  steg,
  oppdaterFlyt,
  aktivtSteg,
}: PropsFromRedux & Props) => {
  const erIkkeInnvilget = (innvilget?: string | null): boolean => innvilget === BOOLSK_STRING.USANN;
  const finnBarn = (uuid: string, barn?: BarnProps): undefined | FamilieProps => barn && barn[uuid];

  const oppdaterFlytMedFamilie = () => {
    if (!redigerbart || !formValues?.barn || !formValues?.ektefelle || !aktivtSteg) return;
    oppdaterFlyt({
      ...resultat,
      barn:
        tilknyttedeBarn && !Utils._isEmpty(tilknyttedeBarn)
          ? [
              ...tilknyttedeBarn.map((barn) => ({
                uuid: barn?.uuid || "",
                omfattet: Utils.streng.uppercaseStrengTilBool(finnBarn(barn?.uuid, formValues.barn)?.innvilget),
                begrunnelseKode: finnBarn(barn?.uuid, formValues.barn)?.begrunnelse || null,
                begrunnelseFritekst: formValues.barn?.fritekst || null,
              })),
            ]
          : [],
      ektefelle: tilknyttetEktefelle
        ? {
            uuid: tilknyttetEktefelle?.uuid || "",
            omfattet: Utils.streng.uppercaseStrengTilBool(formValues.ektefelle.innvilget),
            begrunnelseKode: formValues.ektefelle.begrunnelse,
            begrunnelseFritekst: formValues.ektefelle.fritekst,
          }
        : null,
    });
  };

  useEffect(() => {
    oppdaterFlytMedFamilie();
  }, [formValues?.barn, formValues?.ektefelle, tilknyttedeBarn, tilknyttetEktefelle]);

  useEffect(() => {
    if (steg.status !== StegStatus.FERDIG && aktivtSteg) {
      oppdaterFlytMedFamilie();
    }
  }, [aktivtSteg, steg.status]);

  if (!formValues || !formValues.barn || !formValues.ektefelle) return null;

  return (
    <div className="vurderingFamilie">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Skal familiemedlemmer oppgitt i søknaden innvilges medlemskap?
      </Nav.Typo.Innholdstittel>

      {Utils._isEmpty(tilknyttedeBarn) && !tilknyttetEktefelle ? (
        <div>
          <Nav.Alert className="alertstripe" variant="success">
            Ingen medfølgende familiemedlemmer.
          </Nav.Alert>
          <span>{OBS_TEKST}</span>
        </div>
      ) : (
        <div>
          {!Utils._isEmpty(tilknyttedeBarn) && (
            <Nav.Fieldset legend="Barn" className="barn">
              {tilknyttedeBarn?.map(
                (barn: Api.Trygdeavtale.FamilieValg) =>
                  finnBarn(barn?.uuid, formValues.barn) && (
                    <Nav.Row key={barn.uuid} className="barnet">
                      <Nav.Column xs="8">
                        <Skjema.RadioGroup
                          legend={`${Utils.streng.storeForbokstaver(barn.navn)} (F.nr: ${barn.fnr})`}
                          readOnly={!redigerbart}
                          id={Utils._uuid()}
                          name={`barn.${barn.uuid}.innvilget`}
                        >
                          <Nav.Radio value={BOOLSK_STRING.SANN}>Ja</Nav.Radio>
                          <Nav.Radio value={BOOLSK_STRING.USANN}>Nei</Nav.Radio>
                        </Skjema.RadioGroup>
                        {erIkkeInnvilget(finnBarn(barn?.uuid, formValues.barn)?.innvilget) && (
                          <Skjema.Select
                            label="Begrunnelse:"
                            feltNavn={`barn.${barn.uuid}.begrunnelse`}
                            emptyFieldDisabled={!redigerbart || !!finnBarn(barn?.uuid, formValues.barn)?.begrunnelse}
                            name={barn.uuid}
                            disabled={!redigerbart}
                          >
                            {barnBegrunnelseValg?.map((begrunnelse: KTObject) => (
                              <option key={begrunnelse.kode} value={begrunnelse.kode}>
                                {begrunnelse.term}
                              </option>
                            ))}
                          </Skjema.Select>
                        )}
                      </Nav.Column>
                    </Nav.Row>
                  )
              )}
              {tilknyttedeBarn?.some((barn: Api.Trygdeavtale.FamilieValg) =>
                erIkkeInnvilget(finnBarn(barn?.uuid, formValues.barn)?.innvilget)
              ) && (
                <div className="fritekstWrapper--barn">
                  <LabelMedHjelpetekst
                    label="Fritekst til avsnitt om barn i vedtaksbrev"
                    hjelpetekst={HJELPETEKST}
                    bold
                  />
                  <Skjema.HTMLEditor feltNavn="barn.fritekst" className="fritekst" disabled={!redigerbart} />
                </div>
              )}
            </Nav.Fieldset>
          )}

          {tilknyttetEktefelle && (
            <Nav.Fieldset legend="Ektefelle/partner/samboer" className="ektefelle">
              <Nav.Row>
                <Nav.Column xs="8">
                  <Skjema.RadioGroup
                    legend={`${Utils.streng.storeForbokstaver(tilknyttetEktefelle.navn)} (F.nr: ${
                      tilknyttetEktefelle.fnr
                    })`}
                    readOnly={!redigerbart}
                    id={Utils._uuid()}
                    name="ektefelle.innvilget"
                  >
                    <Nav.Radio value={BOOLSK_STRING.SANN}>Ja</Nav.Radio>
                    <Nav.Radio value={BOOLSK_STRING.USANN}>Nei</Nav.Radio>
                  </Skjema.RadioGroup>
                  {erIkkeInnvilget(formValues.ektefelle?.innvilget) && (
                    <Skjema.Select
                      label="Begrunnelse:"
                      feltNavn="ektefelle.begrunnelse"
                      emptyFieldDisabled={!redigerbart || !!formValues.ektefelle.begrunnelse}
                      disabled={!redigerbart}
                    >
                      {ektefelleBegrunnelseValg?.map((begrunnelse: KTObject) => (
                        <option key={begrunnelse.kode} value={begrunnelse.kode}>
                          {begrunnelse.term}
                        </option>
                      ))}
                    </Skjema.Select>
                  )}
                </Nav.Column>
              </Nav.Row>
              {erIkkeInnvilget(formValues.ektefelle?.innvilget) && (
                <div className="fritekstWrapper">
                  <LabelMedHjelpetekst
                    label="Fritekst til avsnitt om ektefelle/samboer i vedtaksbrev"
                    hjelpetekst={HJELPETEKST}
                  />
                  <Skjema.HTMLEditor feltNavn="ektefelle.fritekst" className="fritekst" disabled={!redigerbart} />
                </div>
              )}
            </Nav.Fieldset>
          )}
        </div>
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

const VurderingFamilieForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.FAMILIE,
  destroyOnUnmount: true,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_familie),
})(VurderingFamilie);

export default connector(VurderingFamilieForm);
