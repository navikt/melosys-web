import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import Dokumentliste, {
  BrevDokumentMetadataType,
  SedDokumentMetadataType,
} from "../../../../felleskomponenter/dokumentliste";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import * as Utils from "../../../../utils";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { yupResolver } from "@hookform/resolvers/yup";
import vurderingVedtak_11_3_og_13_3aSchema from "./vurderingVedtak11_3_og_13_3aSchema";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { Datovelger } from "../../../../felleskomponenter/forms";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { NY_VURDERING_BAKGRUNN_HJELPETEKST } from "../../../ikkeYrkesaktiv/stegKomponenter/vurderingVedtak/tekster";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as Forms from "../../../../felleskomponenter/forms";

interface VurderingVedtakProps {
  tilbake: () => void;
  redigerbart: boolean;
  pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[];
  harFeilmeldinger: boolean;
  validerMottatteOpplysninger: () => Promise<void>;
}

export function VurderingVedtak11_3_og_13_3a({
  redigerbart,
  tilbake,
  pdfDokumenter,
  harFeilmeldinger,
  validerMottatteOpplysninger,
}: VurderingVedtakProps) {
  const endretLovvalgsperiode = (): boolean => {
    if (Utils._isEmpty(lovvalgsperiode)) return false;

    return (
      Utils.dato.datoDiffPure(soknadsperiode.fom, lovvalgsperiode.fomDato, "days") !== 0 ||
      Utils.dato.datoDiffPure(soknadsperiode.tom, lovvalgsperiode.tomDato, "days") !== 0
    );
  };

  const dispatch = useDispatch();
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const behandling = useSelector(behandlingerSelectors.BehandlingerSelector) as any;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const [kontrollerPending, setKontrollerPending] = useState(false);
  const [vedtakPending, setVedtakPending] = useState(false);

  const formattedFom = Utils.dato.formatterDatoTilNorsk(
    lovvalgsperiode !== null && !Utils._isEmpty(lovvalgsperiode) ? lovvalgsperiode.fomDato : soknadsperiode.fom,
  );
  const formattedTom = Utils.dato.formatterDatoTilNorsk(
    lovvalgsperiode !== null && !Utils._isEmpty(lovvalgsperiode) ? lovvalgsperiode.tomDato : soknadsperiode.tom,
  );

  const [initiellLovvalgsperiode] = useState({ formattedFom, formattedTom });

  const { watch, setValue, control, formState } = useForm({
    context: {
      soknadsperiode,
    },
    resolver: yupResolver<FieldValues>(vurderingVedtak_11_3_og_13_3aSchema),
    mode: "onChange",
    defaultValues: {
      kopiTilArbeidsgiver: false,
      vedtakstypebegrunnelse: useSelector(behandlingsresultatSelectors.BegrunnelseKoderSelector)[0],
      lovvalgsbestemmelse: lovvalgsperiode?.lovvalgsbestemmelse ?? "",
      fom: initiellLovvalgsperiode.formattedFom,
      tom: initiellLovvalgsperiode.formattedTom,
      korterePeriodeChecked: endretLovvalgsperiode(),
      begrunnelseFritekst: useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector) || "",
    } as FieldValues,
  });
  const formValues = watch();

  const lagreLovvalgsperiode = async (lovvalgsperiodeData?: any) => {
    await dispatch(lovvalgsperioderOperations.opprettLovvalgsperiode(behandlingID, lovvalgsperiodeData));
  };

  const { lovvalgsbestemmelse, fom, tom } = formValues;
  const kontroller = async () => {
    await dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        behandlingsresultattype: behandling.oppsummering.behandlingsresultattype.kode,
        skalRegisteropplysningerOppdateres: false,
      }),
    );
  };

  const stegErGyldig = redigerbart && formState.isValid && !harFeilmeldinger && !kontrollerPending;

  const mapDokumenter = (dokumenter: BrevDokumentMetadataType[]) => {
    return dokumenter.map((dokument: BrevDokumentMetadataType) => {
      dokument.dokumentData.begrunnelseFritekst = formValues?.begrunnelseFritekst;
      dokument.dokumentData.nyVurderingBakgrunn = formValues.vedtakstypebegrunnelse;
      return dokument;
    });
  };

  const behandlingstemaUtenOrienteringsbrev = [
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE,
  ];

  const onSubmit = async () => {
    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        dispatch(vedtakOperations.fatt(behandlingID, lagFattVedtakEOSReqDto())).then((res: any) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };

  const lagFattVedtakEOSReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      begrunnelseFritekst: formValues.begrunnelseFritekst,
      nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
    };
  };

  const leggTilEllerFjernOrienteringsbrev = (kopiTilArbeidsgiverChecked: boolean) => {
    const harOrienteringsbrev = pdfDokumenter.some(
      (dokument: any) =>
        dokument.dokumentData.produserbardokument ===
        MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
    );

    if (!harOrienteringsbrev && kopiTilArbeidsgiverChecked) {
      pdfDokumenter.push({
        dokumentData: {
          produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
          erInnvilgelse: true,
          mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
        },
      });
    } else {
      const index = pdfDokumenter.findIndex(
        (dokument: any) =>
          dokument.dokumentData.produserbardokument ===
          MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
      );

      if (index > -1) {
        pdfDokumenter.splice(index, 1);
      }
    }
  };

  const erNyVurdering =
    behandling.oppsummering.behandlingstype.kode === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  useEffect(() => {
    if (formState.isValid && !formState.isValidating) {
      setKontrollerPending(true);
      lagreLovvalgsperiode({
        fomDato: Utils.dato.formatterDatoTilISO(fom),
        tomDato: Utils.dato.formatterDatoTilISO(tom, ""),
        lovvalgsbestemmelse,
      }).then(() => kontroller().then(() => setKontrollerPending(false)));
    }
  }, [formState.isValid, formState.isValidating, lovvalgsbestemmelse]);

  return (
    <div className="vedtak">
      <Nav.Heading level="1" className="stegvelgertittel">
        Omfattet av norsk trygdelovgivning
      </Nav.Heading>
      <Mui.KodeTermSelect
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setValue("lovvalgsbestemmelse", e.target.value, { shouldValidate: true });
        }}
        label="Velg en lovvalgsbestemmelse"
        value={formValues.lovvalgsbestemmelse}
        koder={[
          KV.kodeTilObjekt(
            MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
            MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
          ),
          KV.kodeTilObjekt(
            MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART13_3A,
            MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia,
          ),
        ]}
        redigerbart={redigerbart}
        disableForsteValg
        className="ktselect__slim"
        feil={null}
      />

      <Nav.BodyLong weight="semibold" size="small" className="undertittel">
        Lovvalgsperiode
      </Nav.BodyLong>
      <Nav.Column>
        {formValues.fom} - {formValues.tom}
      </Nav.Column>

      <Nav.Checkbox
        key="korterePeriode"
        value={formValues.korterePeriodeChecked}
        checked={formValues.korterePeriodeChecked}
        onChange={(a) => {
          setValue("korterePeriodeChecked", a.target.checked);
        }}
        readOnly={!redigerbart}
      >
        Lovvalget innvilges for en kortere periode
      </Nav.Checkbox>

      {formValues.korterePeriodeChecked && soknadsperiode.fom && (
        <Nav.Row className="skjema__panel__rad">
          <Nav.Column xs="3" className="dato">
            <Datovelger
              readOnly={!redigerbart}
              name="fom"
              minDate={Utils.dato.norskStringTilDate(initiellLovvalgsperiode.formattedFom)}
              maxDate={Utils.dato.norskStringTilDate(tom)}
              label="Startdato"
              control={control}
            />
          </Nav.Column>
          <Nav.Column xs="3" className="dato">
            <Datovelger
              readOnly={!redigerbart}
              name="tom"
              minDate={Utils.dato.norskStringTilDate(fom)}
              maxDate={Utils.dato.norskStringTilDate(initiellLovvalgsperiode.formattedTom)}
              label="Sluttdato"
              control={control}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {erNyVurdering && (
        <Nav.Row className="2">
          <Nav.Column xs="7">
            <Forms.Select
              label={
                <LabelMedHjelpetekst
                  label="Oppgi grunn for nytt vedtak (Obligatorisk)"
                  hjelpetekst={NY_VURDERING_BAKGRUNN_HJELPETEKST}
                />
              }
              name="vedtakstypebegrunnelse"
              readOnly={!redigerbart}
              emptyFieldDisabled={!!formValues?.vedtakstypebegrunnelse}
              control={control}
            >
              {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.map((bakgrunn: KTObject) => (
                <option key={bakgrunn.kode} value={bakgrunn.kode} label={bakgrunn.term || ""} />
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      )}

      <Nav.Row>
        <Nav.Column xs="7">
          <Nav.Textarea
            onChange={(e: any) => setValue("begrunnelseFritekst", e.target.value)}
            value={formValues.begrunnelseFritekst}
            label="Fritekstfelt til begrunnelse"
            maxLength={4000}
            readOnly={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      {stegErGyldig && !behandlingstemaUtenOrienteringsbrev.includes(behandling.oppsummering.behandlingstema?.kode) && (
        <Nav.Checkbox
          key="kopiTilArbeidsgiver"
          value={formValues.kopiTilArbeidsgiver}
          onChange={(a) => {
            setValue("kopiTilArbeidsgiver", a.target.checked);
            leggTilEllerFjernOrienteringsbrev(a.target.checked);
          }}
          readOnly={!redigerbart}
        >
          Send kopi til arbeidsgiver/virksomhet
        </Nav.Checkbox>
      )}
      <Nav.Row>
        <Nav.Column xs="7">
          {stegErGyldig && (
            <Dokumentliste
              behandlingID={behandlingID}
              dokumenter={mapDokumenter(pdfDokumenter as BrevDokumentMetadataType[])}
            />
          )}
        </Nav.Column>
      </Nav.Row>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: onSubmit,
          disabled: !stegErGyldig,
          loading: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}
