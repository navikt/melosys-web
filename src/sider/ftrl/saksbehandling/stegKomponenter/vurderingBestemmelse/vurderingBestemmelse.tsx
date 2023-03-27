import { ChangeEventHandler, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Utils from "../../../../../utils";

import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../../ducks/folketrygdenkodeverk";
import { vilkarOperations } from "../../../../../ducks/vilkar";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";

import { BOOLSK_STRING } from "../../../../../constants";
import { useAsyncCallbackState } from "../../../../../hooks";
import { VilkaarOgBegrunnelser } from "./komponenter/vilkaarOgBegrunnelser";
import { FlytFinnesIkke } from "./komponenter/flytFinnesIkke";
import "./vurderingBestemmelse.css";
import { harStrengInnhold } from "../../../../../utils/streng";

const { SANN, USANN } = BOOLSK_STRING;
export interface Begrunnelse {
  begrunnelseKode: string;
  begrunnelseFritekst?: string | null;
}

const komponentState = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  medlemskapsperiodeBestemmelse: medlemskapsperioderSelectors.BestemmelseSelector(state),
  vilkårKodeverk: folketrygdenkodeverkSelectors.VilkaarSelector(state),
  begrunnelseKodeverk: folketrygdenkodeverkSelectors.BegrunnelserSelector(state),
});

interface VurderingBestemmelseProps {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingBestemmelse = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingBestemmelseProps) => {
  const dispatch = useDispatch();
  const oppdaterVilkår = (skjema: any) => dispatch(vilkarOperations.oppdaterState(skjema));
  const {
    behandlingID,
    behandlingstema,
    medlemskapsperiodeBestemmelse,
    vilkårKodeverk,
    begrunnelseKodeverk,
    redigerbart,
  } = useSelector(komponentState);
  const [{ støttedeBestemmelser, ikkeStøttedeBestemmelser }] =
    useAsyncCallbackState<Api.Medlemskapsperioder.HentBestemmelserResponse>(
      () => Api.Medlemskapsperioder.hentBestemmelser(behandlingstema),
      { støttedeBestemmelser: [], ikkeStøttedeBestemmelser: [] },
      [behandlingstema]
    );

  const [valgtBestemmelse, setValgtBestemmelse] = useState("");
  const [valgteVilkår, setValgteVilkår] = useState<Map<string, string>>(new Map());
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState<Map<string, Begrunnelse>>(new Map());
  const [valgtBestemmelsesSynligeVilkår, setValgtBestemmelsesSynligeVilkår] = useState<
    Api.Medlemskapsperioder.VilkårOgBegrunnelser[]
  >([]);
  const [formIsValid, setFormIsValid] = useState(false);

  const bestemmelseIkkeStøttetValgt = ikkeStøttedeBestemmelser?.some((bestemmelse) => bestemmelse === valgtBestemmelse);

  const hentEksisterendeVilkår = async () => {
    // @ts-ignore
    const response: { data: Api.Vilkar.Vilkaar[] } = await dispatch(vilkarOperations.hent(behandlingID));

    handleEndreBestemmelse(medlemskapsperiodeBestemmelse);
    response.data?.forEach((vilkar) => {
      valgteVilkår.set(vilkar.vilkaar, vilkar.oppfylt ? SANN : USANN);
      if (vilkar.begrunnelseKoder && vilkar.begrunnelseKoder.length === 1) {
        valgteBegrunnelser.set(`${vilkar.vilkaar}_begrunnelser`, {
          begrunnelseKode: vilkar.begrunnelseKoder[0],
          begrunnelseFritekst: vilkar.begrunnelseFritekst,
        });
      }
    });
    setValgteVilkår(new Map(valgteVilkår));
    setValgteBegrunnelser(new Map(valgteBegrunnelser));
  };

  useEffect(() => {
    hentEksisterendeVilkår();
  }, []);

  const validerForm = () => {
    const valgtBestemmelseMedVilkårOgBegrunnelser = støttedeBestemmelser.find(
      (element) => element.bestemmelse === valgtBestemmelse
    );

    const vilkårBegrunnelse = valgteBegrunnelser.get(
      `${MKV.Koder.vilkaar.FTRL_2_8_NÆR_TILKNYTNING_NORGE}_begrunnelser`
    );
    const harValgtAnnenGrunn =
      vilkårBegrunnelse?.begrunnelseKode && vilkårBegrunnelse?.begrunnelseKode === "ANNEN_GRUNN";

    const alleVilkårHarSvarJaOgValgtBegrunnelse = valgtBestemmelseMedVilkårOgBegrunnelser?.vilkårOgBegrunnelser.every(
      (element) => {
        return (
          valgteVilkår.get(element.vilkår) === SANN &&
          (Utils._isEmpty(element.muligeBegrunnelser)
            ? true
            : valgteBegrunnelser.get(`${element.vilkår}_begrunnelser`)) &&
          (harValgtAnnenGrunn ? harStrengInnhold(vilkårBegrunnelse?.begrunnelseFritekst ?? "") : true)
        );
      }
    );

    setFormIsValid(Boolean(alleVilkårHarSvarJaOgValgtBegrunnelse));
  };

  const oppdaterValgtBestemmelsesSynligeVilkår = () => {
    const valgtBestemmelsesVilkårOgBegrunnelser = støttedeBestemmelser.find(
      (bestemmelseMedVilkårOgBegrunnelser) => bestemmelseMedVilkårOgBegrunnelser.bestemmelse === valgtBestemmelse
    )?.vilkårOgBegrunnelser;

    if (Utils._isEmpty(valgtBestemmelsesVilkårOgBegrunnelser)) {
      setValgtBestemmelsesSynligeVilkår([]);
      return;
    }
    const vilkårSomSkalVises: Api.Medlemskapsperioder.VilkårOgBegrunnelser[] = [];

    valgtBestemmelsesVilkårOgBegrunnelser?.forEach((vilkårOgMuligeBegrunnelser) => {
      if (Utils._isEmpty(vilkårSomSkalVises)) {
        vilkårSomSkalVises.push(vilkårOgMuligeBegrunnelser);
        return;
      }
      const [forrigeVilkår] = vilkårSomSkalVises.slice(-1);
      if (valgteVilkår.get(forrigeVilkår.vilkår) === SANN) {
        vilkårSomSkalVises.push(vilkårOgMuligeBegrunnelser);
      }
    });
    setValgtBestemmelsesSynligeVilkår(vilkårSomSkalVises);
  };

  useEffect(() => {
    setValgteBegrunnelser(new Map());
    setValgteVilkår(new Map());
    oppdaterValgtBestemmelsesSynligeVilkår();
    validerForm();
  }, [valgtBestemmelse]);

  useEffect(() => {
    oppdaterValgtBestemmelsesSynligeVilkår();
    validerForm();
  }, [valgteVilkår]);

  useEffect(() => {
    validerForm();
  }, [valgteBegrunnelser]);

  useEffect(() => {
    oppdaterStatus(formIsValid);
  }, [formIsValid]);

  const oppdaterVilkårState = () => {
    const alleVilkår: { [key: string]: boolean } = {};
    valgteVilkår.forEach((value: string, key: string) => {
      alleVilkår[key] = value === SANN;
    });
    const alleBegrunnelser: { [key: string]: string[] | string } = {};
    valgteBegrunnelser.forEach((value: Begrunnelse, key: string) => {
      alleBegrunnelser[key] = [value.begrunnelseKode];
      if (value.begrunnelseFritekst) alleBegrunnelser[`${key}_fritekst`] = value.begrunnelseFritekst;
    });
    oppdaterVilkår({ ...alleBegrunnelser, ...alleVilkår });
  };

  const handleEndreBestemmelse = (nyBestemmelse: string) => {
    setValgtBestemmelse(nyBestemmelse);
    dispatch(medlemskapsperioderOperations.oppdaterBestemmelse(nyBestemmelse));
  };

  const handleEndreVilkår: ChangeEventHandler<HTMLInputElement> = (event) => {
    const vilkårKode = event.target.name;
    const vilkårSvar = event.target.value;
    setValgteVilkår(new Map(valgteVilkår.set(vilkårKode, vilkårSvar)));
    if (vilkårSvar === USANN && valgteBegrunnelser.get(`${vilkårKode}_begrunnelser`)) {
      valgteBegrunnelser.delete(`${vilkårKode}_begrunnelser`);
      setValgteBegrunnelser(new Map(valgteBegrunnelser));
      oppdaterVilkårState();
    } else {
      oppdaterVilkårState();
    }
  };

  const handleEndreBegrunnelseKode: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setValgteBegrunnelser(new Map(valgteBegrunnelser.set(event.target.name, { begrunnelseKode: event.target.value })));
    oppdaterVilkårState();
  };

  const handleEndreBegrunnelseFritekst = (valgtBegrunnelse: string, begrunnelseFritekst: string) => {
    const valgtBegrunnelseKode = valgteBegrunnelser.get(valgtBegrunnelse)!!.begrunnelseKode;
    setValgteBegrunnelser(
      new Map(
        valgteBegrunnelser.set(valgtBegrunnelse, {
          begrunnelseKode: valgtBegrunnelseKode,
          begrunnelseFritekst,
        })
      )
    );
    oppdaterVilkårState();
  };

  const handleBekreft = async () => {
    await dispatch(vilkarOperations.lagre());
    await dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiodeFraBestemmelse());
    bekreft();
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingBestemmelse">
      <Nav.Typo.Undertittel className="undertittel">
        Hvilken bestemmelse skal søknaden vurderes etter?
      </Nav.Typo.Undertittel>

      <Nav.Fieldset className="select" legend="Bestemmelse">
        <Nav.Row>
          <Nav.Column xs="7">
            <Nav.Select
              label=""
              disabled={!redigerbart}
              onChange={(event) => handleEndreBestemmelse(event.target.value)}
              value={valgtBestemmelse}
            >
              <option disabled={!!valgtBestemmelse} value="" key="">
                Velg...
              </option>
              {støttedeBestemmelser.map((element) => (
                <option key={element.bestemmelse} value={element.bestemmelse}>
                  {KV.finnTermFraListe(MKV.KTObjects.folketrygdloven_kap2_bestemmelser, element.bestemmelse)}
                </option>
              ))}
              <option disabled>{"\u2500"}</option>
              {ikkeStøttedeBestemmelser.map((bestemmelse) => (
                <option key={bestemmelse} value={bestemmelse}>
                  {KV.finnTermFraListe(MKV.KTObjects.folketrygdloven_kap2_bestemmelser, bestemmelse)}
                </option>
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      {valgtBestemmelsesSynligeVilkår.map((vilkårOgBegrunnelser) => (
        <VilkaarOgBegrunnelser
          key={vilkårOgBegrunnelser.vilkår}
          vilkårOgBegrunnelser={vilkårOgBegrunnelser}
          alleValgteVilkår={valgteVilkår}
          alleValgteBegrunnelser={valgteBegrunnelser}
          vilkårKodeverk={vilkårKodeverk}
          begrunnelseKodeverk={begrunnelseKodeverk}
          handleEndreVilkår={handleEndreVilkår}
          handleEndreBegrunnelseKode={handleEndreBegrunnelseKode}
          handleEndreBegrunnelseFritekst={handleEndreBegrunnelseFritekst}
          redigerbart={redigerbart}
        />
      ))}

      {bestemmelseIkkeStøttetValgt && <FlytFinnesIkke />}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: handleBekreft, disabled: !formIsValid || !redigerbart }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
