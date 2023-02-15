import React, { useCallback, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { fagsakSelectors } from "../../../../ducks/fagsaker";

import vurderingInngangSchema from "./vurderingInngangSchema";

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
  const soknadslandkoder = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const lovvalgsland = useSelector(lovvalgsperioderSelectors.LovvalgslandSelector);

  const { control, getValues, formState } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    context: { sakstype },
    mode: "onChange",
    defaultValues: {
      fom: Utils.dato.formatterDatoTilNorsk(periode?.fom),
      tom: Utils.dato.formatterDatoTilNorsk(periode?.tom),
      avsenderland: soknadslandkoder[0],
      lovvalgsland,
    } as FieldValues,
  });
  const formValues = getValues();

  const [initialFormState, setInitialFormState] = useState<{
    fom?: string;
    tom?: string;
    avsenderland?: string;
    lovvalgsland?: string;
  }>({});
  const [visSpinner, setVisSpinner] = useState(false);

  useEffect(() => {
    oppdaterStatus(formState.isValid);
  }, [formState?.isValid]);

  const skalHenteRegisteropplysninger =
    formValues?.fom !== initialFormState?.fom ||
    formValues?.tom !== initialFormState?.tom ||
    formValues?.avsenderland !== initialFormState?.avsenderland ||
    formValues?.lovvalgsland !== initialFormState?.lovvalgsland;

  const oppdaterPeriode = (data: { fom: string; tom: string }) => {
    const fom = Utils.dato.formatterDatoTilISO(data.fom);
    const tom = Utils.dato.formatterDatoTilISO(data.tom);
    dispatch(
      mottatteOpplysningerOperations.oppdaterPeriode({
        fom: fom === "Invalid date" ? "" : fom,
        tom: tom === "Invalid date" ? "" : tom,
      })
    );
  };
  const debouncedOppdaterPeriode = useCallback(Utils._debounce(oppdaterPeriode, 500), []);

  const lagreFom = (fom: string) => {
    debouncedOppdaterPeriode({ fom, tom: formValues.tom });
  };

  const lagreTom = (tom: string) => {
    debouncedOppdaterPeriode({ fom: formValues.fom, tom });
  };

  const lagreAvsenderland = (valgtLand: string) => {
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(valgtLand ? [valgtLand] : [], false));
  };

  const lagreLovvalgsperiode = (valgtLand: string) => {
    dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState({ lovvalgsland: valgtLand }));
    dispatch(lovvalgsperioderOperations.lagre());
  };

  const bekreftHandle = async () => {
    setInitialFormState({
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
      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.DatovelgerV2
              label="Fra og med:"
              name="fom"
              feil={(formState.errors.fom?.message as any)?.melding}
              disabled={!redigerbart}
              control={control}
              onChange={lagreFom}
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.DatovelgerV2
              label="Til og med:"
              name="tom"
              feil={(formState.errors.tom?.message as any)?.melding}
              disabled={!redigerbart}
              control={control}
              onChange={lagreTom}
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.SelectV2
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
            </Skjema.SelectV2>
          </Nav.Column>
          {sakstype === MKV.Koder.sakstyper.EU_EOS && (
            <Nav.Column xs="3">
              <Skjema.SelectV2
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
              </Skjema.SelectV2>
            </Nav.Column>
          )}
        </Nav.Row>
      </Nav.Fieldset>
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
