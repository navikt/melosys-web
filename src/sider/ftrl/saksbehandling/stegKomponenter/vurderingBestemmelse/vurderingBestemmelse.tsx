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
import "./vurderingBestemmelse.css";
import { IngenFlytMelding } from "../../../../../felleskomponenter/alertmeldinger";

const { SANN, USANN } = BOOLSK_STRING;
export interface Begrunnelse {
  begrunnelseKode: string;
  begrunnelseFritekst?: string | null;
}

const komponentState = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  lagretBestemmelse: medlemskapsperioderSelectors.BestemmelseSelector(state),
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
  const { behandlingID, behandlingstema, lagretBestemmelse, vilkårKodeverk, begrunnelseKodeverk, redigerbart } =
    useSelector(komponentState);
  const [{ støttedeBestemmelser, ikkeStøttedeBestemmelser }] =
    useAsyncCallbackState<Api.MedlemAvFolketrygden.Bestemmelser.HentMuligeBestemmelserResponse>(
      () => Api.MedlemAvFolketrygden.Medlemskapsperioder.hentMuligeBestemmelser(behandlingstema),
      { støttedeBestemmelser: [], ikkeStøttedeBestemmelser: [] },
      [behandlingstema]
    );

  const [valgtBestemmelse, setValgtBestemmelse] = useState("");
  const [valgteVilkår, setValgteVilkår] = useState<Map<string, string>>(new Map());
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState<Map<string, Begrunnelse>>(new Map());
  const [valgtBestemmelsesSynligeVilkår, setValgtBestemmelsesSynligeVilkår] = useState<
    Api.MedlemAvFolketrygden.Bestemmelser.VilkårOgBegrunnelser[]
  >([]);
  const [formIsValid, setFormIsValid] = useState(false);

  const bestemmelseIkkeStøttetValgt = ikkeStøttedeBestemmelser?.some((bestemmelse) => bestemmelse === valgtBestemmelse);

  const hentEksisterendeVilkår = async () => {
    // @ts-ignore
    const response: { data: Api.Vilkar.Vilkaar[] } = await dispatch(vilkarOperations.hent(behandlingID));

    handleEndreBestemmelse(lagretBestemmelse);
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

    const alleVilkårHarSvarJaOgValgtBegrunnelse = valgtBestemmelseMedVilkårOgBegrunnelser?.vilkårOgBegrunnelser.every(
      (element) => {
        const harVilkår = valgteVilkår.get(element.vilkår) === SANN;

        if (Utils._isEmpty(element.muligeBegrunnelser)) {
          return harVilkår;
        }

        const valgtBegrunnelseForVilkår = valgteBegrunnelser.get(`${element.vilkår}_begrunnelser`);
        const begrunnelseInneholderFritekst = KV.termFraNestedKTObject(
          begrunnelseKodeverk,
          valgtBegrunnelseForVilkår?.begrunnelseKode
        )?.includes("(fritekst)");

        if (!begrunnelseInneholderFritekst) {
          return harVilkår && valgtBegrunnelseForVilkår;
        }

        const maksLengdeTillatt = 3000;
        const begrunnelseFritekstErForLang =
          (valgtBegrunnelseForVilkår?.begrunnelseFritekst?.length ?? 0) >= maksLengdeTillatt;

        return (
          harVilkår &&
          Utils.streng.harStrengInnhold(valgtBegrunnelseForVilkår?.begrunnelseFritekst) &&
          !begrunnelseFritekstErForLang
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
    const vilkårSomSkalVises: Api.MedlemAvFolketrygden.Bestemmelser.VilkårOgBegrunnelser[] = [];

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
    await dispatch(
      medlemskapsperioderOperations.opprettMedlemskapsperiodeFraBestemmelse(behandlingID, valgtBestemmelse)
    );
    bekreft();
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingBestemmelse_ftrl">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Hvilken bestemmelse skal søknaden vurderes etter?
      </Nav.Typo.Innholdstittel>

      <Nav.Fieldset className="bestemmelse" legend="Bestemmelse">
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

      {bestemmelseIkkeStøttetValgt && <IngenFlytMelding />}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: handleBekreft, disabled: !formIsValid || !redigerbart }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
