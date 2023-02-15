import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";

import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";
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

  const { control, getValues, formState } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    context: { sakstype },
    mode: "onChange",
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

  const oppdaterLokalMottatteOpplysninger = (data: any) => {
    const fom = Utils.dato.formatterDatoTilISO(data.periodeFraOgMed);
    const tom = Utils.dato.formatterDatoTilISO(data.periodeFraOgMed);
    dispatch(
      mottatteOpplysningerOperations.oppdaterPeriode({
        fom,
        tom,
      })
    );
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(["NO"], false));
  };
  console.log(oppdaterLokalMottatteOpplysninger);

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
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.DatovelgerV2
              label="Til og med:"
              name="tom"
              feil={(formState.errors.tom?.message as any)?.melding}
              disabled={!redigerbart}
              control={control}
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
                emptyFieldDisabled={!!formValues.avsenderland}
                disabled={!redigerbart}
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
