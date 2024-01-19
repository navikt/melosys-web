import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Utils from "../../../../../utils";

import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../../ducks/folketrygdenkodeverk";
import { vilkarOperations, vilkarSelectors } from "../../../../../ducks/vilkar";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";

import { BOOLSK_STRING } from "../../../../../constants";

import { VilkaarOgBegrunnelser } from "./komponenter/vilkaarOgBegrunnelser";
import "./vurderingBestemmelse.css";
import { IngenFlytMelding } from "../../../../../felleskomponenter/alertmeldinger";
import { KTObject } from "@navikt/melosys-kodeverk";
import {
  BestemmelseMedVilkårOgBegrunnelser,
  VilkårOgBegrunnelser,
} from "../../../../../services/modules/medlemavfolketrygden/bestemmelser";

const { SANN, USANN } = BOOLSK_STRING;
export const kodeInkludererFritekst = (nestedKtObject: { [key: string]: KTObject[] }, kode?: string) =>
  KV.termFraNestedKTObject(nestedKtObject, kode)?.includes("(fritekst)");

export interface Begrunnelse {
  begrunnelseKode: string;
  begrunnelseFritekst?: string | null;
}

interface VurderingBestemmelseProps {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingBestemmelse = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingBestemmelseProps) => {
  const dispatch = useDispatch();
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const lagretBestemmelse = useSelector(medlemskapsperioderSelectors.BestemmelseSelector);
  const lagredeVilkår = useSelector(vilkarSelectors.VilkarSelector);
  const vilkårKodeverk = useSelector(folketrygdenkodeverkSelectors.VilkaarSelector);
  const begrunnelseKodeverk = useSelector(folketrygdenkodeverkSelectors.BegrunnelserSelector);

  const [støttedeBestemmelser, setStøttedeBestemmelser] = useState<BestemmelseMedVilkårOgBegrunnelser[]>([]);
  const [ikkeStøttedeBestemmelser, setIkkeStøttedeBestemmelser] = useState<string[]>([]);

  const [valgtBestemmelse, setValgtBestemmelse] = useState(lagretBestemmelse);
  const [valgteVilkår, setValgteVilkår] = useState<Map<string, string>>(new Map());
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState<Map<string, Begrunnelse>>(new Map());
  const [muligeVilkår, setMuligeVilkår] = useState<VilkårOgBegrunnelser[]>([]);
  const [formIsValid, setFormIsValid] = useState(false);
  const [harSkjeddEndringer, setHarSkjeddEndringer] = useState(false);

  const bestemmelseIkkeStøttetValgt = ikkeStøttedeBestemmelser?.some((bestemmelse) => bestemmelse === valgtBestemmelse);
  const stegErGyldig = formIsValid && !harSkjeddEndringer;

  const initialiserSteg = async () => {
    await Api.MedlemAvFolketrygden.Bestemmelser.hentMuligeBestemmelser(behandlingstema).then((response) => {
      setStøttedeBestemmelser(response.støttedeBestemmelser);
      setIkkeStøttedeBestemmelser(response.ikkeStøttedeBestemmelser);
      setValgtBestemmelse(
        response.støttedeBestemmelser.some((element) => element.bestemmelse === lagretBestemmelse)
          ? lagretBestemmelse
          : ""
      );
    });

    lagredeVilkår.forEach((vilkår: Api.Vilkar.Vilkaar) => {
      valgteVilkår.set(vilkår.vilkaar, vilkår.oppfylt ? SANN : USANN);
      if (vilkår.begrunnelseKoder?.length === 1) {
        valgteBegrunnelser.set(`${vilkår.vilkaar}_begrunnelser`, {
          begrunnelseKode: vilkår.begrunnelseKoder[0],
          begrunnelseFritekst: vilkår.begrunnelseFritekst,
        });
      }
    });

    setValgteVilkår(new Map(valgteVilkår));
    setValgteBegrunnelser(new Map(valgteBegrunnelser));
  };

  useEffect(() => {
    initialiserSteg();
  }, []);

  const validerForm = () => {
    const valgtBestemmelseMedVilkårOgBegrunnelser = støttedeBestemmelser.find(
      (element) => element.bestemmelse === valgtBestemmelse
    );

    const alleVilkårHarSvarJaOgValgtBegrunnelse = valgtBestemmelseMedVilkårOgBegrunnelser?.vilkårOgBegrunnelser.every(
      (element) => {
        const svartJaPåVilkår = valgteVilkår.get(element.vilkår) === SANN;

        if (Utils._isEmpty(element.muligeBegrunnelser)) {
          return svartJaPåVilkår;
        }

        const valgtBegrunnelseForVilkår = valgteBegrunnelser.get(`${element.vilkår}_begrunnelser`);

        if (kodeInkludererFritekst(begrunnelseKodeverk, valgtBegrunnelseForVilkår?.begrunnelseKode)) {
          const begrunnelseFritekstErForLang = (valgtBegrunnelseForVilkår?.begrunnelseFritekst?.length ?? 0) >= 3000;

          return (
            svartJaPåVilkår &&
            Utils.streng.harStrengInnhold(valgtBegrunnelseForVilkår?.begrunnelseFritekst) &&
            !begrunnelseFritekstErForLang
          );
        }

        return svartJaPåVilkår && valgtBegrunnelseForVilkår;
      }
    );

    setFormIsValid(Boolean(alleVilkårHarSvarJaOgValgtBegrunnelse));
  };

  const oppdaterMuligeVilkår = () => {
    const valgtBestemmelsesVilkårOgBegrunnelser = støttedeBestemmelser.find(
      (it) => it.bestemmelse === valgtBestemmelse
    )?.vilkårOgBegrunnelser;

    if (Utils._isEmpty(valgtBestemmelsesVilkårOgBegrunnelser)) {
      setMuligeVilkår([]);
      return;
    }
    const vilkårSomSkalVises: Api.MedlemAvFolketrygden.Bestemmelser.VilkårOgBegrunnelser[] = [];

    valgtBestemmelsesVilkårOgBegrunnelser?.forEach((vilkårOgBegrunnelser) => {
      if (Utils._isEmpty(vilkårSomSkalVises)) {
        vilkårSomSkalVises.push(vilkårOgBegrunnelser);
        return;
      }
      const [forrigeVilkår] = vilkårSomSkalVises.slice(-1);
      if (valgteVilkår.get(forrigeVilkår.vilkår) === SANN) {
        vilkårSomSkalVises.push(vilkårOgBegrunnelser);
      }
    });
    setMuligeVilkår(vilkårSomSkalVises);
  };

  useEffect(() => {
    oppdaterMuligeVilkår();
    validerForm();
  }, [valgtBestemmelse, valgteVilkår]);

  useEffect(() => {
    validerForm();
  }, [valgteBegrunnelser]);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const oppdaterOgLagreVilkår = () => {
    const data = Array.from(valgteVilkår, ([vilkår, verdi]) => {
      const valgtBegrunnelse = valgteBegrunnelser.get(`${vilkår}_begrunnelser`);
      return {
        vilkaar: vilkår,
        oppfylt: verdi === SANN,
        begrunnelseKoder: valgtBegrunnelse?.begrunnelseKode ? [valgtBegrunnelse.begrunnelseKode] : [],
        begrunnelseFritekst: valgtBegrunnelse?.begrunnelseFritekst,
      };
    });
    return dispatch(vilkarOperations.send(behandlingID, data));
  };

  const handleEndreBestemmelse = (nyBestemmelse: string) => {
    setHarSkjeddEndringer(true);
    setValgtBestemmelse(nyBestemmelse);
    setValgteVilkår(new Map());
    setValgteBegrunnelser(new Map());
    if (!Utils._isEmpty(lagredeVilkår)) dispatch(vilkarOperations.send(behandlingID, []));
  };

  const handleEndreVilkår = (event: ChangeEvent<HTMLInputElement>) => {
    setHarSkjeddEndringer(true);
    const vilkårKode = event.target.name;
    const vilkårSvar = event.target.value;
    setValgteVilkår(new Map(valgteVilkår.set(vilkårKode, vilkårSvar)));
    if (vilkårSvar === USANN && valgteBegrunnelser.get(`${vilkårKode}_begrunnelser`)) {
      valgteBegrunnelser.delete(`${vilkårKode}_begrunnelser`);
      setValgteBegrunnelser(new Map(valgteBegrunnelser));
    }
  };

  const handleEndreBegrunnelseKode = (event: ChangeEvent<HTMLSelectElement>) => {
    setHarSkjeddEndringer(true);
    setValgteBegrunnelser(new Map(valgteBegrunnelser.set(event.target.name, { begrunnelseKode: event.target.value })));
  };

  const handleEndreBegrunnelseFritekst = (valgtBegrunnelse: string, begrunnelseFritekst: string) => {
    // TODO: denne trigges med en gang du går inn i fritekstfeltet
    setHarSkjeddEndringer(true);
    setValgteBegrunnelser(
      new Map(
        valgteBegrunnelser.set(valgtBegrunnelse, {
          begrunnelseKode: valgteBegrunnelser.get(valgtBegrunnelse)!!.begrunnelseKode,
          begrunnelseFritekst,
        })
      )
    );
  };

  const handleBekreft = async () => {
    await oppdaterOgLagreVilkår();
    await dispatch(medlemskapsperioderOperations.opprettMedlemskapsperioderForslag(behandlingID, valgtBestemmelse));
    setHarSkjeddEndringer(false);
    oppdaterStatus(true);
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

      {muligeVilkår.map((vilkårOgBegrunnelser) => (
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
