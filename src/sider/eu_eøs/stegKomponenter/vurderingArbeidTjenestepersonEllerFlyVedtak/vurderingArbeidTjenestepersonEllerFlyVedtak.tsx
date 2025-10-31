import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @ts-expect-error - Missing type definitions
import * as EKV from "eessi-kodeverk";

import MKV, { MKVUtils } from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as Forms from "../../../../felleskomponenter/forms";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";

import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { vedtakOperations } from "../../../../ducks/vedtak";

import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import type { BrevDokumentMetadataType, SedDokumentMetadataType } from "../../../../felleskomponenter/dokumentliste";
import Mottakerinstitusjonvelger, {
  MottakerinstitusjonvelgerFlervalg,
} from "../../../../felleskomponenter/mottakerinstitusjonvelger";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  slettAvklartfakta,
} from "../../../../felleskomponenter/stegvelger";
import { BOOLSK_STRING } from "../../../../constants";

import VurderingArbeidTjenestepersonEllerFlyVedtakSchema from "./vurderingArbeidTjenestepersonEllerFlyVedtakSchema";
import "./vurderingArbeidTjenestepersonEllerFlyVedtak.less";
import { Control } from "react-hook-form";

interface Mottakerinstitusjon {
  id: string;
  kreverMottakerinstitusjon: boolean;
  [key: string]: unknown;
}

interface Avklartefakta {
  subjektID?: string;
  [key: string]: unknown;
}

interface SelvstendigArbeid {
  erSelvstendig?: boolean;
  [key: string]: unknown;
}

interface FormValues {
  vedtakstypebegrunnelse?: string;
  vedtakstype?: string;
  vedtaksbrevFritekst?: string;
  mottakerinstitusjoner?: Mottakerinstitusjon[];
  fritekstSed?: string;
  kopiTilArbeidsgiver?: boolean;
  informerUtenlandskTrygdemyndighet?: boolean;
  mottakerLand?: string;
  mottakerinstitusjon?: string;
  kreverMottakerinstitusjon?: boolean;
}

interface InformertMyndighetVelgerProps {
  redigerbart: boolean;
  oppdaterData: (data: unknown) => void;
  slettData: (data: unknown) => void;
  informertMyndighetFakta: Avklartefakta;
  control: Control<FormValues>;
}

function InformertMyndighetVelger({
  redigerbart,
  oppdaterData,
  slettData,
  informertMyndighetFakta,
  control,
}: InformertMyndighetVelgerProps) {
  useEffect(() => {
    oppdaterData(
      konverterAvklartfaktaTilStegData(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET, informertMyndighetFakta),
    );

    return () => {
      slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET));
    };
  }, []);

  const oppdaterInformertMyndighetFakta = (land: string) => {
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET, land, BOOLSK_STRING.SANN));
  };

  return (
    <Forms.Select
      label="Hvilket land skal informeres?"
      name="mottakerLand"
      control={control}
      readOnly={!redigerbart}
      onChange={(e) => oppdaterInformertMyndighetFakta(e.target.value)}
    >
      <option value="">Velg land...</option>
      {/* TODO: Land-options må legges til her */}
    </Forms.Select>
  );
}

interface KontrollerRequest {
  behandlingID: number;
  vedtakstype: string;
  behandlingsresultattype: string;
  kontrollerSomSkalIgnoreres: string[];
  skalRegisteropplysningerOppdateres: boolean;
}

interface Props {
  redigerbart: boolean;
  behandlingID: number;
  lagreLovvalgsperioder: () => void;
  behandlingstype: string;
  behandlingstema: string;
  sakstype: string;
  lovvalgsbestemmelseSomSkalVises?: string;
  oppdaterData: (data: unknown) => void;
  slettData: (data?: unknown) => void;
  tilbake: () => void;
  mottatteOpplysningerStatus: string;
  informertMyndighetFakta?: Avklartefakta;
  kontrollerFerdigbehandling: (request: KontrollerRequest) => Promise<void>;
  harFeilmeldinger: boolean;
  aktivtSteg: boolean;
  validerMottatteOpplysninger: () => Promise<void>;
}

const art11_5_ErValgt = (formValues: FormValues) =>
  formValues.vedtakstype === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5;

const art11_3B_ErValgt = (formValues: FormValues) =>
  formValues.vedtakstype === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;

const skalSendeSed = (formValues: FormValues) => {
  const { kreverMottakerinstitusjon } = formValues;

  if (art11_5_ErValgt(formValues)) {
    return kreverMottakerinstitusjon;
  }
  return art11_3B_ErValgt(formValues);
};

const skalSendeOrienteringsbrev = (selvstendigArbeid: SelvstendigArbeid | null) =>
  selvstendigArbeid?.erSelvstendig !== true;

const skalViseSendOrienteringsbrev = (sakstype: string, behandlingstema: string) =>
  sakstype === MKV.Koder.sakstyper.EU_EOS &&
  [
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
  ].includes(behandlingstema);

export function VurderingArbeidTjenestepersonEllerFlyVedtak({
  redigerbart,
  behandlingID,
  lagreLovvalgsperioder,
  behandlingstype,
  behandlingstema,
  sakstype,
  lovvalgsbestemmelseSomSkalVises = "",
  oppdaterData,
  slettData,
  tilbake,
  mottatteOpplysningerStatus,
  informertMyndighetFakta = {},
  kontrollerFerdigbehandling,
  harFeilmeldinger,
  aktivtSteg,
  validerMottatteOpplysninger,
}: Props) {
  const dispatch = useDispatch();
  const [vedtakPending, setVedtakPending] = useState(false);
  let oppdaterFørKontroll = true;

  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const begrunnelseKoder = useSelector(behandlingsresultatSelectors.BegrunnelseKoderSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const begrunnelseFritekst = useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector);
  const ikkeMarginaleArbeidsland = useSelector(avklartefaktaSelectors.IkkeMarginaleArbeidslandKTSelector);
  const selvstendigArbeid = useSelector(mottatteOpplysningerSelectors.SelvstendigArbeidSelector);

  const harFlereSoknadslandEnnTillatt = arbeidsland.length > 1 && !MKVUtils.kanHaFlereSoknadsland(behandlingstema);

  const informerUtenlandskTrygdemyndighet = !Utils._isEmpty(informertMyndighetFakta);
  const mottakerLand = informertMyndighetFakta.subjektID;

  // Note: yupResolver type doesn't match React Hook Form's Resolver<FormValues> type perfectly,
  // so we use 'as any' here. This is a known limitation with @hookform/resolvers v3.x.
  // The runtime validation still works correctly.
  const { control, watch, formState, handleSubmit } = useForm<FormValues>({
    resolver: yupResolver(VurderingArbeidTjenestepersonEllerFlyVedtakSchema) as any,
    mode: "onChange",
    context: {
      soknadsperiode,
      behandlingstype,
    },
    defaultValues: {
      vedtakstypebegrunnelse: begrunnelseKoder?.[0],
      vedtakstype,
      vedtaksbrevFritekst: begrunnelseFritekst || "",
      mottakerinstitusjoner: ikkeMarginaleArbeidsland || [],
      fritekstSed: "",
      kopiTilArbeidsgiver: true,
      informerUtenlandskTrygdemyndighet,
      mottakerLand,
    },
  });

  const formValues = watch();

  useEffect(() => {
    return () => {
      slettData();
    };
  }, []);

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const vedKlikkForhandsvis = async () => {
    if (!formState.isValid) {
      return false;
    }

    lagreLovvalgsperioder();
    return formState.isValid;
  };

  let pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[] = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  if (skalSendeSed(formValues)) {
    pdfDokumenter = [
      ...pdfDokumenter,
      {
        sedType: EKV.Koder.sedtyper.A010,
        sedData: {
          fritekst: formValues.fritekstSed,
        },
      },
    ];
  }
  const { kopiTilArbeidsgiver } = formValues;
  if (skalSendeOrienteringsbrev(selvstendigArbeid) && kopiTilArbeidsgiver) {
    pdfDokumenter.push({
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
        erInnvilgelse: true,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  const lovvalgsbestemmelseTerm = KV.kodeTilTerm(lovvalgsbestemmelseSomSkalVises, MKV.Kodekombinasjoner.alleLovvalg);
  const overskrift = `Omfattet av norsk lovgivning etter ${lovvalgsbestemmelseTerm || "..."}`;

  const visSendSEDValg = art11_5_ErValgt(formValues);
  const visMottakerinstitusjonvelgerFlervalg = art11_3B_ErValgt(formValues);

  const lagFattVedtakEOSReqDto = () => {
    let mottakerinstitusjoner = null;
    if (art11_5_ErValgt(formValues)) {
      mottakerinstitusjoner = formValues.mottakerLand ? [formValues.mottakerinstitusjon] : [];
    } else if (art11_3B_ErValgt(formValues)) {
      mottakerinstitusjoner = formValues.mottakerinstitusjoner
        ?.filter((inst) => inst.kreverMottakerinstitusjon)
        .map((inst) => inst.id);
    }

    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: formValues.vedtaksbrevFritekst,
      fritekstSed: formValues.fritekstSed,
      kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver,
      mottakerinstitusjoner,
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
    };
  };

  async function kontroller(data: { mottatteOpplysningerStatus: string; aktivtSteg: boolean; formValues: FormValues }) {
    if (redigerbart && data.mottatteOpplysningerStatus === "OK" && data.aktivtSteg) {
      setVedtakPending(true);
      const request: KontrollerRequest = {
        behandlingID,
        vedtakstype: data.formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
        kontrollerSomSkalIgnoreres: data.formValues.kopiTilArbeidsgiver
          ? []
          : [MKV.Koder.begrunnelser.kontroll_begrunnelser.OPPHØRT_ARBEIDSGIVER],
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await kontrollerFerdigbehandling(request);
      setVedtakPending(false);
    }
  }

  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 500), [kontrollerFerdigbehandling]);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, mottatteOpplysningerStatus, formValues });
  }, [aktivtSteg, formState.isValid, formValues.kopiTilArbeidsgiver, mottatteOpplysningerStatus]);

  const onSubmit = async () => {
    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        dispatch(vedtakOperations.fatt(behandlingID, lagFattVedtakEOSReqDto()) as any).then((res: unknown) => {
          const response = res as { data?: { data?: { error?: unknown } } };
          if (response.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };

  const stegErGyldig = redigerbart && formState.isValid && !harFeilmeldinger && !harFlereSoknadslandEnnTillatt;

  if (!aktivtSteg) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vurderingArbeidTjenestepersonEllerFlyVedtak">
      <Nav.Heading level="1" className="stegvelgertittel">
        {overskrift}
      </Nav.Heading>
      {erNyVurdering && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Forms.Select label="Vedtakstype" name="vedtakstype" control={control} readOnly={!redigerbart}>
              <option value="">Velg vedtakstype...</option>
              {/* TODO: Vedtakstype options må legges til her */}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row className="fritekst">
        <Nav.Column xs="8">
          <Forms.Textarea
            name="vedtaksbrevFritekst"
            control={control}
            label="Fritekst til begrunnelse"
            readOnly={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      {visSendSEDValg && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Forms.RadioGroup
              legend="Skal utenlandsk trygdemyndighet informeres?"
              name="informerUtenlandskTrygdemyndighet"
              control={control}
              readOnly={!redigerbart}
            >
              <Nav.Radio value="true">Ja</Nav.Radio>
              <Nav.Radio value="false">Nei</Nav.Radio>
            </Forms.RadioGroup>
          </Nav.Column>
        </Nav.Row>
      )}
      {visSendSEDValg && formValues.informerUtenlandskTrygdemyndighet && (
        <Nav.Row>
          <Nav.Column xs="6">
            <InformertMyndighetVelger
              redigerbart={redigerbart}
              oppdaterData={oppdaterData}
              slettData={slettData}
              informertMyndighetFakta={informertMyndighetFakta}
              control={control}
            />
            {formValues.mottakerLand && (
              <Mottakerinstitusjonvelger
                form={KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK}
                redigerbart={redigerbart}
                landkode={formValues.mottakerLand}
                bucType={EKV.Koder.buctyper.legislation.LA_BUC_05}
              />
            )}
          </Nav.Column>
        </Nav.Row>
      )}
      {visMottakerinstitusjonvelgerFlervalg && (
        <Nav.Row>
          <Nav.Column xs="8">
            <MottakerinstitusjonvelgerFlervalg
              feltnavn="mottakerinstitusjoner"
              bucType={EKV.Koder.buctyper.legislation.LA_BUC_05}
              redigerbart={redigerbart}
              form={KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      {redigerbart && skalSendeSed(formValues) && (
        <Nav.Row className="fritekstSed">
          <Nav.Column xs="8">
            <Forms.Textarea
              label="Ytterligere informasjon til SED (valgfri)"
              name="fritekstSed"
              control={control}
              readOnly={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      {redigerbart && skalViseSendOrienteringsbrev(sakstype, behandlingstema) && (
        <Forms.Checkbox
          name="kopiTilArbeidsgiver"
          control={control}
          label="Send orienteringsbrev til arbeidsgiver/virksomhet"
        />
      )}
      <Nav.Row>
        <Nav.Column xs="8">
          {stegErGyldig && (
            <Dokumentliste
              behandlingID={behandlingID}
              dokumenter={pdfDokumenter}
              validateOnClick={vedKlikkForhandsvis}
            />
          )}
        </Nav.Column>
      </Nav.Row>

      {harFlereSoknadslandEnnTillatt && (
        <Nav.Alert variant="error">Det er kun tillatt med ett arbeidsland i vedtaket.</Nav.Alert>
      )}

      {erNyVurdering && redigerbart && (
        <Nav.Alert variant="info">{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.Alert>
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          loading: vedtakPending,
          disabled: !stegErGyldig,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            tilbake();
          },
          disabled: !redigerbart,
        }}
      />
    </form>
  );
}

export default VurderingArbeidTjenestepersonEllerFlyVedtak;
