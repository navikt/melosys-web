import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import Dokumentliste, {
  BrevDokumentMetadataType,
  SedDokumentMetadataType,
} from "../../../../felleskomponenter/dokumentliste";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import { useDispatch, useSelector } from "react-redux";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import * as Utils from "../../../../utils";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { useEffect, useState } from "react";
import Datovelger from "../../../../felleskomponenter/datovelger";
import feilmeldinger from "../../../../felleskomponenter/feilmeldinger/feilmeldinger";
import { FieldValues, useForm } from "react-hook-form";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { yupResolver } from "@hookform/resolvers/yup";
import vurderingVedtak_11_3_og_13_3a from "./vurderingVedtak11_3_og_13_3aSchema";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { kontrollOperations } from "../../../../ducks/kontroll";

type VurderingVedtakProps = {
  tilbake: () => void;
  redigerbart: boolean;
  pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[];
  harFeilmeldinger: boolean;
  validerMottatteOpplysninger: () => Promise<void>;
};

export const VurderingVedtak11_3_og_13_3a = ({
  redigerbart,
  tilbake,
  pdfDokumenter,
  harFeilmeldinger,
  validerMottatteOpplysninger,
}: VurderingVedtakProps) => {
  const dispatch = useDispatch();
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const behandling = useSelector(behandlingerSelectors.BehandlingerSelector) as any;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const [kontrollerPending, setKontrollerPending] = useState(false);
  const [vedtakPending, setVedtakPending] = useState(false);
  const {
    watch,
    setValue,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingVedtak_11_3_og_13_3a),
    defaultValues: {
      kopiTilArbeidsgiver: false,
      vedtakstypebegrunnelse: useSelector(behandlingsresultatSelectors.BegrunnelseKoderSelector)[0],
      lovvalgsbestemmelse:
        lovvalgsperiode !== null && !Utils._isEmpty(lovvalgsperiode)
          ? lovvalgsperiode.lovvalgsbestemmelse
          : MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      fom:
        lovvalgsperiode !== null && !Utils._isEmpty(lovvalgsperiode)
          ? Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato)
          : Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom),
      tom:
        lovvalgsperiode !== null && !Utils._isEmpty(lovvalgsperiode)
          ? Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato)
          : Utils.dato.formatterDatoTilNorsk(soknadsperiode.tom),
      korterePeriodeChecked: false,
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
      })
    );
  };

  useEffect(() => {
    if (!redigerbart) return;
    setKontrollerPending(true);
    lagreLovvalgsperiode({
      fomDato: Utils.dato.formatterDatoTilISO(fom),
      tomDato: Utils.dato.formatterDatoTilISO(tom),
      lovvalgsbestemmelse,
    }).then(() => kontroller().then(() => setKontrollerPending(false)));
  }, [tom, fom, lovvalgsbestemmelse]);

  const stegErGyldig = redigerbart && formIsValid && !harFeilmeldinger && !kontrollerPending;

  const mapDokumenter = (dokumenter: BrevDokumentMetadataType[]) => {
    return dokumenter.map((dokument: BrevDokumentMetadataType) => {
      return dokument;
    });
  };

  const onSubmit = async () => {
    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        dispatch(vedtakOperations.fatt(behandlingID, lagFattVedtakEOSReqDto()))
          // @ts-ignore
          .then((res: any) => {
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
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      begrunnelseFritekst: formValues.begrunnelseFritekst,
      nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
    };
  };

  const leggTilEllerFjernOrienteringsbrev = (kopiTilArbeidsgiverChecked: boolean) => {
    const harInnvilgelseEFTAStorbritanniaPDF = pdfDokumenter.some(
      (dokument: any) =>
        dokument.dokumentData.produserbardokument ===
        MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK
    );

    if (!harInnvilgelseEFTAStorbritanniaPDF && kopiTilArbeidsgiverChecked) {
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
          MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK
      );

      if (index > -1) {
        pdfDokumenter.splice(index, 1);
      }
    }
  };

  return (
    <div className="vedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Omfattet av norsk trygdelovgivning</Nav.Typo.Innholdstittel>
      <Mui.KodeTermSelect
        onChange={(e) => setValue("lovvalgsbestemmelse", e.target.value)}
        label="Velg en lovvalgsbestemmelse"
        value={formValues.lovvalgsbestemmelse}
        koder={[
          KV.kodeTilObjekt(
            MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
            MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004
          ),

          KV.kodeTilObjekt(
            MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART13_3A,
            MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia
          ),
        ]}
        redigerbart={redigerbart}
        disableForsteValg
        className="ktselect__slim"
      />

      <Nav.Typo.Element className="undertittel">Søknadsperiode</Nav.Typo.Element>
      <Nav.Column>
        {formValues.fom} - {formValues.tom}
      </Nav.Column>

      <Nav.Checkbox
        key="korterePeriode"
        value={formValues.korterePeriodeChecked}
        onChange={(a) => {
          setValue("korterePeriodeChecked", a.target.checked);
        }}
      >
        Lovvalget innvilges for en kortere periode
      </Nav.Checkbox>

      {formValues.korterePeriodeChecked && (
        <Nav.Row>
          <Nav.Column xs="3">
            <Datovelger
              label="Startdato"
              onChange={() => {}}
              value={Utils.dato.norskStringTilDate(formValues.fom)}
              feil={feilmeldinger.name}
              disabled
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Datovelger
              label="Sluttdato"
              minDate={Utils.dato.norskStringTilDate(formValues.fom)}
              value={Utils.dato.norskStringTilDate(formValues.tom)}
              onChange={(tomValue) => setValue("tom", Utils.dato.formatterDatoTilNorsk(tomValue))}
              disabled={!redigerbart}
            />
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
          />
        </Nav.Column>
      </Nav.Row>
      {stegErGyldig && (
        <Nav.Checkbox
          key="kopiTilArbeidsgiver"
          value={formValues.kopiTilArbeidsgiver}
          onChange={(a) => {
            setValue("kopiTilArbeidsgiver", a.target.checked);
            leggTilEllerFjernOrienteringsbrev(a.target.checked);
          }}
          disabled={!redigerbart}
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
};
