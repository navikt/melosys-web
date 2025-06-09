import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../hooks/redux";
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
import "./vurderingAarsavregningInngang.css";

import { FellesHandlersContext } from "../../../../contexts";
import { behandlingsresultatOperations } from "../../../../ducks/behandlingsresultat";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { AarsavregningMedGrunnlag } from "./aarsavregningMedGrunnlag/aarsavregningMedGrunnlag";
import { AarsavregningUtenEllerDeltGrunnlag } from "./aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";
import { TidligereGrunnlagAccordion } from "./komponenter/tidligereGrunnlag";

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
  const [harGrunnlag, setHarGrunnlag] = useState<boolean | undefined>(undefined);
  const [harDeltGrunnlag, setHarDeltGrunnlag] = useState<boolean | undefined>(undefined);
  const [visDeltGrunnlagRadioGroup, setVisDeltGrunnlagRadioGroup] = useState(false);
  const [erNyVurdering, setErNyVurdering] = useState<boolean>(false);
  const [harAktivÅrsavregning, setHarAktivÅrsavregning] = useState<boolean>(false);
  const [harManglendeInnbetalingBehandling, setHarManglendeInnbetalingBehandling] = useState<boolean>(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as any;
  const { oppfriskOgLastInnSaksopplysningerForAarsavregning } = useContext(FellesHandlersContext) as any;
  const dispatch = useAppDispatch();

  const utledGrunnlagstypeForÅrsavregning = (res: AarsavregningResponse) => {
    if (res.tidligereGrunnlagsopplysninger === null) {
      setHarGrunnlag(false);
    } else {
      setHarGrunnlag(true);
      if (res.aar === 2023 || res.aar === 2024) {
        setVisDeltGrunnlagRadioGroup(true);
        setHarDeltGrunnlag(res.harDeltGrunnlag);
      } else {
        setVisDeltGrunnlagRadioGroup(false);
        setHarDeltGrunnlag(false);
      }
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
    setVisDeltGrunnlagRadioGroup(false);
    setHarGrunnlag(undefined);
    setHarDeltGrunnlag(undefined);
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

  const håndterDeltGrunnlag = async (value: boolean) => {
    Api.Aarsavregning.oppdaterHarDeltGrunnlag(behandlingID, { harDeltGrunnlag: value }).then((res) =>
      setHarDeltGrunnlag(res.harDeltGrunnlag),
    );
  };

  const forrigeÅrsavregningErManueltBeregnet = Boolean(
    aarsavregningResponse?.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== null &&
      aarsavregningResponse?.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep !== undefined,
  );
  const forrigeÅrsavregningHarInnbetaltFraAvgiftssystem = Boolean(
    aarsavregningResponse?.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningFakturertBeloepAvgiftssystem !== null &&
      aarsavregningResponse?.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningFakturertBeloepAvgiftssystem !==
        undefined,
  );

  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);

  return (
    <div className="vurderingAarsavregning">
      <Nav.Heading level="1" className="stegvelgertittel">
        Årsavregning
      </Nav.Heading>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Select
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

          {/* Tidligere grunnlag accordion - vises når år/aarsavregningResponse er satt  */}
          {aarsavregningResponse && <TidligereGrunnlagAccordion aarsavregningResponse={aarsavregningResponse} />}

          {visDeltGrunnlagRadioGroup && (
            <Nav.Row>
              <Nav.Column xs="12">
                <Nav.RadioGroup
                  onChange={håndterDeltGrunnlag}
                  legend={
                    <LabelMedHjelpetekst
                      label="Skal du legge til trygdeavgift fra Avgiftssystemet til denne årsavregningen?"
                      hjelpetekst={DELT_GRUNNLAG_HJELPETEKST}
                    />
                  }
                  value={harDeltGrunnlag}
                  readOnly={!redigerbart || harAktivÅrsavregning || forrigeÅrsavregningHarInnbetaltFraAvgiftssystem}
                >
                  <Nav.HStack gap="6">
                    <Nav.Radio value>Ja</Nav.Radio>
                    <Nav.Radio value={false}>Nei</Nav.Radio>
                  </Nav.HStack>
                </Nav.RadioGroup>
              </Nav.Column>
            </Nav.Row>
          )}

          {harGrunnlag === true && harDeltGrunnlag === false && (
            <AarsavregningMedGrunnlag bekreft={bekreft} aktivtSteg={aktivtSteg} oppdaterStatus={oppdaterStatus} />
          )}
          {(harGrunnlag === false || harDeltGrunnlag) && (
            <AarsavregningUtenEllerDeltGrunnlag
              bekreft={bekreft}
              aktivtSteg={aktivtSteg}
              oppdaterStatus={oppdaterStatus}
              harDeltGrunnlag={Boolean(harDeltGrunnlag)}
            />
          )}
        </>
      )}
    </div>
  );
}
