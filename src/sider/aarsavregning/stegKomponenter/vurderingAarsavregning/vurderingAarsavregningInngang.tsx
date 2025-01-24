import * as Api from "../../../../services/api";
import "./vurderingAarsavregningInngang.css";
import { ChangeEvent, useEffect, useState } from "react";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import * as Nav from "../../../../navFrontend";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import * as Utils from "../../../../utils";
import MKV from "../../../../melosyskodeverk";
import { OK } from "../../../../ducks/aarsavregning/types";
import { sorterEtterISOFomDato } from "../../../../utils/dato";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { NyBehandlingForTidligereAarsavregningMelding } from "../../../../felleskomponenter/alertmeldinger/alertmeldinger";

import { behandlingsresultatOperations } from "../../../../ducks/behandlingsresultat";
import { Medlemskapsperiode } from "../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { AarsavregningMedGrunnlag } from "./aarsavregningMedGrunnlag/aarsavregningMedGrunnlag";
import { AarsavregningUtenGrunnlag } from "./aarsavregningUtenGrunnlag/aarsavregningUtenGrunnlag";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

const lagInnvilgetMedlemskapsPeriode = (medlemskapsperioder?: Medlemskapsperiode[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorterteInnvilgedePerioder = [...medlemskapsperioder]
      .filter((periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET)
      .sort(sorterEtterISOFomDato);
    return {
      fom: sorterteInnvilgedePerioder[0].fomDato,
      tom: sorterteInnvilgedePerioder[sorterteInnvilgedePerioder.length - 1].tomDato,
    };
  }
  return {
    tom: undefined,
    fom: undefined,
  };
};

const { FERDIGBEHANDLET, IKKE_FASTSATT, FASTSATT_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingsresultattyper;

export function VurderingAarsavregningInngang({ bekreft, oppdaterStatus, aktivtSteg }: Props) {
  const [valgtÅr, setValgtÅr] = useState<number | null>(null);
  const [initieltÅr, setInitieltÅr] = useState<number | null>(null);
  const [harGrunnlag, setHarGrunnlag] = useState<boolean | undefined>(undefined);

  const [nyVurderingÅrsavregning, setNyVurderingÅrsavregning] = useState<boolean>(false);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as any;
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  const dispatch = useDispatch();

  const utledGrunnlagstypeForAarsavregning = (res: AarsavregningResponse) => {
    const innvilgetPeriode = lagInnvilgetMedlemskapsPeriode(
      res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder,
    );

    if (res?.tidligereGrunnlagsopplysninger === null && Utils._isEmpty(innvilgetPeriode.fom)) {
      setHarGrunnlag(false);
    } else {
      setHarGrunnlag(true);
    }
  };

  useEffect(() => {
    Api.Aarsavregning.hentAarsavregning(behandlingID).then((aarsavregning) => {
      setInitieltÅr(aarsavregning.aar);
      dispatch({ type: OK, data: aarsavregning });
      utledGrunnlagstypeForAarsavregning(aarsavregning);
    });
  }, []);

  useEffect(() => {
    if (redigerbart && valgtÅr) {
      setHarGrunnlag(undefined);
      Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, FERDIGBEHANDLET, valgtÅr).then((res) => {
        setNyVurderingÅrsavregning(res.length > 0);
      });

      Api.Aarsavregning.lagAarsavregning(behandlingID, { aar: valgtÅr }).then((res) => {
        utledGrunnlagstypeForAarsavregning(res);
        // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
        dispatch({ type: OK, data: res });
        dispatch(behandlingsresultatOperations.hent(behandlingID));
      });
    }
  }, [valgtÅr]);

  const håndterEndringAvÅr = (event: ChangeEvent<HTMLSelectElement>) => {
    const år = event.target.value ? parseInt(event.target.value, 10) : undefined;
    setValgtÅr(år || null);
  };

  return (
    <div className="vurderingAarsavregning">
      <Nav.Heading level="1" className="stegvelgertittel">
        Årsavregning
      </Nav.Heading>
      <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst bold label="År" placement="left-start" />}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Nav.Select
              label=""
              id="aarVelger"
              value={(valgtÅr || initieltÅr)?.toString() ?? ""}
              onChange={håndterEndringAvÅr}
              readOnly={!redigerbart}
            >
              <option value="" disabled>
                Velg...
              </option>
              {muligeAar.map((aar) => (
                <option key={aar} value={aar.toString()}>
                  {aar}
                </option>
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      {nyVurderingÅrsavregning && (
        <Nav.Row>
          <NyBehandlingForTidligereAarsavregningMelding />
        </Nav.Row>
      )}
      {harGrunnlag === true && (
        <AarsavregningMedGrunnlag bekreft={bekreft} aktivtSteg={aktivtSteg} oppdaterStatus={oppdaterStatus} />
      )}
      {harGrunnlag === false && (
        <AarsavregningUtenGrunnlag bekreft={bekreft} aktivtSteg={aktivtSteg} oppdaterStatus={oppdaterStatus} />
      )}
    </div>
  );
}
