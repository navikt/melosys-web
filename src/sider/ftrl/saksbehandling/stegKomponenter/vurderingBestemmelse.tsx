import { ChangeEventHandler, Fragment, useEffect, useMemo, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../../melosyskodeverk";
import * as API from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";

import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { vilkarOperations, vilkarSelectors } from "../../../../ducks/vilkar";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";

import { BOOLSK_STRING } from "../../../../constants";
import { FlytFinnesIkke } from "../vurderingStartKomponenter";
import "./vurderingBestemmelse.css";

interface VilkarOgBegrunnelser {
  vilkaar: string;
  muligeBegrunnelser: string[];
}

const komponentState = (state: RootState) => ({
  vilkarListe: vilkarSelectors.VilkarSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  bestemmelse: medlemskapsperioderSelectors.BestemmelseSelector(state),
  vilkaarKodeverk: folketrygdenkodeverkSelectors.VilkaarSelector(state),
  begrunnelserKodeverk: folketrygdenkodeverkSelectors.BegrunnelserSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
});

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingBestemmelse = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();
  const { bestemmelseVilkar } = useContext(SaksbehandlingContext);
  const {
    behandlingID,
    behandlingstema,
    vilkarListe,
    bestemmelse,
    vilkaarKodeverk,
    begrunnelserKodeverk,
    redigerbart,
  } = useSelector(komponentState);
  const hentVilkaar = (behandlingsId: string) => dispatch(vilkarOperations.hent(behandlingsId));
  const oppdaterVilkaar = (skjema: any) => dispatch(vilkarOperations.oppdaterState(skjema));

  const [bestemmelseVilkarStøttet, setBestemmelseVilkarStøttet] = useState<any[]>([]);
  const [filtrerteVilkår, setFiltrerteVilkår] = useState<any[]>([]);
  const [bestemmelseVilkarIkkeStøttet, setBestemmelseVilkarIkkeStøttet] = useState<any[]>([]);
  const [bestemmelseIkkeStøttetValgt, setBestemmelseIkkeStøttetValgt] = useState(false);
  const [valgtBestemmelse, setValgtBestemmelse] = useState("");
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState(new Map());
  const [valgteVilkar, setValgteVilkar] = useState(new Map());
  const [erAlleValgGjort, setErAlleValgGjort] = useState(false);
  const SAERLIG_GRUNN = "SAERLIG_GRUNN";

  const hjelpetekster = new Map([
    [
      SAERLIG_GRUNN,
      "Nedtrekksmenyen inneholder grupper av personer som kan tas opp etter en rimelighetsvurdering i tilfeller der en søknad om medlemskap vurderes etter § 2-8 andre ledd.",
    ],
    [
      MKV.Koder.vilkaar.FTRL_2_8_FORUTGÅENDE_TRYGDETID,
      "Husk at perioder med trygdetid fra andre EØS-land sidestilles med norsk trygdetid.",
    ],
  ]);

  const hentBestemmelser = async () => {
    if (behandlingstema) {
      const bestemmelserResponse = await API.Medlemskapsperioder.hentBestemmelserMedVilkår(behandlingstema);
      setBestemmelseVilkarStøttet(sorterBestemmelser(bestemmelserResponse.støttedeBestemmelserMedVilkår));
      setBestemmelseVilkarIkkeStøttet(sorterBestemmelser(bestemmelserResponse.ikkeStøttedeBestemmelserMedVilkår));
    }
  };

  const sorterBestemmelser = (bestemmelser: any) => {
    bestemmelser
      .sort((a: any, b: any) => b.bestemmelse.localeCompare(a.bestemmelse))
      .reverse()
      .forEach((bestemmelseRes: any) =>
        bestemmelseRes.vilkårOgBegrunnelser.sort((a: any, b: any) => a.vilkaar.localeCompare(b.vilkaar))
      );
    return bestemmelser;
  };

  useEffect(() => {
    const filtrerteBestemmelsesVilkår = bestemmelseVilkarStøttet.find(
      (bestemmelseMedVilkar) => bestemmelseMedVilkar.bestemmelse === valgtBestemmelse
    );

    const { vilkårOgBegrunnelser } = filtrerteBestemmelsesVilkår ?? { vilkårOgBegrunnelser: [] };
    const alleFiltrerteVilkår = [];

    if (vilkårOgBegrunnelser.length > 0) {
      alleFiltrerteVilkår.push(vilkårOgBegrunnelser[0]);
    }

    vilkårOgBegrunnelser.forEach((vilkårOgMuligeBegrunnelser: any, index: number) => {
      if (valgteVilkar.get(vilkårOgMuligeBegrunnelser.vilkaar) === BOOLSK_STRING.SANN) {
        if (vilkårOgBegrunnelser[index + 1] !== undefined) {
          alleFiltrerteVilkår.push(vilkårOgBegrunnelser[index + 1]);
        }
      }
    });

    setFiltrerteVilkår(alleFiltrerteVilkår);
  }, [valgteVilkar, valgtBestemmelse, valgteBegrunnelser]);

  useEffect(() => {
    if (bestemmelseVilkarStøttet.length === 0 && bestemmelseVilkarIkkeStøttet.length === 0) {
      hentBestemmelser();
    }
  }, [behandlingstema]);

  useEffect(() => {
    oppdaterStatus(erAlleValgGjort);
  }, [erAlleValgGjort]);

  const handleEndreBestemmelse = (nyBestemmelse: string) => {
    setValgtBestemmelse(nyBestemmelse);
    dispatch(medlemskapsperioderOperations.oppdaterBestemmelse(nyBestemmelse));
  };

  useEffect(() => {
    hentVilkaar(behandlingID);
  }, [behandlingID]);

  useMemo(() => {
    if (vilkarListe.length !== valgteVilkar.size) {
      hentVilkaar(behandlingID);
      setValgteVilkar(new Map());
    }
  }, [vilkarListe]);

  useEffect(() => {
    handleEndreBestemmelse(bestemmelse);
    vilkarListe.forEach((vilkar: any) => {
      valgteVilkar.set(vilkar.vilkaar, vilkar.oppfylt ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN);
      if (vilkar.begrunnelseKoder && vilkar.begrunnelseKoder.length === 1) {
        valgteBegrunnelser.set(`${vilkar.vilkaar}_begrunnelser`, vilkar.begrunnelseKoder[0]);
      }
    });
    setValgteVilkar(new Map(valgteVilkar));
    setValgteBegrunnelser(new Map(valgteBegrunnelser));
  }, [vilkarListe]);

  useEffect(() => {
    setBestemmelseIkkeStøttetValgt(
      bestemmelseVilkarIkkeStøttet.find(
        (bestemmelseOgVilkår: any) => bestemmelseOgVilkår.bestemmelse === valgtBestemmelse
      ) !== undefined
    );
    const valgteBestemmelseVilkar = bestemmelseVilkarStøttet.find(
      (element) => element.bestemmelse === valgtBestemmelse
    );
    const alleVilkarHarSvarJaOgvalgtBegrunnelse =
      valgteBestemmelseVilkar &&
      valgteBestemmelseVilkar.vilkårOgBegrunnelser.filter(
        (vilkar: any) =>
          valgteVilkar.get(vilkar.vilkaar) === BOOLSK_STRING.SANN &&
          (vilkar.muligeBegrunnelser.length > 0 ? valgteBegrunnelser.get(`${vilkar.vilkaar}_begrunnelser`) : true)
      ).length === valgteBestemmelseVilkar.vilkårOgBegrunnelser.length;

    setErAlleValgGjort(!!alleVilkarHarSvarJaOgvalgtBegrunnelse);
  }, [valgteBegrunnelser, valgtBestemmelse, valgteVilkar]);

  const handleBekreft = () => {
    dispatch(vilkarOperations.lagre());
    setTimeout(() => {
      dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiodeFraBestemmelse());
      bekreft();
    }, 1000);
  };

  const oppdaterAlleVilkaarOgBegrunnelser = () => {
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

  const handleEndreVilkar: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValgteVilkar(new Map(valgteVilkar.set(event.target.name, event.target.value)));
    if (event.target.value === BOOLSK_STRING.USANN && valgteBegrunnelser.get(`${event.target.name}_begrunnelser`)) {
      valgteBegrunnelser.delete(`${event.target.name}_begrunnelser`);
      setValgteBegrunnelser(new Map(valgteBegrunnelser));
      oppdaterAlleVilkaarOgBegrunnelser();
    } else {
      oppdaterAlleVilkaarOgBegrunnelser();
    }
  };

  const handleEndreBegrunnelse: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setValgteBegrunnelser(new Map(valgteBegrunnelser.set(event.target.name, event.target.value)));
    oppdaterAlleVilkaarOgBegrunnelser();
  };

  const Vilkaar = ({ vilkaar, muligeBegrunnelser }: VilkarOgBegrunnelser) => {
    const hjelpetekstForVilkaar = hjelpetekster.get(vilkaar);
    const valgteVilkarForVilkaar = valgteVilkar.get(`${vilkaar}`);

    return (
      <Fragment>
        <Nav.Fieldset
          className="radio"
          legend={
            <LabelMedHjelpetekst
              label={KV.finnTermFraListe(vilkaarKodeverk, vilkaar)}
              hjelpetekst={hjelpetekstForVilkaar}
            />
          }
        >
          <Nav.Row>
            <Nav.Column xs="1">
              <Nav.Radio
                label="Ja"
                name={vilkaar}
                onChange={handleEndreVilkar}
                checked={valgteVilkarForVilkaar === BOOLSK_STRING.SANN}
                value={BOOLSK_STRING.SANN}
                key={BOOLSK_STRING.SANN}
                disabled={!redigerbart}
              />
            </Nav.Column>
            <Nav.Column xs="1">
              <Nav.Radio
                label="Nei"
                name={vilkaar}
                onChange={handleEndreVilkar}
                checked={valgteVilkarForVilkaar === BOOLSK_STRING.USANN}
                value={BOOLSK_STRING.USANN}
                key={BOOLSK_STRING.USANN}
                disabled={!redigerbart}
              />
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
        {valgteVilkarForVilkaar === BOOLSK_STRING.USANN && (
          <div className="flytFinnesIkke">
            <FlytFinnesIkke />
          </div>
        )}
        {muligeBegrunnelser.length > 0 && valgteVilkarForVilkaar === BOOLSK_STRING.SANN && (
          <Nav.Fieldset
            className="select"
            legend={<LabelMedHjelpetekst label="Velg særlig grunn" hjelpetekst={hjelpetekster.get(SAERLIG_GRUNN)} />}
          >
            <Nav.Row>
              <Nav.Column xs="7">
                <Nav.Select
                  label=""
                  bredde="fullbredde"
                  onChange={handleEndreBegrunnelse}
                  name={`${vilkaar}_begrunnelser`}
                  value={valgteBegrunnelser.get(`${vilkaar}_begrunnelser`)}
                  disabled={!redigerbart}
                >
                  <option key="" value="" disabled={!!valgteBegrunnelser.get(`${vilkaar}_begrunnelser`)}>
                    Velg
                  </option>
                  {muligeBegrunnelser.map((begrunnelse: any) => (
                    <option key={begrunnelse} value={begrunnelse}>
                      {KV.termFraNestedKTObject(begrunnelserKodeverk, begrunnelse)}
                    </option>
                  ))}
                </Nav.Select>
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
        )}
      </Fragment>
    );
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
              // eslint-disable-next-line no-return-await
              onChange={async (event) => await handleEndreBestemmelse(event.target.value)}
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

      {filtrerteVilkår.map((vilkårOgBegrunnelse) => (
        <Vilkaar
          key={vilkårOgBegrunnelse.vilkaar}
          vilkaar={vilkårOgBegrunnelse.vilkaar}
          muligeBegrunnelser={vilkårOgBegrunnelse.muligeBegrunnelser}
        />
      ))}

      {bestemmelseIkkeStøttetValgt && (
        <div className="flytFinnesIkke">
          <FlytFinnesIkke />
        </div>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: handleBekreft, disabled: !erAlleValgGjort || !redigerbart }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
