/*eslint-disable */
import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";

import DialogboksOppfriskSak from "../../../../felleskomponenter/dialogboks/oppfrisk/dialogboksOppfrisk";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { formSelectors } from "../../../../ducks/form";

import vurderingStartSchema from "./vurderingStartSchema";
import "./vurderingStart.css";
import MultiSelect from "../../../../felleskomponenter/multiSelect";
import { landkoderSelectors } from "../../../../ducks/landkoder";
import { fagsakSelectors } from "../../../../ducks/fagsaker";

const landHarTrygdeavtaleMedNorgeEllerErEosLand = (landKode: string) => {
  const landMedTrygdeAvtaleEllerEosLand = [
    ...MKV.KTObjects.landkoder.map((land: KTObject) => land.kode),
    ...MKV.KTObjects.trygdeavtale_myndighetsland.map((land: KTObject) => land.kode),
  ];

  return landMedTrygdeAvtaleEllerEosLand.includes(landKode);
};

const mapStateToProps = (state: RootState) => {
  const initialSoknadsperiode = mottatteOpplysningerSelectors.PeriodeSelector(state);
  const initialSoeknadsland = mottatteOpplysningerSelectors.SoknadslandkoderSelector(state);
  const initialTrygdedekning = mottatteOpplysningerSelectors.TrygdedekningSelector(state);
  const fagsak = fagsakSelectors.FagsakSelector(state);
  return {
    trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
    initialValues: {
      fom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.fom),
      tom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.tom),
      land: initialSoeknadsland && initialSoeknadsland.toString(),
      trygdedekning: initialTrygdedekning,
    },
    alleLandkoder: landkoderSelectors.LandkoderSelector(state),
    erFTRL: fagsak.sakstype.kode === MKV.Koder.sakstyper.FTRL,
    formIsValid: formSelectors.VurderStartFormValid(state),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
  oppdaterPeriode: (periode: { fom: string; tom: string }) =>
    dispatch(mottatteOpplysningerOperations.oppdaterPeriode(periode)),
  oppdaterSoeknadslandkoder: (landkoder: string[]) =>
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(landkoder, false)),
  oppdaterTrygdedekning: (trygdedekning: string | undefined) =>
    dispatch(mottatteOpplysningerOperations.oppdaterTrygdedekning(trygdedekning)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  redigerbart: boolean;
  oppdaterData: (avklartefakta: any) => void;
  tilForsiden: () => void;
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger: () => void;
  annenBehandlingOppfriskes: boolean;
}

export const VurderingStart = ({
  bekreft,
  redigerbart,
  oppdaterPeriode,
  oppdaterSoeknadslandkoder,
  oppdaterTrygdedekning,
  trygdedekninger,
  alleLandkoder,
  initialValues,
  tilForsiden,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
  annenBehandlingOppfriskes,
  visMenypanel,
}: Props & PropsFromRedux) => {
  const {
    control,
    setValue,
    getValues,
    formState: { isValid: formIsValid, errors },
  } = useForm({
    resolver: yupResolver(vurderingStartSchema),
    mode: "onChange",
    defaultValues: {
      ...initialValues,
    } as FieldValues,
  });
  const formValues = getValues();

  const [visOppfrisk, setVisOppfrisk] = useState(false);
  const [valgteLand, setValgteLand] = useState<string[]>([]);
  useEffect(() => {
    if (initialValues && initialValues.fom && !Utils._isEmpty(initialValues.fom)) {
      visMenypanel();
    }
    if (!Utils._isEmpty(initialValues.land)) {
      setValgteLand([initialValues.land]);
    }
  }, []);

  const oppdaterLokalMottatteOpplysninger = async () => {
    const fom = Utils.dato.formatterDatoTilISO(formValues.fom);
    const tom = Utils.dato.formatterDatoTilISO(formValues.tom);
    await Promise.all([
      oppdaterPeriode({ fom: fom === "Invalid date" ? "" : fom, tom: tom === "Invalid date" ? "" : tom }),
      oppdaterSoeknadslandkoder(formValues.land ? [formValues.land] : []),
      oppdaterTrygdedekning(formValues.trygdedekning),
    ]);
  };

  // const debouncedOppdatering = useCallback(Utils._debounce(oppdaterLokalMottatteOpplysninger, 500), []);

  useEffect(() => {
    const erSammeSomInitialVerdier =
      formValues.fom === initialValues.fom &&
      formValues.tom === initialValues.tom &&
      formValues.land === initialValues.land &&
      formValues.trygdedekning === initialValues.trygdedekning;

    if (!erSammeSomInitialVerdier && formIsValid) {
      oppdaterLokalMottatteOpplysninger().finally(() => console.log("Ferdig med å oppdatere"));
    }
  }, [formIsValid, formValues, initialValues]);

  const fortsettHandle = () => {
    const erSammeSomInitialVerdier =
      formValues.fom === initialValues.fom &&
      formValues.tom === initialValues.tom &&
      formValues.land === initialValues.land &&
      formValues.trygdedekning === initialValues.trygdedekning;
    console.log({ erSammeSomInitialVerdier, formValues, initialValues });
    if (!erSammeSomInitialVerdier) {
      setVisOppfrisk(true);
    } else {
      bekreft();
    }
  };

  const valgtLandHarTrygdeavtaleMedNorgeEllerErEosLand = formValues.land
    ? landHarTrygdeavtaleMedNorgeEllerErEosLand(formValues.land)
    : false;

  const landEndret = (options: []) => {
    const land = options ? options.slice(-1).map((item: { value: string }) => item.value) : [];
    setValgteLand(land);
    const formLand = Object.assign([], land).shift();
    setValue("land", formLand || undefined, { shouldValidate: true });
  };

  return (
    <div className="vurderingStart">
      <Nav.Typo.Undertittel className="undertittel">Oppgi søknadsperiode og -land</Nav.Typo.Undertittel>

      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.DatovelgerV2
              label="Fra og med:"
              name="fom"
              feil={(errors.fom?.message as any)?.melding}
              disabled={!redigerbart}
              control={control}
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.DatovelgerV2
              label="Til og med:"
              name="tom"
              feil={(errors.tom?.message as any)?.melding}
              disabled={!redigerbart}
              control={control}
            />
          </Nav.Column>
          <Nav.Column xs="5">
            <MultiSelect
              label={
                <LabelMedHjelpetekst
                  label="Arbeidsland"
                  hjelpetekst="Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet"
                  hjelpetekstClassName="hjelpetekst"
                />
              }
              onChange={landEndret}
              values={valgteLand}
              feil={(errors.land?.message as any)?.melding.toString()}
              options={alleLandkoder.map((item: any) => ({ value: item.kode, label: item.term }))}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      {valgtLandHarTrygdeavtaleMedNorgeEllerErEosLand && (
        <Nav.Row>
          <Nav.Column xs="6" />
          <Nav.Column xs="5">
            <Nav.AlertStripeAdvarsel>
              Landet er et EØS-land og/eller et land Norge har trygdeavtale med
            </Nav.AlertStripeAdvarsel>
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Fieldset legend="Trygdedekning">
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.SelectV2
              name="trygdedekning"
              control={control}
              label=""
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.trygdedekning}
              disabled={!redigerbart}
            >
              {trygdedekninger.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Skjema.SelectV2>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      <Mui.StegKnapper
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

export default connector(VurderingStart);
