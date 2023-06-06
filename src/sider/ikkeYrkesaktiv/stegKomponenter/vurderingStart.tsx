import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";
import * as Forms from "../../../felleskomponenter/forms";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as Utils from "../../../utils";

import LabelMedHjelpetekst from "../../../felleskomponenter/labelMedHjelpetekst";
import { FellesHandlersContext } from "../../../contexts";
import { DialogboksOppfriskSak } from "../../../felleskomponenter/dialogboks";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { menypanelOperations } from "../../../ducks/menypanel";
import { landkoderSelectors } from "../../../ducks/landkoder";
import { tilForsiden } from "../../../ducks/navigering/operations";

import vurderingStartSchema from "./vurderingStartSchema";

const komponentState = (state: RootState) => {
  const initialSoknadsperiode = mottatteOpplysningerSelectors.PeriodeSelector(state);
  const initialSoeknadsland = mottatteOpplysningerSelectors.SoknadslandkoderSelector(state);
  return {
    initialValues: {
      fom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.fom),
      tom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.tom),
      land: initialSoeknadsland && initialSoeknadsland.toString(),
    },
    landkoder: landkoderSelectors.LandkoderFraSakstypeSelector(state),
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

export const VurderingStart = ({ bekreft, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();
  const { lagreMottatteOpplysningerOgOppfriskSaksopplysninger, annenBehandlingOppfriskes } = useContext(
    FellesHandlersContext
  ) as any;
  const { redigerbart, initialValues, landkoder } = useSelector(komponentState);
  const { visMenypanel, oppdaterPeriode, oppdaterSoeknadslandkoder, oppdaterTrygdedekning } =
    komponentDispatch(dispatch);
  const [visOppfrisk, setVisOppfrisk] = useState(false);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingStartSchema),
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
      formValues.land === initialValues.land;

    if (!erSammeSomInitialVerdier) {
      oppdaterLokalMottatteOpplysninger().finally(() => {
        setVisOppfrisk(true);
      });
    } else {
      bekreft();
    }
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingStart">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi søknadsperiode og -land</Nav.Typo.Innholdstittel>

      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Forms.Datovelger label="Fra og med" name="fom" disabled={!redigerbart} control={control} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Forms.Datovelger label="Til og med" name="tom" disabled={!redigerbart} control={control} />
          </Nav.Column>
          <Nav.Column xs="5">
            <Forms.Select
              label={
                <LabelMedHjelpetekst
                  label="Land"
                  hjelpetekst="SETT INN HJELPETEKST"
                  hjelpetekstClassName="hjelpetekst"
                />
              }
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.land}
              name="land"
              disabled={!redigerbart}
              control={control}
            >
              {landkoder.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fortsettHandle,
          disabled: !formIsValid || !redigerbart,
        }}
        bekreftTekst="Bekreft og innhent registeropplysninger"
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
