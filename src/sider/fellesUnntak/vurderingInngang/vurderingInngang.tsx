import React, { useCallback, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../melosyskodeverk";
import * as Forms from "../../../felleskomponenter/forms";
import * as Mui from "../../../felleskomponenter/ui";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { menypanelOperations } from "../../../ducks/menypanel";
import { fagsakSelectors } from "../../../ducks/fagsaker";

import vurderingInngangSchema from "./vurderingInngangSchema";
import "./vurderingInngang.css";

const { EU_EOS, TRYGDEAVTALE } = MKV.Koder.sakstyper;

interface VurderingInngangProps {
  oppdaterStatus: (isValid: boolean) => void;
  bekreft: () => void;
  oppfriskOgLastInnSaksopplysninger: () => void;
}

const VurderingInngang = ({ bekreft, oppdaterStatus, oppfriskOgLastInnSaksopplysninger }: VurderingInngangProps) => {
  const dispatch = useDispatch();
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const periode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const avsenderland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector)[0];
  const lovvalgsland = useSelector(lovvalgsperioderSelectors.LovvalgslandSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);

  const { control, getValues, setValue, formState } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    context: { sakstype },
    mode: "onChange",
    defaultValues: {
      fom: Utils.dato.formatterDatoTilNorsk(periode?.fom),
      tom: Utils.dato.formatterDatoTilNorsk(periode?.tom),
      avsenderland,
      lovvalgsland,
    } as FieldValues,
  });
  const formValues = getValues();

  const [initialValues, setInitialValues] = useState<FieldValues>({ ...formState.defaultValues });
  const [visSpinner, setVisSpinner] = useState(false);

  useEffect(() => {
    if (registeropplysningerHentet) {
      dispatch(menypanelOperations.visMenypanel());
    }
  }, []);

  useEffect(() => {
    oppdaterStatus(formState.isValid);
  }, [formState?.isValid]);

  useEffect(() => {
    if (formState?.isValid && sakstype === TRYGDEAVTALE) {
      dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState({ lovvalgsland: formValues.lovvalgsland }));
      dispatch(lovvalgsperioderOperations.lagre());
    }
  }, [periode?.fom, periode?.tom, avsenderland]);

  const debouncedOppdaterPeriode = useCallback(
    Utils._debounce(
      (data: { fom: string; tom: string }) =>
        dispatch(
          mottatteOpplysningerOperations.oppdaterPeriode({
            fom: Utils.dato.formatterDatoTilISO(data.fom, ""),
            tom: Utils.dato.formatterDatoTilISO(data.tom, ""),
          })
        ),
      500
    ),
    []
  );

  const lagreFom = (fom: string) => {
    debouncedOppdaterPeriode({ fom, tom: formValues.tom });
  };

  const lagreTom = (tom: string) => {
    debouncedOppdaterPeriode({ fom: formValues.fom, tom });
  };

  const lagreAvsenderland = (valgtLand: string) => {
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(valgtLand ? [valgtLand] : [], false));
    if (Utils._isEmpty(formValues.lovvalgsland)) {
      setValue("lovvalgsland", valgtLand);
    }
  };

  const lagreLovvalgsperiode = (valgtLand: string) => {
    dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState({ lovvalgsland: valgtLand }));
    dispatch(lovvalgsperioderOperations.lagre());
  };

  const bekreftHandle = async () => {
    const skalHenteRegisteropplysninger =
      !registeropplysningerHentet ||
      formValues?.fom !== initialValues?.fom ||
      formValues?.tom !== initialValues?.tom ||
      formValues?.avsenderland !== initialValues?.avsenderland ||
      formValues?.lovvalgsland !== initialValues?.lovvalgsland;

    setInitialValues({
      fom: formValues.fom,
      tom: formValues.tom,
      avsenderland: formValues.avsenderland,
      lovvalgsland: formValues.lovvalgsland,
    });

    if (skalHenteRegisteropplysninger) {
      setVisSpinner(true);
      await oppfriskOgLastInnSaksopplysninger();
      setVisSpinner(false);
      dispatch(menypanelOperations.visMenypanel());
    }
    bekreft();
  };

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Undertittel className="undertittel">Oppgi opplysninger fra attesten</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="2">
            <Forms.Datovelger
              label="Fra og med:"
              name="fom"
              feil={(formState.errors.fom?.message as any)?.melding}
              disabled={!redigerbart}
              control={control}
              onChange={lagreFom}
            />
          </Nav.Column>
          <Nav.Column xs="2">
            <Forms.Datovelger
              label="Til og med:"
              name="tom"
              feil={(formState.errors.tom?.message as any)?.melding}
              disabled={!redigerbart}
              control={control}
              onChange={lagreTom}
            />
          </Nav.Column>
          <Nav.Column xs="4">
            <Forms.Select
              name="avsenderland"
              control={control}
              label="Avsenderland"
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.avsenderland}
              disabled={!redigerbart}
              onChange={lagreAvsenderland}
            >
              {MKV.KTObjects.landkoder.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
          {sakstype === EU_EOS && (
            <Nav.Column xs="4">
              <Forms.Select
                name="lovvalgsland"
                control={control}
                label="Lovvalgsland"
                emptyFieldText="Velg"
                emptyFieldDisabled={!!formValues.lovvalgsland}
                disabled={!redigerbart}
                onChange={lagreLovvalgsperiode}
              >
                {MKV.KTObjects.landkoder.map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
          )}
        </Nav.Row>
      </Nav.Fieldset>
      {sakstype === EU_EOS && (
        <Nav.AlertStripeInfo className="alert">
          Hvis avsenderlandet ikke er lovvalgsland, må du endre lovvalgsland.
        </Nav.AlertStripeInfo>
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreftHandle,
          disabled: !formState?.isValid || !redigerbart,
        }}
        spinner={visSpinner}
        bekreftTekst="Bekreft og innhent registeropplysninger"
      />
    </div>
  );
};

export default VurderingInngang;
