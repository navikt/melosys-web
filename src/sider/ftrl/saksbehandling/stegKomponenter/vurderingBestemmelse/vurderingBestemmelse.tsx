import { useEffect, useState } from "react";
import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as KV from "../../../../../kodeverk";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { useDispatch, useSelector } from "react-redux";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { ListeVelger } from "./komponenter/listeVelger";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import { vilkarOperations, vilkarSelectors } from "../../../../../ducks/vilkar";
import {
  AvklarteFakta,
  Begrunnelse,
  FaktaTypeOverskrifter,
  VilkårOgBegrunnelser,
  VurderingBestemmelseProps,
} from "./komponenter/typer";
import { VilkaarOgBegrunnelser } from "./komponenter/vilkaarOgBegrunnelser";
import * as Utils from "../../../../../utils";
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";
import { KTObject } from "@navikt/melosys-kodeverk";

export const kodeInkludererFritekst = (nestedKtObject: { [key: string]: KTObject[] }, kode?: string) =>
  KV.termFraNestedKTObject(nestedKtObject, kode)?.includes("(fritekst)");

enum ResetTyper {
  AVKLARTEFAKTA,
  VILKÅR,
}

const { IKKE_YRKESAKTIV_FTRL_2_1_OPPHOLD, IKKE_YRKESAKTIV_RELASJON, ARBEIDSSITUASJON } = MKV.Koder.avklartefaktatyper;

export function VurderingBestemmelse({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingBestemmelseProps) {
  const dispatch = useDispatch();

  const behandlingstatus = useSelector(behandlingerSelectors.BehandlingsstatusKodeSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const lagretBestemmelse = useSelector(medlemskapsperioderSelectors.BestemmelseSelector);
  const lagredeVilkår = useSelector(vilkarSelectors.VilkarSelector) as Api.Vilkar.Vilkaar[];
  const trygdedekning = useSelector(mottatteOpplysningerSelectors.TrygdedekningSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const ikkeYrkesaktivOppholdType = useSelector(oppsummertfaktaSelectors.IkkeYrkesaktivOppholdSelector);
  const ikkeYrkesaktivRelasjonType = useSelector(oppsummertfaktaSelectors.IkkeYrkesaktivRelasjonSelector);
  const arbeidssituasjonType = useSelector(oppsummertfaktaSelectors.ArbeidssituasjonSelector);

  const lagredeValgtevirksomheter = useSelector(oppsummertfaktaSelectors.VirksomhetIDerSelector);
  const selvstendigNaeringsvirksomhetUtland = useSelector(
    mottatteOpplysningerSelectors.SelvstendigNaeringsvirksomhetUtlandSelector,
  );
  const selvstendigNaeringsvirksomhet = useSelector(mottatteOpplysningerSelectors.SelvstendigNaringsvirksomhetSelector);
  const [vilkårOgBegrunnelser, setVilkårOgBegrunnelser] = useState<VilkårOgBegrunnelser[]>([]);
  const [avklarteFakta, setAvklarteFakta] = useState<AvklarteFakta[]>([]);
  const [bestemmelser, setBestemmelser] = useState<string[]>([]);
  const [lovligeBestemmelser, setLovligeBestemmelser] = useState<string[] | undefined>(undefined);
  const [pliktigeBestemmelser, setPliktigeBestemmelser] = useState<string[] | undefined>(undefined);

  const [valgtAvklarteFakta, setValgtAvklarteFakta] = useState<Map<string, string>>(new Map());
  const [valgteVilkår, setValgteVilkår] = useState<Map<string, boolean | null | undefined>>(new Map());
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState<Map<string, Begrunnelse>>(new Map());
  const [valgtBestemmelse, setValgtBestemmelse] = useState<string>(lagretBestemmelse);
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [skalHenteVilkår, setSkalHenteVilkår] = useState<boolean>(false);
  const [skalInitialisere, setSkalInitialisere] = useState<boolean>(true);
  const [harSkjeddEndringer, setHarSkjeddEndringer] = useState<boolean>(false);

  const ulovligBestemmelseValgt =
    Boolean(valgtBestemmelse) &&
    !lovligeBestemmelser?.includes(valgtBestemmelse) &&
    !pliktigeBestemmelser?.includes(valgtBestemmelse);

  const finnesISelvstendigNaeringsvirksomhet = selvstendigNaeringsvirksomhet.some((virksomhet: any) =>
    lagredeValgtevirksomheter.includes(virksomhet.orgnr),
  );
  const finnesISelvstendigNaeringsvirksomhetUtland = selvstendigNaeringsvirksomhetUtland.some((virksomhet: any) =>
    lagredeValgtevirksomheter.includes(virksomhet.uuid),
  );

  const alleSelvstendigeVirksomheter = [...selvstendigNaeringsvirksomhetUtland, ...selvstendigNaeringsvirksomhet];

  const valgteVirksomheterSomIkkeErSelvstendig = lagredeValgtevirksomheter.filter(
    (orgnr) => !alleSelvstendigeVirksomheter.find((virksomhet) => (virksomhet.uuid ?? virksomhet.orgnr) === orgnr),
  );

  const selvstendigNaeringValgt =
    (finnesISelvstendigNaeringsvirksomhet || finnesISelvstendigNaeringsvirksomhetUtland) &&
    Utils._isEmpty(valgteVirksomheterSomIkkeErSelvstendig);

  const ulovligKombinasjonAvSelvstendigNaeringOgVilkår =
    selvstendigNaeringValgt && valgteVilkår.get(MKV.Koder.vilkaar.FTRL_ARBEIDSTAKER);

  const behandlingErAvsluttetMedLagretBestemmelse =
    Boolean(lagretBestemmelse) && behandlingstatus === MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET;
  const stegErGyldig = (formIsValid || behandlingErAvsluttetMedLagretBestemmelse) && !harSkjeddEndringer;

  const kodeverkKoderIBestemmelserNedtrekk: string[] = [
    ...Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser),
    ...Object.values(MKV.KTObjects.vertslandsavtale_bestemmelser),
  ] as string[];

  useEffect(() => {
    setSkalHenteVilkår(false);
    if (skalInitialisere) {
      avklarteFakta.forEach((fakta) => {
        if (ikkeYrkesaktivOppholdType && fakta.muligeFakta.includes(ikkeYrkesaktivOppholdType)) {
          valgtAvklarteFakta.set(fakta.faktaType.kode, ikkeYrkesaktivOppholdType);
        }
        if (ikkeYrkesaktivRelasjonType && fakta.muligeFakta.includes(ikkeYrkesaktivRelasjonType)) {
          valgtAvklarteFakta.set(fakta.faktaType.kode, ikkeYrkesaktivRelasjonType);
        }
        if (arbeidssituasjonType && fakta.muligeFakta.includes(arbeidssituasjonType)) {
          valgtAvklarteFakta.set(fakta.faktaType.kode, arbeidssituasjonType);
        }
      });
      setValgtAvklarteFakta(new Map(valgtAvklarteFakta));
    }
  }, [ikkeYrkesaktivOppholdType, ikkeYrkesaktivRelasjonType, avklarteFakta]);

  useEffect(() => {
    Api.Ftrl.hentBestemmelser(behandlingstema).then((res) => setBestemmelser(res.bestemmelser));
    Api.Ftrl.hentBestemmelser(behandlingstema, trygdedekning)
      .then((res) => setLovligeBestemmelser(res.bestemmelser))
      .catch(() => {
        setLovligeBestemmelser([]);
      });
    Api.Ftrl.hentPliktigeBestemmelser()
      .then((res) => setPliktigeBestemmelser(res.bestemmelser))
      .catch(() => {
        setPliktigeBestemmelser([]);
      });
    reset(ResetTyper.AVKLARTEFAKTA);
    reset(ResetTyper.VILKÅR);
  }, [behandlingstema, trygdedekning]);

  useEffect(() => {
    if (!Utils._isEmpty(valgtBestemmelse) && !ulovligBestemmelseValgt) {
      Api.Ftrl.hentAvklarteFakta(valgtBestemmelse, behandlingID)
        .then((res: any) => {
          setSkalHenteVilkår(res.avklarteFakta.length === 0);
          setAvklarteFakta(res.avklarteFakta);
        })
        .catch(() => setAvklarteFakta([]));
    }
  }, [valgtBestemmelse, behandlingID, ulovligBestemmelseValgt]);

  useEffect(() => {
    if (ulovligBestemmelseValgt) return;

    if (skalHenteVilkår) {
      Api.Ftrl.hentVilkår(valgtBestemmelse, valgtAvklarteFakta, behandlingID, behandlingstema).then((res: any) =>
        setVilkårOgBegrunnelser(res.vilkår),
      );
    }

    if (valgtAvklarteFakta.size > 0 && avklarteFakta.length > 0) {
      Api.Ftrl.hentVilkår(valgtBestemmelse, valgtAvklarteFakta, behandlingID, behandlingstema).then((res: any) =>
        setVilkårOgBegrunnelser(res.vilkår),
      );
    }
  }, [valgtBestemmelse, valgtAvklarteFakta, avklarteFakta, ulovligBestemmelseValgt, skalHenteVilkår, behandlingID]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      valider();
    }, 200);

    return () => clearTimeout(timeoutId);
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
    if (ulovligBestemmelseValgt && lovligeBestemmelser && pliktigeBestemmelser) {
      reset(ResetTyper.AVKLARTEFAKTA);
      reset(ResetTyper.VILKÅR);
    }
  }, [ulovligBestemmelseValgt, lovligeBestemmelser, pliktigeBestemmelser]);

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
    lagredeVilkårListe: Api.Vilkar.Vilkaar[],
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

  const validerValuesMap = (map: Map<string, boolean | null | undefined>) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [, value] of map.entries()) {
      if (value !== true) {
        return false;
      }
    }

    return true;
  };

  const valider = () => {
    let bestemmelserOK = false;
    let avklarteFaktaOK = false;
    let vilkårOK = false;
    let begrunnelserOK = false;

    if (bestemmelser.length > 0) bestemmelserOK = !Utils._isEmpty(valgtBestemmelse);
    if (avklarteFakta.length > 0) avklarteFaktaOK = !Utils._isEmpty(valgtAvklarteFakta);
    if (avklarteFakta.length === 0) avklarteFaktaOK = true;

    if (vilkårOgBegrunnelser.length > 0 && valgteVilkår.size > 0 && valgteVilkår.size === vilkårOgBegrunnelser.length) {
      vilkårOK = validerValuesMap(valgteVilkår);
    }

    vilkårOgBegrunnelser?.forEach((vilkår) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const [, value] of valgteBegrunnelser.entries()) {
        if (vilkår.muligeBegrunnelser.includes(value.begrunnelseKode)) {
          if (kodeInkludererFritekst(MKV.KTObjects.begrunnelser.folketrygdloven, value.begrunnelseKode)) {
            begrunnelserOK = (value.begrunnelseFritekst?.length ?? 0) <= 3000;
          } else {
            begrunnelserOK = true;
          }
        }
      }
    });

    if (vilkårOgBegrunnelser.flatMap((a) => a.muligeBegrunnelser).length === 0) {
      begrunnelserOK = true;
    }

    if (vilkårOgBegrunnelser.length === 0) {
      vilkårOK = true;
      begrunnelserOK = true;
    }

    const altGyldig = bestemmelserOK && avklarteFaktaOK && vilkårOK && begrunnelserOK;
    setFormIsValid(!behandlingErAvsluttetMedLagretBestemmelse ? altGyldig : true);
  };

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const reset = (type: ResetTyper | undefined = undefined) => {
    switch (type) {
      case ResetTyper.AVKLARTEFAKTA:
        setValgtAvklarteFakta(new Map());
        setAvklarteFakta([]);
        setSkalHenteVilkår(false);
        return;
      case ResetTyper.VILKÅR:
        setSkalInitialisere(false);
        setValgteVilkår(new Map());
        setValgteBegrunnelser(new Map());
        setVilkårOgBegrunnelser([]);
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

  const handleBekreft = async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of valgtAvklarteFakta.entries()) {
      if (key === IKKE_YRKESAKTIV_FTRL_2_1_OPPHOLD) {
        await dispatch(oppsummertfaktaOperations.sendIkkeYrkesaktivOppholdtype(behandlingID, value));
      }

      if (key === IKKE_YRKESAKTIV_RELASJON) {
        await dispatch(oppsummertfaktaOperations.sendIkkeYrkesaktivRelasjontype(behandlingID, value));
      }

      if (key === ARBEIDSSITUASJON) {
        await dispatch(oppsummertfaktaOperations.sendArbeidssituasjontype(behandlingID, value));
      }
    }

    await dispatch(vilkarOperations.send(behandlingID, mapVilkårOgBegrunnelser()));
    await dispatch(medlemskapsperioderOperations.opprettMedlemskapsperioderForslag(behandlingID, valgtBestemmelse));
    setHarSkjeddEndringer(false);
    oppdaterStatus(true);
    bekreft();
  };

  const handleSlettAvklartefakta = () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key] of valgtAvklarteFakta.entries()) {
      if ([IKKE_YRKESAKTIV_FTRL_2_1_OPPHOLD, IKKE_YRKESAKTIV_RELASJON, ARBEIDSSITUASJON].includes(key)) {
        dispatch(oppsummertfaktaOperations.slettAvklartefakta(behandlingID, key));
      }
    }
  };

  if (!aktivtSteg) return null;
  let harReturnertNullIVilkårListe = false;
  return (
    <div className="vurderingBestemmelse_ftrl">
      <Nav.Heading level="1" className="stegvelgertittel">
        Bestemmelse
      </Nav.Heading>

      <ListeVelger
        muligeAlternativer={bestemmelser}
        kodeverkKoder={kodeverkKoderIBestemmelserNedtrekk}
        name="bestemmelser"
        tittel="Hvilken bestemmelse skal søknaden vurderes etter?"
        redigerbart={redigerbart}
        valgtAlternativ={valgtBestemmelse}
        endretAlternativ={(bestemmelse) => {
          setHarSkjeddEndringer(true);
          handleSlettAvklartefakta();
          reset(ResetTyper.AVKLARTEFAKTA);
          reset(ResetTyper.VILKÅR);
          setValgtBestemmelse(bestemmelse);
          if (!Utils._isEmpty(lagredeVilkår)) dispatch(vilkarOperations.send(behandlingID, []));
          if (lagretBestemmelse) dispatch(medlemskapsperioderOperations.slettMedlemskapsperioder(behandlingID));
        }}
      />

      {avklarteFakta.map((fakta) => {
        return (
          <ListeVelger
            key={fakta.faktaType.kode}
            muligeAlternativer={fakta.muligeFakta}
            kodeverkKoder={MKV.KTObjects[FaktaTypeOverskrifter[fakta.faktaType.kode].kodeverk]}
            name={fakta.faktaType.kode}
            tittel={FaktaTypeOverskrifter[fakta.faktaType.kode].tittel}
            redigerbart={redigerbart}
            valgtAlternativ={valgtAvklarteFakta.get(fakta.faktaType.kode) ?? ""}
            endretAlternativ={(avklartFakta) => {
              setHarSkjeddEndringer(true);
              reset(ResetTyper.VILKÅR);
              setValgtAvklarteFakta(new Map(valgtAvklarteFakta.set(fakta.faktaType.kode, avklartFakta)));
            }}
          />
        );
      })}

      {vilkårOgBegrunnelser?.map((vb, index, hele) => {
        if (!behandlingErAvsluttetMedLagretBestemmelse) {
          if (harReturnertNullIVilkårListe) return null;
          const forrige = hele[index - 1];

          if (forrige && valgteVilkår.get(forrige.vilkår) !== true) {
            harReturnertNullIVilkårListe = true;
            return null;
          }
          if (
            forrige?.vilkår === MKV.Koder.vilkaar.FTRL_ARBEIDSTAKER &&
            ulovligKombinasjonAvSelvstendigNaeringOgVilkår
          ) {
            harReturnertNullIVilkårListe = true;
            return null;
          }
        }

        return (
          <VilkaarOgBegrunnelser
            key={vb.vilkår}
            vilkårOgBegrunnelser={vb}
            alleValgteVilkår={valgteVilkår}
            alleValgteBegrunnelser={valgteBegrunnelser}
            selvstendigNæringValgt={selvstendigNaeringValgt}
            handleEndreVilkår={(name, value) => {
              setHarSkjeddEndringer(true);
              setValgteVilkår(new Map(valgteVilkår.set(name, value)));
            }}
            handleEndreBegrunnelseKode={(event) => {
              setHarSkjeddEndringer(true);
              setValgteBegrunnelser(
                new Map(valgteBegrunnelser.set(event.target.name, { begrunnelseKode: event.target.value })),
              );
            }}
            handleEndreBegrunnelseFritekst={(valgtBegrunnelse: string, begrunnelseFritekst: string) => {
              setHarSkjeddEndringer(true);
              setValgteBegrunnelser(
                new Map(
                  valgteBegrunnelser.set(valgtBegrunnelse, {
                    begrunnelseKode: valgteBegrunnelser.get(valgtBegrunnelse)!.begrunnelseKode,
                    begrunnelseFritekst,
                  }),
                ),
              );
            }}
            redigerbart={redigerbart}
          />
        );
      })}

      {ulovligBestemmelseValgt && (
        <Nav.Alert variant="error">
          <Nav.BodyLong size="small">
            Dekning på steg Inngang kan ikke gis i kombinasjon med denne bestemmelsen.
          </Nav.BodyLong>
        </Nav.Alert>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !redigerbart || ulovligBestemmelseValgt || !formIsValid,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}
