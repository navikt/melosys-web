import { useEffect, useState } from "react";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { useDispatch, useSelector } from "react-redux";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { ListeVelgerFtrl } from "./komponenter/listeVelger";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { MELOSYS_FOLKETRYGDEN_2_7 } from "../../../../../featuretoggle/toggleNavn";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import { vilkarOperations, vilkarSelectors } from "../../../../../ducks/vilkar";
import {
  AvklarteFakta,
  FaktaTypeOverskrifter,
  VilkårOgBegrunnelser,
  VurderingBestemmelseProps,
} from "./komponenter/typer";
import { Begrunnelse } from "./vurderingBestemmelse";
import { VilkaarOgBegrunnelserNY } from "./komponenter/vilkaarOgBegrunnelserNY";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../../../ducks/avklartefakta";
import { _isBoolean, _isEmpty, _isNil } from "../../../../../utils";

enum ResetTyper {
  AVKLARTEFAKTA,
  VILKÅR,
}

export const VurderingBestemmelserV2 = ({
  bekreft,
  tilbake,
  aktivtSteg,
  oppdaterStatus,
}: VurderingBestemmelseProps) => {
  const folketrygden2_7ToggleEnabled = useFeatureToggle(MELOSYS_FOLKETRYGDEN_2_7);
  const dispatch = useDispatch();

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const lagretBestemmelse = useSelector(medlemskapsperioderSelectors.BestemmelseSelector);
  const lagredeVilkår = useSelector(vilkarSelectors.VilkarSelector) as Api.Vilkar.Vilkaar[];
  const trygdedekning = useSelector(mottatteOpplysningerSelectors.TrygdedekningSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const lagredeAvklarteFakta = useSelector(avklartefaktaSelectors.AvklartefaktaSelector) as {
    avklartefaktaKode: string;
    fakta: string[];
  }[];
  const [vilkårOgBegrunnelser, setVilkårOgBegrunnelser] = useState<VilkårOgBegrunnelser[]>([]);
  const [avklarteFakta, setAvklarteFakta] = useState<AvklarteFakta[]>([]);
  const [bestemmelser, setBestemmelser] = useState<string[]>([]);
  const [lovligeBestemmelser, setLovligeBestemmelser] = useState<string[]>([]);
  const [pliktigeBestemmelser, setPliktigeBestemmelser] = useState<string[]>([]);

  const [valgtAvklarteFakta, setValgtAvklarteFakta] = useState<Map<string, string>>(new Map());
  const [valgteVilkår, setValgteVilkår] = useState<Map<string, boolean | null | undefined>>(new Map());
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState<Map<string, Begrunnelse>>(new Map());
  const [valgtBestemmelse, setValgtBestemmelse] = useState<string>(lagretBestemmelse);
  const [besvartOgGodkjent, setBesvartOgGodkjent] = useState<boolean>(false);

  const [skalInitialisere, setSkalInitialisere] = useState<boolean>(true);

  const ulovligBestemmelseValgt =
    folketrygden2_7ToggleEnabled &&
    Boolean(valgtBestemmelse) &&
    !lovligeBestemmelser.includes(valgtBestemmelse) &&
    !pliktigeBestemmelser.includes(valgtBestemmelse);

  useEffect(() => {
    dispatch(avklartefaktaOperations.hent(behandlingID));
  }, [behandlingID]);

  useEffect(() => {
    if (skalInitialisere) {
      lagredeAvklarteFakta.forEach((af) => valgtAvklarteFakta.set(af.avklartefaktaKode, af.fakta[0]));
      setValgtAvklarteFakta(new Map(valgtAvklarteFakta));
    }
  }, [lagredeAvklarteFakta]);

  useEffect(() => {
    Api.Ftrl.hentBestemmelser(behandlingstema).then((res) => setBestemmelser(res.bestemmelser));
    Api.Ftrl.hentBestemmelser(behandlingstema, trygdedekning).then((res) => setLovligeBestemmelser(res.bestemmelser));
    Api.Ftrl.hentPliktigeBestemmelser().then((res) => setPliktigeBestemmelser(res.bestemmelser));
    reset(ResetTyper.AVKLARTEFAKTA);
  }, [behandlingstema, trygdedekning]);

  useEffect(() => {
    Api.Ftrl.hentAvklarteFakta(valgtBestemmelse, behandlingID)
      .then((res) => setAvklarteFakta(res.avklarteFakta))
      .catch(() => setAvklarteFakta([]));
    reset(ResetTyper.VILKÅR);
  }, [valgtBestemmelse, behandlingID]);

  useEffect(() => {
    Api.Ftrl.hentVilkår(valgtBestemmelse, valgtAvklarteFakta, behandlingID)
      .then((res: any) => setVilkårOgBegrunnelser(res.vilkår))
      .catch(() => setVilkårOgBegrunnelser([]));
  }, [valgtBestemmelse, valgtAvklarteFakta, behandlingID]);

  useEffect(() => {
    valider();
  }, [
    valgtBestemmelse,
    valgtAvklarteFakta,
    valgteVilkår,
    valgteBegrunnelser,
    bestemmelser,
    avklarteFakta,
    vilkårOgBegrunnelser,
  ]);

  useEffect(() => {
    const { tidligereValgteVilkår, tidligereValgteBegrunnelser } =
      mapLagredeVilkårTilValgteVilkårOgBegrunnelser(lagredeVilkår);
    setSkalInitialisere(true);
    setValgteVilkår(new Map(tidligereValgteVilkår));
    setValgteBegrunnelser(new Map(tidligereValgteBegrunnelser));
  }, [lagredeVilkår]);

  useEffect(() => {
    if (!skalInitialisere) {
      vilkårOgBegrunnelser.forEach((vb) => {
        setValgteVilkår(new Map(valgteVilkår.set(vb.vilkår, vb.defaultOppfylt)));
        setValgteBegrunnelser(new Map());
      });
    }
  }, [vilkårOgBegrunnelser, skalInitialisere]);

  const mapLagredeVilkårTilValgteVilkårOgBegrunnelser = (
    lagredeVilkårListe: Api.Vilkar.Vilkaar[]
  ): { tidligereValgteVilkår: Map<string, boolean>; tidligereValgteBegrunnelser: Map<string, Begrunnelse> } => {
    const tidligereValgteVilkår: Map<string, boolean> = new Map();
    const tidligereValgteBegrunnelser: Map<string, Begrunnelse> = new Map();

    lagredeVilkårListe.forEach((vilkår: Api.Vilkar.Vilkaar) => {
      tidligereValgteVilkår.set(vilkår.vilkaar, vilkår.oppfylt);
      if (vilkår.begrunnelseKoder?.length === 1) {
        tidligereValgteBegrunnelser.set(`${vilkår.vilkaar}`, {
          begrunnelseKode: vilkår.begrunnelseKoder[0],
          begrunnelseFritekst: vilkår.begrunnelseFritekst,
        });
      }
    });
    return { tidligereValgteVilkår, tidligereValgteBegrunnelser };
  };

  const valider = () => {
    let bestemmelserOK = true;
    let avklarteFaktaOK = true;
    let vilkårOK = true;
    let begrunnelserOK = true;

    if (bestemmelser.length > 0) bestemmelserOK = !_isEmpty(valgtBestemmelse);
    if (avklarteFakta.length > 0) avklarteFaktaOK = !_isEmpty(valgtAvklarteFakta);

    vilkårOgBegrunnelser?.forEach((vilkår) => {
      if (!valgteVilkår.get(vilkår.vilkår)) {
        vilkårOK = false;
      }
    });

    vilkårOgBegrunnelser?.forEach((vilkår) => {
      if (!valgteBegrunnelser.get(vilkår.vilkår) && vilkår.muligeBegrunnelser.length > 0) {
        begrunnelserOK = false;
      }
    });
    const altGyldig = bestemmelserOK && avklarteFaktaOK && vilkårOK && begrunnelserOK;
    oppdaterStatus(altGyldig);
    setBesvartOgGodkjent(altGyldig);
  };

  const reset = (type: ResetTyper | undefined = undefined) => {
    switch (type) {
      case ResetTyper.AVKLARTEFAKTA:
        setValgtAvklarteFakta(new Map());
        return;
      case ResetTyper.VILKÅR:
        setSkalInitialisere(false);

        setValgteVilkår(new Map());
        setValgteBegrunnelser(new Map());
        return;
      default:
        setValgtBestemmelse(lagretBestemmelse);
        setValgteVilkår(new Map());
        setValgteBegrunnelser(new Map());
        setValgtAvklarteFakta(new Map());
    }
  };

  const mapVilkårOgBegrunnelser = () => {
    const data = Array.from(valgteVilkår, ([vilkår, verdi]) => {
      const valgtBegrunnelse = valgteBegrunnelser.get(`${vilkår}`);
      return {
        vilkaar: vilkår,
        oppfylt: verdi,
        begrunnelseKoder: valgtBegrunnelse?.begrunnelseKode ? [valgtBegrunnelse.begrunnelseKode] : [],
        begrunnelseFritekst: valgtBegrunnelse?.begrunnelseFritekst,
      };
    });

    return data;
  };

  const lagAvklarteFakta = () => {
    const avklarteFaktaRes = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of valgtAvklarteFakta.entries()) {
      avklarteFaktaRes.push({
        avklartefaktaKode: key,
        fakta: [value],
        referanse: key,
      });
    }

    return avklarteFaktaRes;
  };

  const handleBekreft = async () => {
    await dispatch(avklartefaktaOperations.send(behandlingID, lagAvklarteFakta()));
    await dispatch(vilkarOperations.send(behandlingID, mapVilkårOgBegrunnelser()));
    await dispatch(medlemskapsperioderOperations.opprettMedlemskapsperioderForslag(behandlingID, valgtBestemmelse));
    oppdaterStatus(true);
    bekreft();
  };

  if (!aktivtSteg) return null;
  let harReturnertNullIVilkårListe = false;

  return (
    <div className="vurderingBestemmelse_ftrl">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Bestemmelse</Nav.Typo.Innholdstittel>

      <ListeVelgerFtrl
        muligeAlternativer={bestemmelser}
        kodeverkKoder={Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser)}
        name="bestemmelser"
        tittel="Hvilken bestemmelse skal søknaden vurderes etter?"
        redigerbart={redigerbart}
        valgtAlternativ={valgtBestemmelse}
        endretAlternativ={(bestemmelse) => setValgtBestemmelse(bestemmelse)}
      />

      {avklarteFakta.map((fakta) => {
        return (
          <ListeVelgerFtrl
            key={fakta.faktaType.kode}
            muligeAlternativer={fakta.muligeFakta}
            kodeverkKoder={MKV.KTObjects[FaktaTypeOverskrifter[fakta.faktaType.kode].kodeverk]}
            name={fakta.faktaType.kode}
            tittel={FaktaTypeOverskrifter[fakta.faktaType.kode].tittel}
            redigerbart={redigerbart}
            valgtAlternativ={valgtAvklarteFakta.get(fakta.faktaType.kode) ?? ""}
            endretAlternativ={(avklartFakta) => {
              reset(ResetTyper.VILKÅR);
              setValgtAvklarteFakta(new Map(valgtAvklarteFakta.set(fakta.faktaType.kode, avklartFakta)));
            }}
          />
        );
      })}

      {vilkårOgBegrunnelser?.map((vb, index, hele) => {
        if (harReturnertNullIVilkårListe) return null;
        const forrige = hele[index - 1];
        if (forrige && valgteVilkår.get(forrige.vilkår) !== true) {
          harReturnertNullIVilkårListe = true;
          return null;
        }

        return (
          <VilkaarOgBegrunnelserNY
            key={vb.vilkår}
            vilkårOgBegrunnelser={vb}
            alleValgteVilkår={valgteVilkår}
            alleValgteBegrunnelser={valgteBegrunnelser}
            vilkårKodeverk={MKV.KTObjects.vilkaar}
            begrunnelseKodeverk={MKV.KTObjects.begrunnelser.folketrygdloven.ftrl_2_7_begrunnelser}
            handleEndreVilkår={(event) =>
              setValgteVilkår(new Map(valgteVilkår.set(event.target.name, Boolean(event.target.value === "true"))))
            }
            handleEndreBegrunnelseKode={(event) =>
              setValgteBegrunnelser(
                new Map(valgteBegrunnelser.set(event.target.name, { begrunnelseKode: event.target.value }))
              )
            }
            handleEndreBegrunnelseFritekst={(valgtBegrunnelse: string, begrunnelseFritekst: string) =>
              setValgteBegrunnelser(
                new Map(
                  valgteBegrunnelser.set(valgtBegrunnelse, {
                    begrunnelseKode: valgteBegrunnelser.get(valgtBegrunnelse)!!.begrunnelseKode,
                    begrunnelseFritekst,
                  })
                )
              )
            }
            redigerbart={redigerbart}
          />
        );
      })}

      {ulovligBestemmelseValgt && (
        <Nav.AlertStripeFeil>
          <Nav.Typo.Normaltekst>
            Dekning på steg Inngang kan ikke gis i kombinasjon med denne bestemmelsen.
          </Nav.Typo.Normaltekst>
        </Nav.AlertStripeFeil>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !redigerbart || ulovligBestemmelseValgt || !besvartOgGodkjent,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
