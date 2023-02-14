// noinspection ES6UnusedImports

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../../../melosyskodeverk";
import * as Utils from "../../../../utils";
import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import vurderingInngangSchema from "./vurderingInngangSchema";
import "./vurderingInngang.css";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { DialogboksOppfriskSak } from "../../../../felleskomponenter/dialogboks";
import { visMenypanel } from "../../../../ducks/menypanel/operations";
import { navigeringOperations } from "../../../../ducks/navigering";

interface VurderingInngangProps {
  oppdaterStatus: (isValid: boolean) => void;
  bekreft: () => void;
  innhentRegisteropplysninger: () => void;
}

const VurderingInngang = ({ bekreft, oppdaterStatus, innhentRegisteropplysninger }: VurderingInngangProps) => {
  const dispatch = useDispatch();
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const tilForsiden = () => dispatch(navigeringOperations.tilForsiden());
  const [visOppfrisk, setVisOppfrisk] = useState(false);

  const { control, getValues, formState } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    context: { sakstype },
    mode: "onChange",
  });
  const formValues = getValues();

  console.log("formState", formState);

  useEffect(() => {
    console.log("useEffect", formState?.isValid);
    oppdaterStatus(formState.isValid);
  }, [formState?.isValid]);

  const onSubmit = (data: any) => oppdaterLokalMottatteOpplysninger(data);
  console.log(onSubmit);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
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
      {}
      <Nav.Hovedknapp
        onClick={() => {
          console.log("innhente registeropplysninger");
          setVisOppfrisk(true);
          bekreft();
        }}
      >
        Bekreft og innhent registeropplysninger
      </Nav.Hovedknapp>

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={innhentRegisteropplysninger}
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
          annenBehandlingOppfriskes={false}
        />
      )}
    </div>
  );
};

export default VurderingInngang;
