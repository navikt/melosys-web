import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

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
import {
  BEGRUNNELSE_FRITEKST_HJELPETEKST,
  INNLEDNING_FRITEKST_HJELPETEKST,
  NY_VURDERING_BAKGRUNN_HJELPETEKST,
} from "./tekster";
import { BrevMottakereTabell } from "./mottakertabell/brevMottakereTabell";
import { Lovvalgsperiode } from "./lovvalgsperiode";
import vurderingVedtakSchema from "./vurderingVedtakSchema";
import "./vurderingVedtak.less";

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

interface FormValuesProps {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
}

function FritekstTeller({ verdi, maksLengde }: { verdi?: string; maksLengde: number }) {
  const lengde = verdi?.length ?? 0;
  const differanse = maksLengde - lengde;
  const erOver = differanse < 0;

  return (
    <Nav.BodyLong size="small" className={`fritekst_teller${erOver ? " fritekst_teller--error" : ""}`}>
      {erOver ? `${Math.abs(differanse)} tegn for mye` : `${differanse} tegn igjen`}
    </Nav.BodyLong>
  );
}

export function VurderingVedtak({ aktivtSteg, tilbake }: Props) {
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
      }),
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
    return () => debouncedOppdaterFritekster.cancel();
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
      }),
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
      {sakstype === MKV.Koder.sakstyper.EU_EOS && (
        <Nav.Heading level="1" className="stegvelgertittel">
          Omfattet av norsk trygdelovgivning - trygdeforordning 883/2004
        </Nav.Heading>
      )}
      {sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE && (
        <Nav.Heading level="1" className="stegvelgertittel">
          Omfattet av norsk trygdelovgivning - trygdeavtale
        </Nav.Heading>
      )}

      <Nav.Row>
        <Lovvalgsperiode
          kontrollerFerdigbehandling={kontrollerFerdigbehandling}
          onRedigeringErAktiv={setLovvalgsperiodeErValid}
        />
      </Nav.Row>

      {erNyVurdering && redigerbart && (
        <Nav.Alert variant="info" className="nyvurdering_info">
          {KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}
        </Nav.Alert>
      )}

      {erNyVurdering && (
        <Nav.Row className="nyVurderingBakgrunn">
          <Nav.Column xs="6">
            <Forms.Select
              label={
                <LabelMedHjelpetekst
                  label="Oppgi grunn for nytt vedtak (Obligatorisk)"
                  hjelpetekst={NY_VURDERING_BAKGRUNN_HJELPETEKST}
                />
              }
              name="nyVurderingBakgrunnValg"
              readOnly={!redigerbart}
              emptyFieldDisabled={!!formValues?.nyVurderingBakgrunnValg}
              control={control}
              onChange={oppdaterNyVurderingBakgrunnValg}
            >
              {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.map((bakgrunn: KTObject) => (
                <option key={bakgrunn.kode} value={bakgrunn.kode} label={bakgrunn.term || ""} />
              ))}
              <option key={FRITEKST_VALG} value={FRITEKST_VALG} label={FRITEKST_VALG} />
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      )}

      {erNyVurdering && formValues.nyVurderingBakgrunnValg === FRITEKST_VALG && (
        <Nav.Row className="nyVurderingBakgrunnFritekstRad">
          <Forms.HtmlEditor
            name="nyVurderingBakgrunnFritekst"
            control={control}
            onChange={debouncedOppdaterNyVurderingBakgrunn}
            className="fritekst_editor"
            disabled={!redigerbart}
          />
        </Nav.Row>
      )}

      <Nav.Row>
        <Nav.BodyLong as="div" weight="semibold" size="small" className="fritekst_overskrift">
          <LabelMedHjelpetekst label="Fritekst til innledning" hjelpetekst={INNLEDNING_FRITEKST_HJELPETEKST} />
        </Nav.BodyLong>
        <Forms.HtmlEditor
          name="innledningFritekst"
          control={control}
          className="fritekst_editor"
          disabled={!redigerbart}
        />
        <FritekstTeller verdi={formValues.innledningFritekst} maksLengde={4000} />
      </Nav.Row>

      <Nav.Row>
        <Nav.BodyLong as="div" weight="semibold" size="small" className="fritekst_overskrift">
          <LabelMedHjelpetekst label="Fritekst til begrunnelse" hjelpetekst={BEGRUNNELSE_FRITEKST_HJELPETEKST} />
        </Nav.BodyLong>
        <Forms.HtmlEditor
          name="begrunnelseFritekst"
          control={control}
          className="fritekst_editor"
          disabled={!redigerbart}
        />
        <FritekstTeller verdi={formValues.begrunnelseFritekst} maksLengde={4000} />
      </Nav.Row>

      {stegErGyldig && (
        <Nav.Row>
          <BrevMottakereTabell
            innledningFritekst={formValues.innledningFritekst}
            begrunnelseFritekst={formValues.begrunnelseFritekst}
          />
        </Nav.Row>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !stegErGyldig || !formIsValid,
          loading: kontrollEllerVedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}
