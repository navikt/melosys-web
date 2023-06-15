import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import * as Mui from "../../../../felleskomponenter/ui";

import { Lovvalgsperiode } from "./lovvalgsperiode";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { fagsakSelectors } from "../../../../ducks/fagsaker";

import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";
import { Feilmeldinger } from "../../../../felleskomponenter/feilmeldinger";

import { BEGRUNNELSE_FRITEKST_HJELPETEKST, INNLEDNING_FRITEKST_HJELPETEKST } from "./tekster";
import { formSelectors } from "../../../../ducks/form";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { BrevMottakereTabell } from "./mottakertabell/brevMottakereTabell";

const { IKKE_YRKESAKTIV_VEDTAKSBREV } = MKV.Koder.brev.produserbaredokumenter;

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
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const lagretBegrunnelseFritekst = useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector);
  const lagretInnledningFritekst = useSelector(behandlingsresultatSelectors.InnledningFritekstSelector);
  const mottatteOpplysningerFeilmeldinger = useSelector(formSelectors.SoknadErrorsSelector);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      begrunnelseFritekst: lagretBegrunnelseFritekst || "",
      innledningFritekst: lagretInnledningFritekst || "",
    } as FieldValues,
  });
  const formValues = watch();

  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [kontrollPending, setKontrollPending] = useState(false);
  const stegErGyldig: boolean = redigerbart && formIsValid;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mottatteOpplysningerErGyldig = () => Utils._isEmpty(mottatteOpplysningerFeilmeldinger);

  const kontrollerFerdigbehandling = async () => {
    setKontrollPending(true);
    await dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        skalRegisteropplysningerOppdateres: false,
      })
    );
    setKontrollPending(false);
  };

  useEffect(() => {
    if (aktivtSteg) {
      // noinspection JSIgnoredPromiseFromCall
      kontrollerFerdigbehandling();
    }
  }, [aktivtSteg]);

  const oppdaterFritekster = (values: FormValuesProps) => {
    // noinspection JSIgnoredPromiseFromCall
    if (values && redigerbart && !kontrollPending) {
      Api.Behandlinger.resultat.oppdatererFritekster(behandlingID, {
        innledningFritekst: values.innledningFritekst,
        begrunnelseFritekst: values.begrunnelseFritekst,
      });
    }
  };

  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), []);

  const lagDokumenterData: any = (mottakerRolle: string = "BRUKER") => {
    return {
      produserbardokument: IKKE_YRKESAKTIV_VEDTAKSBREV,
      mottaker: mottakerRolle,
      innledningFritekst: formValues.innledningFritekst || null,
      begrunnelseFritekst: formValues.begrunnelseFritekst || null,
      orgNr: null,
    };
  };

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: IKKE_YRKESAKTIV_VEDTAKSBREV, // TODO: Endre til ikke yrkesaktiv brev
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  useEffect(() => {
    hentMuligeMottakere();
  }, []);

  const lagFattVedtakFTRLReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.MEDLEM_I_FOLKETRYGDEN,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      betalingsintervall: formValues?.betalingsintervall,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
      nyVurderingBakgrunn: null,
    };
  };

  useEffect(() => {
    if (
      formValues.innledningFritekst !== lagretInnledningFritekst ||
      formValues.begrunnelseFritekst !== lagretBegrunnelseFritekst
    ) {
      debouncedOppdaterFritekster(formValues);
    }
  }, [formValues?.innledningFritekst, formValues?.begrunnelseFritekst]);

  const onSubmit = async () => {
    const dispatchFattVedtak = dispatch(vedtakOperations.fatt(behandlingID, lagFattVedtakFTRLReqDto()));
    setKontrollPending(true);
    if (mottatteOpplysningerErGyldig()) {
      dispatchFattVedtak().then((res) => {
        if (res.data?.data?.error) {
          setKontrollPending(false);
        }
      });
    } else {
      setKontrollPending(false);
    }
  };

  return (
    <div className="vurderingVedtakIkkeYrkesaktiv">
      {sakstype === MKV.Koder.sakstyper.EU_EOS && (
        <Nav.Typo.Innholdstittel className="stegvelgertittel">
          Omfattet av norsk trygdelovgivning - trygdeforordning 883/2004
        </Nav.Typo.Innholdstittel>
      )}
      {sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE && (
        <Nav.Typo.Innholdstittel className="stegvelgertittel">
          Omfattet av norsk trygdelovgivning - trygdeavtale
        </Nav.Typo.Innholdstittel>
      )}

      <Feilmeldinger className="vurderingUnntakMedlemskap__feilmelding" feilmeldinger={feilmeldinger} />

      <Nav.Row>
        <Lovvalgsperiode kontrollerFerdigbehandling={kontrollerFerdigbehandling} />
      </Nav.Row>

      <Nav.Row>
        <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
          <LabelMedHjelpetekst
            label="Fritekst til innledning"
            hjelpetekst={INNLEDNING_FRITEKST_HJELPETEKST}
            hjelpetekstClassName="hjelpetekst"
          />
        </Nav.Typo.Element>
        <Forms.HtmlEditor
          name="innledningFritekst"
          control={control}
          className="fritekst_editor"
          placeholder="Skriv inn tilleggsinformasjon til innledning..."
          disabled={!redigerbart}
        />

        <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
          <LabelMedHjelpetekst
            label="Fritekst til begrunnelse"
            hjelpetekst={BEGRUNNELSE_FRITEKST_HJELPETEKST}
            hjelpetekstClassName="hjelpetekst"
          />
        </Nav.Typo.Element>
        <Forms.HtmlEditor
          name="begrunnelseFritekst"
          control={control}
          className="fritekst_editor"
          placeholder="Skriv inn tilleggsinformasjon til begrunnelse..."
          disabled={!redigerbart}
        />
      </Nav.Row>

      {stegErGyldig && (
        <BrevMottakereTabell
          muligeMottakere={muligeMottakere}
          hentBrevRequest={lagDokumenterData}
          formIsValid={stegErGyldig}
        />
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: onSubmit,
          disabled: !stegErGyldig || !formIsValid,
          autoDisableVedSpinner: true,
          spinner: kontrollPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
