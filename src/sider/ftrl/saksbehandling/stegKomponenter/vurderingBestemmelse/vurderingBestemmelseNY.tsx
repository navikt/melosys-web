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
import { folketrygdenkodeverkSelectors } from "../../../../../ducks/folketrygdenkodeverk";
import {
  AvklarteFakta,
  FaktaTypeOverskrifter,
  VilkårOgBestemmelser,
  VurderingBestemmelseProps,
} from "./komponenter/typer";
import { Begrunnelse } from "./vurderingBestemmelse";
import { VilkaarOgBegrunnelserNY } from "./komponenter/vilkaarOgBegrunnelserNY";

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
  const lagredeVilkår = useSelector(vilkarSelectors.VilkarSelector) as any;
  const trygdedekning = useSelector(mottatteOpplysningerSelectors.TrygdedekningSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const vilkårKodeverk = useSelector(folketrygdenkodeverkSelectors.VilkaarSelector);
  const begrunnelseKodeverk = useSelector(folketrygdenkodeverkSelectors.BegrunnelserSelector);

  const [bestemmelser, setBestemmelser] = useState<string[]>([]);
  const [vilkårOgBegrunnelser, setVilkårOgBegrunnelser] = useState<VilkårOgBestemmelser[]>([]);
  const [avklarteFakta, setAvklarteFakta] = useState<AvklarteFakta[]>([]);
  const [lovligeBestemmelser, setLovligeBestemmelser] = useState<string[]>([]);

  const [valgtAvklartFakta, setValgtAvklartFakta] = useState<string>("");
  const [valgteVilkår, setValgteVilkår] = useState<Map<string, boolean>>(new Map());
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState<Map<string, Begrunnelse>>(new Map());
  const [valgtBestemmelse, setValgtBestemmelse] = useState<string>(lagretBestemmelse);

  const ulovligBestemmelseValgt =
    folketrygden2_7ToggleEnabled && Boolean(valgtBestemmelse) && !lovligeBestemmelser.includes(valgtBestemmelse);

  useEffect(() => {
    console.group({ lagredeVilkår });
    lagredeVilkår.forEach((vilkår: VilkårOgBestemmelser) => {
      valgteVilkår.set(vilkår.vilkår, vilkår.defaultOppfylt);
      // if (vilkår.begrunnelseKoder?.length === 1) {
      //   valgteBegrunnelser.set(`${vilkår.vilkaar}_begrunnelser`, {
      //     begrunnelseKode: vilkår.begrunnelseKoder[0],
      //     begrunnelseFritekst: vilkår.begrunnelseFritekst,
      //   });
      // }
    });

    setValgteVilkår(new Map(valgteVilkår));
    setValgteBegrunnelser(new Map(valgteBegrunnelser));
  }, [lagredeVilkår]);

  useEffect(() => {
    Api.Ftrl.hentBestemmelser(behandlingstema).then((res) => setBestemmelser(res.bestemmelser));
    Api.LovligeKombinasjoner.hentBestemmelser(trygdedekning).then(setLovligeBestemmelser);
  }, [behandlingstema]);

  useEffect(() => {
    Api.Ftrl.hentVilkår(valgtBestemmelse, behandlingID).then((res) => setVilkårOgBegrunnelser(res.vilkår));
    Api.Ftrl.hentAvklarteFakta(valgtBestemmelse, behandlingID).then((res) => setAvklarteFakta(res.avklarteFakta));
  }, [valgtBestemmelse, behandlingID]);

  const oppdaterOgLagreVilkår = () => {
    const data = Array.from(valgteVilkår, ([vilkår, verdi]) => {
      const valgtBegrunnelse = valgteBegrunnelser.get(`${vilkår}_begrunnelser`);
      return {
        vilkaar: vilkår,
        oppfylt: verdi,
        begrunnelseKoder: valgtBegrunnelse?.begrunnelseKode ? [valgtBegrunnelse.begrunnelseKode] : [],
        begrunnelseFritekst: valgtBegrunnelse?.begrunnelseFritekst,
      };
    });

    return dispatch(vilkarOperations.send(behandlingID, data));
  };

  const handleBekreft = async () => {
    await oppdaterOgLagreVilkår();
    await dispatch(medlemskapsperioderOperations.opprettMedlemskapsperioderForslag(behandlingID, valgtBestemmelse));
    oppdaterStatus(true);
    bekreft();
  };

  if (!aktivtSteg) return null;

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
            muligeAlternativer={fakta.muligeFakta}
            kodeverkKoder={Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser)}
            name={fakta.faktaType}
            tittel={FaktaTypeOverskrifter[fakta.faktaType]}
            redigerbart={redigerbart}
            valgtAlternativ={valgtAvklartFakta}
            endretAlternativ={(avklartFakta) => setValgtAvklartFakta(avklartFakta)}
          />
        );
      })}

      {vilkårOgBegrunnelser.map((vb) => (
        <VilkaarOgBegrunnelserNY
          key={vb.vilkår}
          vilkårOgBegrunnelser={vb}
          alleValgteVilkår={valgteVilkår}
          alleValgteBegrunnelser={valgteBegrunnelser}
          vilkårKodeverk={vilkårKodeverk}
          begrunnelseKodeverk={begrunnelseKodeverk}
          handleEndreVilkår={(event) =>
            setValgteVilkår(new Map(valgteVilkår.set(event.target.name, !!event.target.value)))
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
      ))}

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
          disabled: !redigerbart || ulovligBestemmelseValgt,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
