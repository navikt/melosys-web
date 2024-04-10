import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";

import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";

import * as Mui from "../../../../felleskomponenter/ui";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { kontrollOperations, kontrollSelectors } from "../../../../ducks/kontroll";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";

import { vedtakOperations } from "../../../../ducks/vedtak";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { FRITEKST_VALG } from "../../../../kodeverk/koder";
import vurderingVedtakSchema from "./vurderingVedtakSchema";
import "./vurderingVedtak.css";

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

interface FormValuesProps {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
}

export const VurderingVedtak = ({ aktivtSteg, tilbake }: Props) => {
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);

  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollFeilSelector);
  const lagretBegrunnelseFritekst = useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector);
  const lagretInnledningFritekst = useSelector(behandlingsresultatSelectors.InnledningFritekstSelector);
  const lagretNyVurderingBakgrunn = useSelector(behandlingsresultatSelectors.NyVurderingBakgrunnSelector);
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const erNyVurderingBakgrunnValgFritekst = (nyVurderingBakgrunnValg?: string): boolean => {
    return !MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.some((bakgrunn: KTObject) => {
      return bakgrunn.kode === nyVurderingBakgrunnValg;
    });
  };

  const initialNyVurderingBakgrunnValg =
    lagretNyVurderingBakgrunn && erNyVurderingBakgrunnValgFritekst(lagretNyVurderingBakgrunn)
      ? FRITEKST_VALG
      : lagretNyVurderingBakgrunn || undefined;
  const initialNyVurderingBakgrunnFritekst =
    initialNyVurderingBakgrunnValg === FRITEKST_VALG ? lagretNyVurderingBakgrunn : "";

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
    setValue,
  } = useForm({
    resolver: yupResolver(vurderingVedtakSchema),
    mode: "all",
    context: {
      erNyVurdering,
    },
    defaultValues: {
      nyVurderingBakgrunnValg: initialNyVurderingBakgrunnValg,
      begrunnelseFritekst: lagretBegrunnelseFritekst || "",
      innledningFritekst: lagretInnledningFritekst || "",
      nyVurderingBakgrunnFritekst: initialNyVurderingBakgrunnFritekst,
    } as FieldValues,
  });
  const formValues = watch();

  const [lovvalgsperiodeErValid, setLovvalgsperiodeErValid] = useState(true);
  const [kontrollEllerVedtakPending, setKontrollEllerVedtakPending] = useState(false);
  const harIngenFeilmeldinger = Utils._isEmpty(feilmeldinger) && Utils._isEmpty(kontrollfeil);
  const stegErGyldig: boolean = redigerbart && formIsValid && lovvalgsperiodeErValid && harIngenFeilmeldinger;

  const kontrollerFerdigbehandling = async () => {
    setKontrollEllerVedtakPending(true);
    await dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        skalRegisteropplysningerOppdateres: false,
      })
    );
    setKontrollEllerVedtakPending(false);
  };

  useEffect(() => {
    if (aktivtSteg) {
      kontrollerFerdigbehandling();
    }
  }, [aktivtSteg]);

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !kontrollEllerVedtakPending) {
      Api.Behandlinger.resultat.oppdaterFritekster(behandlingID, {
        innledningFritekst: values.innledningFritekst,
        begrunnelseFritekst: values.begrunnelseFritekst,
      });
    }
  };

  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), []);

  useEffect(() => {
    if (
      formValues.innledningFritekst !== lagretInnledningFritekst ||
      formValues.begrunnelseFritekst !== lagretBegrunnelseFritekst
    ) {
      debouncedOppdaterFritekster(formValues);
    }
  }, [formValues?.innledningFritekst, formValues?.begrunnelseFritekst]);

  const oppdaterNyVurderingBakgrunn = (nyVurderingBakgrunn?: string) => {
    Api.Behandlinger.resultat.oppdaterNyVurderingBakgrunn(behandlingID, nyVurderingBakgrunn);
  };

  const debouncedOppdaterNyVurderingBakgrunn = useCallback(Utils._debounce(oppdaterNyVurderingBakgrunn, 500), []);

  const oppdaterNyVurderingBakgrunnValg = (nyVurderingBakgrunnValg: string) => {
    if (!erNyVurdering) {
      return;
    }
    if (nyVurderingBakgrunnValg === FRITEKST_VALG) {
      debouncedOppdaterNyVurderingBakgrunn(undefined);
    } else {
      debouncedOppdaterNyVurderingBakgrunn(nyVurderingBakgrunnValg);
    }
    setValue("nyVurderingBakgrunnFritekst", "");
  };
  const fattVedtak = async () =>
    dispatch(
      vedtakOperations.fatt(behandlingID, {
        behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      })
    );

  const handleBekreft = async () => {
    setKontrollEllerVedtakPending(true);
    fattVedtak().then(() => {
      if (!Utils._isEmpty(feilmeldinger) || !Utils._isEmpty(kontrollfeil)) {
        setKontrollEllerVedtakPending(false);
      }
    });
  };

  return (
    <div className="vurderingVedtakIkkeYrkesaktiv">
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !stegErGyldig || !formIsValid,
          autoDisableVedSpinner: true,
          spinner: kontrollEllerVedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
