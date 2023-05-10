import React, { useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";

import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";

import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../ducks/folketrygdenkodeverk";
import { vilkarOperations, vilkarSelectors } from "../../../ducks/vilkar";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import * as Forms from "../../../felleskomponenter/forms";
import vurdering_bestemmelse from "./vurderingBestemmelseSchema";

const INNVILGE = "INNVILGE";
const AVSLAG = "AVSLAG";
const UNNTAK = "UNNTAK";

const komponentState = (state: RootState) => ({
  vilkarListe: vilkarSelectors.VilkarSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  bestemmelse: medlemskapsperioderSelectors.BestemmelseSelector(state),
  vilkaarKodeverk: folketrygdenkodeverkSelectors.VilkaarSelector(state),
  begrunnelserKodeverk: folketrygdenkodeverkSelectors.BegrunnelserSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingBestemmelse = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();
  const { bestemmelse, redigerbart } = useSelector(komponentState);
  const [valgtBestemmelse, setValgtBestemmelse] = useState("");

  const { control, watch, formState, setValue } = useForm({
    resolver: yupResolver(vurdering_bestemmelse),
    mode: "all",
    defaultValues: {
      utfall: "",
      bestemmelse: bestemmelse || "",
    } as FieldValues,
  });
  const formValues = watch();

  useEffect(() => {
    oppdaterStatus(formState.isValid && formValues.utfall && formValues.bestemmelse);
  }, [formState?.isValid]);

  useEffect(() => {
    setValue("bestemmelse", "");
  }, [formValues.utfall]);

  const handleEndreBestemmelse = (nyBestemmelse: string) => {
    setValgtBestemmelse(nyBestemmelse);
    dispatch(medlemskapsperioderOperations.oppdaterBestemmelse(nyBestemmelse));
  };

  const handleBekreft = () => {
    dispatch(vilkarOperations.lagre());
    setTimeout(() => {
      dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiodeFraBestemmelse());
      bekreft();
    }, 1000);
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingBestemmelse">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Bestemmelse og vurdering</Nav.Typo.Innholdstittel>

      <Nav.Fieldset legend="Hva er din vurdering av søknaden?">
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil innvilge søknaden"
          value={INNVILGE}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil søke om unntak"
          value={UNNTAK}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil avslå søknaden"
          value={AVSLAG}
          disabled={!redigerbart}
        />
      </Nav.Fieldset>
      {formValues.utfall === INNVILGE ? (
        <Nav.Fieldset className="select" legend="Velg bestemmelse">
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Select
                label=""
                disabled={!redigerbart}
                onChange={(event) => handleEndreBestemmelse(event.target.value)}
                value={valgtBestemmelse}
              >
                <option disabled={!!valgtBestemmelse} value="" key="">
                  Velg
                </option>
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      ) : null}
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !formState?.isValid || !redigerbart || formValues.utfall !== INNVILGE,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
