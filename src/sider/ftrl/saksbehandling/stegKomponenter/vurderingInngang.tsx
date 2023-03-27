import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";

import MKV from "../../../../melosyskodeverk";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { FellesHandlersContext } from "../../../../contexts";
import { DialogboksOppfriskSak } from "../../../../felleskomponenter/dialogboks";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { landkoderSelectors } from "../../../../ducks/landkoder";
import { tilForsiden } from "../../../../ducks/navigering/operations";

import vurderingInngangSchema from "./vurderingInngangSchema";
import "./vurderingInngang.css";

const komponentState = (state: RootState) => {
  const initialSoknadsperiode = mottatteOpplysningerSelectors.PeriodeSelector(state);
  const initialSoeknadsland = mottatteOpplysningerSelectors.SoknadslandkoderSelector(state);
  const initialTrygdedekning = mottatteOpplysningerSelectors.TrygdedekningSelector(state);
  return {
    initialValues: {
      fom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.fom),
      tom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.tom),
      land: initialSoeknadsland && initialSoeknadsland.toString(),
      trygdedekning: initialTrygdedekning,
    },
    trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
    alleLandkoder: landkoderSelectors.LandkoderSelector(state),
    redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  };
};

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
  oppdaterPeriode: (periode: { fom: string; tom: string }) =>
    dispatch(mottatteOpplysningerOperations.oppdaterPeriode(periode)),
  oppdaterSoeknadslandkoder: (landkoder: string[]) =>
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(landkoder, false)),
  oppdaterTrygdedekning: (trygdedekning: string | undefined) =>
    dispatch(mottatteOpplysningerOperations.oppdaterTrygdedekning(trygdedekning)),
});

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingInngang = ({ bekreft, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();
  const { lagreMottatteOpplysningerOgOppfriskSaksopplysninger, annenBehandlingOppfriskes } = useContext(
    FellesHandlersContext
  ) as any;
  const { redigerbart, trygdedekninger, initialValues, alleLandkoder } = useSelector(komponentState);
  const { visMenypanel, oppdaterPeriode, oppdaterSoeknadslandkoder, oppdaterTrygdedekning } =
    komponentDispatch(dispatch);
  const [visOppfrisk, setVisOppfrisk] = useState(false);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    mode: "all",
    values: useMemo(() => initialValues as FieldValues, [initialValues]),
  });
  const formValues = watch();

  useEffect(() => {
    if (!Utils._isEmpty(initialValues.fom)) {
      visMenypanel();
    }
  }, []);

  useEffect(() => {
    oppdaterStatus(formIsValid);
  }, [formIsValid]);

  const oppdaterLokalMottatteOpplysninger = async () => {
    await Promise.all([
      oppdaterPeriode({
        fom: Utils.dato.formatterDatoTilISO(formValues.fom, null, ""),
        tom: Utils.dato.formatterDatoTilISO(formValues.tom, null, ""),
      }),
      oppdaterSoeknadslandkoder(formValues.land ? [formValues.land] : []),
      oppdaterTrygdedekning(formValues.trygdedekning),
    ]);
  };

  const fortsettHandle = () => {
    const erSammeSomInitialVerdier =
      formValues.fom === initialValues.fom &&
      formValues.tom === initialValues.tom &&
      formValues.land === initialValues.land &&
      formValues.trygdedekning === initialValues.trygdedekning;

    if (!erSammeSomInitialVerdier) {
      oppdaterLokalMottatteOpplysninger().finally(() => {
        setVisOppfrisk(true);
      });
    } else {
      bekreft();
    }
  };

  const valgtLandHarTrygdeavtaleMedNorgeEllerErEosLand = formValues.land
    ? MKV.Kodekombinasjoner.unikeAvtalelandKoder.includes(formValues.land)
    : false;

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Undertittel className="undertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Undertittel>

      <Nav.Fieldset legend="Søknadsperiode">
        <Nav.Row>
          <Nav.Column xs="2">
            <Forms.Datovelger label="Fra og med" name="fom" disabled={!redigerbart} control={control} />
          </Nav.Column>
          <Nav.Column xs="2">
            <Forms.Datovelger
              label={
                <LabelMedHjelpetekst
                  label="Til og med"
                  hjelpetekst={`Ved åpen søknadsperiode lar du "Til og med" feltet stå tomt. Medlemskapsperiode(r) registreres senere.`}
                  hjelpetekstClassName="hjelpetekst"
                />
              }
              name="tom"
              disabled={!redigerbart}
              control={control}
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Forms.Select
              label={
                <LabelMedHjelpetekst
                  label="Arbeidsland"
                  hjelpetekst="Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet"
                  hjelpetekstClassName="hjelpetekst"
                />
              }
              emptyFieldDisabled={!!formValues.land}
              name="land"
              disabled={!redigerbart}
              control={control}
            >
              {alleLandkoder.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
          <Nav.Column xs="5">
            <Forms.Select
              name="trygdedekning"
              control={control}
              label="Trygdedekning"
              emptyFieldDisabled={!!formValues.trygdedekning}
              disabled={!redigerbart}
            >
              {trygdedekninger.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      {valgtLandHarTrygdeavtaleMedNorgeEllerErEosLand && (
        <Nav.Row>
          <Nav.Column xs="4" />
          <Nav.Column xs="3">
            <Nav.AlertStripeAdvarsel>
              Landet er et EØS-land og/eller et land Norge har trygdeavtale med
            </Nav.AlertStripeAdvarsel>
          </Nav.Column>
        </Nav.Row>
      )}

      <Mui.StegKnapper
        bekreftTekst="Bekreft og innhent registeropplysninger"
        bekreftKnappProps={{
          onClick: fortsettHandle,
          disabled: !formIsValid || !redigerbart,
        }}
      />

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={lagreMottatteOpplysningerOgOppfriskSaksopplysninger}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            visMenypanel();
            bekreft();
          }}
          tilForsiden={() => {
            setVisOppfrisk(false);
            tilForsiden();
          }}
          behandlingOppfriskes
          annenBehandlingOppfriskes={annenBehandlingOppfriskes}
        />
      )}
    </div>
  );
};
