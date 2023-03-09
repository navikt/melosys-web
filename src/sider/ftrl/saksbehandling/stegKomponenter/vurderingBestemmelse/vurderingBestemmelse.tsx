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

const sorterBestemmelser = (bestemmelser: Api.Medlemskapsperioder.BestemmelseMedVilkaar[]) => {
  bestemmelser
    .sort((a, b) => b.bestemmelse.localeCompare(a.bestemmelse))
    .reverse()
    .forEach((item) => item.vilkårOgBegrunnelser.sort((a, b) => a.vilkaar.localeCompare(b.vilkaar)));
  return bestemmelser;
};

const komponentState = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  bestemmelse: medlemskapsperioderSelectors.BestemmelseSelector(state),
  vilkaarKodeverk: folketrygdenkodeverkSelectors.VilkaarSelector(state),
  begrunnelserKodeverk: folketrygdenkodeverkSelectors.BegrunnelserSelector(state),
});

interface VurderingBestemmelseProps {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingBestemmelse = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingBestemmelseProps) => {
  const dispatch = useDispatch();
  const { behandlingID, behandlingstema, bestemmelse, vilkaarKodeverk, begrunnelserKodeverk, redigerbart } =
    useSelector(komponentState);
  const [bestemmelserMedVilkår] = useAsyncCallbackState<Api.Medlemskapsperioder.HentBestemmelserMedVilkårResponse>(
    () => Api.Medlemskapsperioder.hentBestemmelserMedVilkår(behandlingstema),
    { støttedeBestemmelserMedVilkår: [], ikkeStøttedeBestemmelserMedVilkår: [] },
    [behandlingstema]
  );

  const oppdaterVilkaar = (skjema: any) => dispatch(vilkarOperations.oppdaterState(skjema));
  const [valgtBestemmelse, setValgtBestemmelse] = useState("");
  const [valgteVilkar, setValgteVilkar] = useState<Map<string, string>>(new Map());
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState<Map<string, string>>(new Map());
  const [valgtBestemmelsesSynligeVilkår, setValgtBestemmelsesSynligeVilkår] = useState<
    Api.Medlemskapsperioder.VilkårOgBegrunnelser[]
  >([]);
  const [formIsValid, setFormIsValid] = useState(false);

  const bestemmelseVilkarStøttet = sorterBestemmelser(bestemmelserMedVilkår.støttedeBestemmelserMedVilkår);
  const bestemmelseVilkarIkkeStøttet = sorterBestemmelser(bestemmelserMedVilkår.ikkeStøttedeBestemmelserMedVilkår);

  const bestemmelseIkkeStøttetValgt = bestemmelseVilkarIkkeStøttet?.some(
    (bestemmelseOgVilkår) => bestemmelseOgVilkår.bestemmelse === valgtBestemmelse
  );

  const hentEksisterendeVilkår = async () => {
    // @ts-ignore
    const response: { data: Api.Vilkar.Vilkaar[] } = await dispatch(vilkarOperations.hent(behandlingID));

    handleEndreBestemmelse(bestemmelse);
    response.data?.forEach((vilkar) => {
      valgteVilkar.set(vilkar.vilkaar, vilkar.oppfylt ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN);
      if (vilkar.begrunnelseKoder && vilkar.begrunnelseKoder.length === 1) {
        valgteBegrunnelser.set(`${vilkar.vilkaar}_begrunnelser`, vilkar.begrunnelseKoder[0]);
      }
    });
    setValgteVilkar(new Map(valgteVilkar));
    setValgteBegrunnelser(new Map(valgteBegrunnelser));
  };

  useEffect(() => {
    hentEksisterendeVilkår();
  }, []);

  useEffect(() => {
    const valgtBestemmelsesVilkårOgBegrunnelser = bestemmelseVilkarStøttet.find(
      (bestemmelseMedVilkar) => bestemmelseMedVilkar.bestemmelse === valgtBestemmelse
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
      const [forrigeVilkaar] = vilkårSomSkalVises.slice(-1);
      if (valgteVilkar.get(forrigeVilkaar.vilkaar) === BOOLSK_STRING.SANN) {
        vilkårSomSkalVises.push(vilkårOgMuligeBegrunnelser);
      }
    });
    setValgtBestemmelsesSynligeVilkår(vilkårSomSkalVises);
  }, [valgtBestemmelse, valgteVilkar]);

  useEffect(() => {
    oppdaterStatus(formIsValid);
  }, [formIsValid]);

  const validerForm = () => {
    const valgtBestemmelseMedVilkår = bestemmelseVilkarStøttet.find(
      (element) => element.bestemmelse === valgtBestemmelse
    );
    const alleVilkarHarSvarJaOgvalgtBegrunnelse = valgtBestemmelseMedVilkår?.vilkårOgBegrunnelser.every(
      (element) =>
        valgteVilkar.get(element.vilkaar) === BOOLSK_STRING.SANN &&
        (Utils._isEmpty(element.muligeBegrunnelser) ? true : valgteBegrunnelser.get(`${element.vilkaar}_begrunnelser`))
    );

    setFormIsValid(Boolean(alleVilkarHarSvarJaOgvalgtBegrunnelse));
  };

  useEffect(() => {
    validerForm();
  }, [valgtBestemmelse, valgteVilkar, valgteBegrunnelser]);

  const handleBekreft = () => {
    dispatch(vilkarOperations.lagre());
    setTimeout(() => {
      dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiodeFraBestemmelse());
      bekreft();
    }, 1000);
  };

  const oppdaterVilkaarState = () => {
    const alleVilkår: { [key: string]: boolean } = {};
    valgteVilkar.forEach((value: string, key: string) => {
      alleVilkår[key] = value === BOOLSK_STRING.SANN;
    });
    const alleBegrunnelser: { [key: string]: string[] } = {};
    valgteBegrunnelser.forEach((value: string, key: string) => {
      alleBegrunnelser[key] = [value];
    });
    oppdaterVilkaar({ ...alleBegrunnelser, ...alleVilkår });
  };

  const handleEndreBestemmelse = (nyBestemmelse: string) => {
    setValgtBestemmelse(nyBestemmelse);
    dispatch(medlemskapsperioderOperations.oppdaterBestemmelse(nyBestemmelse));
  };

  const handleEndreVilkar: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValgteVilkar(new Map(valgteVilkar.set(event.target.name, event.target.value)));
    if (event.target.value === BOOLSK_STRING.USANN && valgteBegrunnelser.get(`${event.target.name}_begrunnelser`)) {
      valgteBegrunnelser.delete(`${event.target.name}_begrunnelser`);
      setValgteBegrunnelser(new Map(valgteBegrunnelser));
      oppdaterVilkaarState();
    } else {
      oppdaterVilkaarState();
    }
  };

  const handleEndreBegrunnelse: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setValgteBegrunnelser(new Map(valgteBegrunnelser.set(event.target.name, event.target.value)));
    oppdaterVilkaarState();
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
              {bestemmelseVilkarStøttet.map((bestemmelseMedVilkar) => (
                <option key={bestemmelseMedVilkar.bestemmelse} value={bestemmelseMedVilkar.bestemmelse}>
                  {KV.finnTermFraListe(
                    MKV.KTObjects.folketrygdloven_kap2_bestemmelser,
                    bestemmelseMedVilkar.bestemmelse
                  )}
                </option>
              ))}
              {bestemmelseVilkarStøttet && bestemmelseVilkarIkkeStøttet && <option disabled>{"\u2500"}</option>}
              {bestemmelseVilkarIkkeStøttet.map((bestemmelseMedVilkarIkkeStøttet) => (
                <option
                  key={bestemmelseMedVilkarIkkeStøttet.bestemmelse}
                  value={bestemmelseMedVilkarIkkeStøttet.bestemmelse}
                >
                  {KV.finnTermFraListe(
                    MKV.KTObjects.folketrygdloven_kap2_bestemmelser,
                    bestemmelseMedVilkarIkkeStøttet.bestemmelse
                  )}
                </option>
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      {valgtBestemmelsesSynligeVilkår.map((vilkårOgBegrunnelse) => (
        <VilkaarOgBegrunnelser
          vilkaarOgBegrunnelser={vilkårOgBegrunnelse}
          valgteVilkar={valgteVilkar}
          valgteBegrunnelser={valgteBegrunnelser}
          vilkaarKodeverk={vilkaarKodeverk}
          begrunnelserKodeverk={begrunnelserKodeverk}
          handleEndreVilkar={handleEndreVilkar}
          handleEndreBegrunnelse={handleEndreBegrunnelse}
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
