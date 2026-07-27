import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";
import { OK } from "../../../../ducks/aarsavregning/types";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import {
  AarsavregningListResponse,
  AarsavregningResponse,
} from "../../../../services/modules/aarsavregning/aarsavregning";
import "./vurderingAarsavregningInngang.less";

import { FellesHandlersContext } from "../../../../contexts";
import { behandlingsresultatOperations } from "../../../../ducks/behandlingsresultat";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { AarsavregningMedGrunnlag } from "./aarsavregningMedGrunnlag/aarsavregningMedGrunnlag";
import { AarsavregningUtenEllerDeltGrunnlag } from "./aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";
import { TidligereGrunnlag } from "./komponenter/tidligereGrunnlag";
import { ÅRSAVREGNING_EØS_PENSJONIST } from "../../../../featuretoggle/toggleNavn";
import * as Utils from "../../../../utils";
import { useFeatureToggle } from "../../../../featuretoggle";

const { FASTSATT_TRYGDEAVGIFT, IKKE_FASTSATT } = MKV.Koder.behandlinger.behandlingsresultattyper;
const { MANGLENDE_INNBETALING_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingstyper;

const DELT_GRUNNLAG_HJELPETEKST = (
  <>
    <p>Du skal kun legge til informasjon fra Avgiftssystemet hvis:</p>
    <ul>
      <li>perioden er sammenhengende med perioden i Melosys</li>
      <li>vedtaket er fattet på samme vilkår som i Melosys</li>
      <li>vedtaket gjelder samme arbeidsforhold/-situasjon</li>
    </ul>
    <p>For mer veiledning se rutiner for årsavregning.</p>
  </>
);

const DELT_GRUNNLAG_INNBETALT_TRYGDEAVGIFT_HJELPETEKST = (
  <p>
    Oppgi innbetalt avgift hvis innbetalt beløp ikke samsvarer med tidligere beregnet trygdeavgift. Dette kan for
    eksempel skyldes at det ikke har vært mulig å trekke fullt beløp fra pensjon, eller at det også er innbetalt avgift
    i samme sak i Avgiftssystemet.
  </p>
);

const behandlingHarÅrsavregning = (behandlingID: number, årsavregningList: AarsavregningListResponse[]) => {
  return årsavregningList.find((aarsavregning) => aarsavregning.behandlingID === behandlingID);
};

const årsavregningErNyVurdering = (
  behandlingID: number,
  årsavregningList: AarsavregningListResponse[],
  aar: number,
) => {
  return årsavregningList.find(
    (aarsavregning) =>
      aarsavregning.behandlingID !== behandlingID &&
      aarsavregning.aar === aar &&
      aarsavregning.resultattype.kode === FASTSATT_TRYGDEAVGIFT,
  );
};

const fagsakHarManglendeInnbetaling = async (saksnummer: string) => {
  const fagsaker = await Api.Fagsaker.sok.send({ saksnummer, ident: null, orgnr: null });
  const fagsak = fagsaker[0];
  return fagsak.behandlingOversikter.some(
    (behandling) =>
      behandling.behandlingstype.kode === MANGLENDE_INNBETALING_TRYGDEAVGIFT &&
      behandling.behandlingsresultattype.kode === IKKE_FASTSATT,
  );
};

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function VurderingAarsavregningInngang({ bekreft, oppdaterStatus, aktivtSteg }: Props) {
  const [valgtÅr, setValgtÅr] = useState<number | undefined>(undefined);
  const [initieltÅr, setInitieltÅr] = useState<number | undefined>(undefined);
  const [lagÅrsavregningFeil, setLagÅrsavregningFeil] = useState<string | undefined>(undefined);
  const [harTidligereTrygdeavgiftsgrunnlag, setHarTidligereTrygdeavgiftsgrunnlag] = useState<boolean | undefined>(
    undefined,
  );
  const [harInnbetaltTrygdeavgift, setHarInnbetaltTrygdeavgift] = useState<boolean | undefined>(undefined);
  const [harInnbetaltTrygdeavgiftIsPending, setHarInnbetaltTrygdeavgiftIsPending] = useState<boolean>(false);
  const [erNyVurdering, setErNyVurdering] = useState<boolean>(false);
  const [harAktivÅrsavregning, setHarAktivÅrsavregning] = useState<boolean>(false);
  const [harManglendeInnbetalingBehandling, setHarManglendeInnbetalingBehandling] = useState<boolean>(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as any;
  const { oppfriskOgLastInnSaksopplysningerForAarsavregning } = useContext(FellesHandlersContext) as any;
  const dispatch = useDispatch();
  const erÅrsavregningEøsPensjonistToggleEnabled = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST);

  /**
   * Utleder harInnbetaltTrygdeavgift når verdien er null (bakoverkompatibilitet).
   *
   * Eldre behandlinger kan ha null pga. bug der verdien ikke ble lagret.
   * Vi infererer verdien basert på om brukeren har fylt ut avhengige felter:
   * - Hvis innbetaltTrygdeavgift har verdi → brukeren valgte "Ja" → returnerer true
   * - Hvis andre felter (manueltAvgiftBeloep, nyttTrygdeavgiftsGrunnlag) er fylt ut → brukeren valgte "Nei" → returnerer false
   * - Ellers → ny årsavregning hvor brukeren ikke har svart ennå → returnerer undefined
   */
  const utledHarInnbetaltTrygdeavgiftNårNull = (res: AarsavregningResponse): boolean | undefined => {
    // Sjekk om brukeren har lagt til innbetalt trygdeavgift (valgte "Ja")
    const harInnbetaltTrygdeavgift =
      res.avregning?.innbetaltTrygdeavgift !== null && res.avregning?.innbetaltTrygdeavgift !== undefined;

    if (harInnbetaltTrygdeavgift) {
      return true;
    }

    // Sjekk om brukeren har fylt ut andre felter som krever at radioknappen er besvart (valgte "Nei")
    const harAnnenDataSomKreverSvar =
      res.avregning?.manueltAvgiftBeloep !== null || res.nyttTrygdeavgiftsGrunnlag !== null;

    if (harAnnenDataSomKreverSvar) {
      return false;
    }

    // Ingen data fylt ut - ny årsavregning hvor brukeren må svare
    return undefined;
  };

  const utledGrunnlagstypeForÅrsavregning = (res: AarsavregningResponse) => {
    if (res.harInnbetaltTrygdeavgift != null) {
      setHarInnbetaltTrygdeavgift(res.harInnbetaltTrygdeavgift);
    } else {
      // Bakoverkompatibilitet: utled verdi fra eksisterende data
      const utledetVerdi = utledHarInnbetaltTrygdeavgiftNårNull(res);
      setHarInnbetaltTrygdeavgift(utledetVerdi ?? false);
    }

    if (erÅrsavregningEøsPensjonistToggleEnabled) {
      const harGrunnlag = !(
        res.tidligereTrygdeavgiftsGrunnlagsopplysninger === null ||
        Utils._isEmpty(res.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.avgiftspliktigperioder)
      );

      setHarTidligereTrygdeavgiftsgrunnlag(harGrunnlag);

      if (!harGrunnlag) {
        // Når det ikke finnes grunnlag skal harInnbetaltTrygdeavgift alltid være true
        setHarInnbetaltTrygdeavgift(true);
        if (res.harInnbetaltTrygdeavgift !== true) {
          håndterHarInnbetaltTrygdeavgift(true);
        }
        return;
      }
    } else {
      setHarTidligereTrygdeavgiftsgrunnlag(
        !(
          res.tidligereTrygdeavgiftsGrunnlagsopplysninger === null ||
          Utils._isEmpty(res.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.avgiftspliktigperioder)
        ),
      );
    }
  };

  useEffect(() => {
    const hentÅrsavregning = async () => {
      const årsavregningList = await Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer);
      if (behandlingHarÅrsavregning(behandlingID, årsavregningList)) {
        const årsavregning = await Api.Aarsavregning.hentAarsavregning(behandlingID);
        setInitieltÅr(årsavregning.aar);
        setAarsavregningResponse(årsavregning);
        dispatch({ type: OK, data: årsavregning });
        if (årsavregningErNyVurdering(behandlingID, årsavregningList, årsavregning.aar)) {
          setErNyVurdering(true);
        }
        utledGrunnlagstypeForÅrsavregning(årsavregning);
      }

      setHarManglendeInnbetalingBehandling(await fagsakHarManglendeInnbetaling(saksnummer));
    };
    hentÅrsavregning();
  }, []);

  const håndterEndringAvÅr = (event: ChangeEvent<HTMLSelectElement>) => {
    setLagÅrsavregningFeil(undefined);
    setErNyVurdering(false);
    setHarAktivÅrsavregning(false);
    setHarTidligereTrygdeavgiftsgrunnlag(undefined);
    setHarInnbetaltTrygdeavgift(undefined);
    setAarsavregningResponse(undefined);

    const år = Number(event.target.value);
    setValgtÅr(år);

    Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, FASTSATT_TRYGDEAVGIFT, år).then(
      (fastsattÅrsavregningList) => {
        setErNyVurdering(fastsattÅrsavregningList.length > 0);
      },
    );

    Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, IKKE_FASTSATT, år).then((res) => {
      if (res.length === 0) {
        Api.Aarsavregning.lagAarsavregning(behandlingID, { aar: år })
          .then((årsavregning) => {
            setAarsavregningResponse(årsavregning);
            utledGrunnlagstypeForÅrsavregning(årsavregning);
            dispatch({ type: OK, data: årsavregning });
            oppfriskOgLastInnSaksopplysningerForAarsavregning().then(() => {
              dispatch(behandlingsresultatOperations.hent(behandlingID));
            });
          })
          .catch((error: any) => {
            setLagÅrsavregningFeil(error.body.message);
          });
      } else {
        setHarAktivÅrsavregning(true);
      }
    });
  };

  const håndterHarInnbetaltTrygdeavgift = async (value: boolean) => {
    setHarInnbetaltTrygdeavgiftIsPending(true);
    await Api.Aarsavregning.oppdaterHarInnbetaltTrygdeavgift(behandlingID, {
      harInnbetaltTrygdeavgift: value,
    })
      .then((res) => {
        setHarInnbetaltTrygdeavgift(res.harInnbetaltTrygdeavgift);
        setHarInnbetaltTrygdeavgiftIsPending(false);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Feil ved oppdatering av harInnbetaltTrygdeavgift:", error);
        setHarInnbetaltTrygdeavgiftIsPending(false);
      });
  };

  const forrigeÅrsavregningErManueltBeregnet = Boolean(
    aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !==
      null &&
      aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !==
        undefined,
  );
  const forrigeÅrsavregningHarInnbetaltTrygdeavgift = Boolean(
    aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereInnbetaltTrygdeavgift !== null &&
      aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereInnbetaltTrygdeavgift !== undefined,
  );

  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);

  const trygdeavgiftAvvikLabelHjelpetekst = erÅrsavregningEøsPensjonistToggleEnabled ? (
    <LabelMedHjelpetekst
      label="Avviker innbetalt trygdeavgift fra tidligere beregnet avgift?"
      hjelpetekst={harTidligereTrygdeavgiftsgrunnlag ? DELT_GRUNNLAG_INNBETALT_TRYGDEAVGIFT_HJELPETEKST : ""}
    />
  ) : (
    <LabelMedHjelpetekst
      label="Skal du legge til trygdeavgift fra Avgiftssystemet til denne årsavregningen?"
      hjelpetekst={harTidligereTrygdeavgiftsgrunnlag ? DELT_GRUNNLAG_HJELPETEKST : ""}
    />
  );

  return (
    <div className="vurderingAarsavregning">
      <Nav.Heading level="1" className="stegvelgertittel">
        Årsavregning
      </Nav.Heading>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Select
            className="aarVelger"
            label="År"
            id="aarVelger"
            value={valgtÅr || initieltÅr || ""}
            onChange={håndterEndringAvÅr}
            readOnly={!redigerbart}
          >
            <option value="" disabled>
              Velg...
            </option>
            {muligeAar.map((aar) => (
              <option key={aar} value={aar}>
                {aar}
              </option>
            ))}
          </Nav.Select>
        </Nav.Column>
      </Nav.Row>

      {redigerbart && harAktivÅrsavregning && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          <Nav.BodyLong size="small">Året {valgtÅr} har allerede en aktiv årsavregning.</Nav.BodyLong>
        </Nav.Alert>
      )}

      {redigerbart && !harAktivÅrsavregning && harManglendeInnbetalingBehandling && (
        <Nav.Alert variant="warning" className="alertstripe_feilmelding">
          <Nav.BodyLong size="small">
            Det finnes en åpen behandling om manglende innbetaling av trygdeavgift. Vurder om denne skal behandles først
            og om årsavregning skal foretas.
          </Nav.BodyLong>
        </Nav.Alert>
      )}

      {lagÅrsavregningFeil && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {lagÅrsavregningFeil}
        </Nav.Alert>
      )}

      {!lagÅrsavregningFeil && !harAktivÅrsavregning && (
        <>
          {redigerbart && erNyVurdering && (
            <Nav.Alert variant="warning" className="nyVurderingMelding">
              <Nav.Heading size="xsmall">Ny behandling for en tidligere årsavregning</Nav.Heading>
              <Nav.BodyLong size="small">
                Du har startet en ny årsavregningbehandling for et tidligere årsavregnet år
                {forrigeÅrsavregningErManueltBeregnet && (
                  <>
                    <br />
                    Trygdeavgiften ble manuelt beregnet og inntekts- og skatteopplysninger er derfor ikke oppgitt.
                  </>
                )}
              </Nav.BodyLong>
            </Nav.Alert>
          )}

          {aarsavregningResponse && harTidligereTrygdeavgiftsgrunnlag && (
            <TidligereGrunnlag aarsavregningResponse={aarsavregningResponse} />
          )}

          {aarsavregningResponse && harTidligereTrygdeavgiftsgrunnlag === false && (
            <Nav.Alert variant="info" className="alertstripe_feilmelding">
              <Nav.BodyLong size="small">
                Det er ingen informasjon om forskuddsvis fakturert trygdeavgift i Melosys.
              </Nav.BodyLong>
            </Nav.Alert>
          )}

          {(valgtÅr || initieltÅr) &&
            (!erÅrsavregningEøsPensjonistToggleEnabled || harTidligereTrygdeavgiftsgrunnlag) && (
              <Nav.Box
                className={`innbetaltTrygdeavgiftPanel${
                  harInnbetaltTrygdeavgift ? " innbetaltTrygdeavgiftPanel_medInput" : ""
                }`}
                background="surface-subtle"
              >
                <Nav.VStack align="start">
                  <Nav.Heading level="2" className="aarsavregning_seksjon_heading">
                    Innbetalt trygdeavgift
                  </Nav.Heading>
                  <Nav.RadioGroup
                    key={`innbetaltTrygdeavgiftRadioGroup ${valgtÅr || initieltÅr || ""}`}
                    className="innbetaltTrygdeavgiftRadioGroup"
                    onChange={håndterHarInnbetaltTrygdeavgift}
                    legend={trygdeavgiftAvvikLabelHjelpetekst}
                    value={harInnbetaltTrygdeavgift}
                    readOnly={!redigerbart || harAktivÅrsavregning || forrigeÅrsavregningHarInnbetaltTrygdeavgift}
                  >
                    <Nav.HStack gap="6">
                      <Nav.Radio value>Ja</Nav.Radio>
                      <Nav.Radio value={false}>Nei</Nav.Radio>
                    </Nav.HStack>
                  </Nav.RadioGroup>
                </Nav.VStack>
              </Nav.Box>
            )}

          {!harInnbetaltTrygdeavgiftIsPending &&
            harTidligereTrygdeavgiftsgrunnlag === true &&
            harInnbetaltTrygdeavgift === false && (
              <AarsavregningMedGrunnlag bekreft={bekreft} aktivtSteg={aktivtSteg} oppdaterStatus={oppdaterStatus} />
            )}
          {!harInnbetaltTrygdeavgiftIsPending &&
            (harTidligereTrygdeavgiftsgrunnlag === false || harInnbetaltTrygdeavgift) &&
            harInnbetaltTrygdeavgift != null && (
              <AarsavregningUtenEllerDeltGrunnlag
                bekreft={bekreft}
                aktivtSteg={aktivtSteg}
                oppdaterStatus={oppdaterStatus}
                harInnbetaltTrygdeavgift={Boolean(harInnbetaltTrygdeavgift)}
                harTidligereTrygdeavgiftsgrunnlag={Boolean(harTidligereTrygdeavgiftsgrunnlag)}
              />
            )}
        </>
      )}
    </div>
  );
}
