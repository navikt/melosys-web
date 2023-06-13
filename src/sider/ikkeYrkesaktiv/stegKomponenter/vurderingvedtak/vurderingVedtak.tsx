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

const { GENERELT_FRITEKSTBREV_BRUKER } = MKV.Koder.brev.produserbaredokumenter;

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

  const [vedtakPending, setVedtakPending] = useState(false);
  const stegErGyldig: boolean = redigerbart && formIsValid;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mottatteOpplysningerErGyldig = () => Utils._isEmpty(mottatteOpplysningerFeilmeldinger);

  const kontrollerFerdigbehandling = async () => {
    setVedtakPending(true);
    await dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        skalRegisteropplysningerOppdateres: false,
      })
    );
    setVedtakPending(false);
  };

  useEffect(() => {
    if (aktivtSteg) {
      kontrollerFerdigbehandling();
    }
  }, [aktivtSteg]);

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !vedtakPending) {
      Api.Behandlinger.resultat.oppdatererFritekster(behandlingID, {
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

  // const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker, ikon?: boolean) => {
  //   return [
  //     {
  //       sendesTilDokumenterV2: true,
  //       navn: ikon ? (
  //         <>
  //           <Ikoner.Forhandsvis />
  //           <span className="sr-only">Forhåndsvis dokument {muligMottaker.dokumentNavn}</span>
  //         </>
  //       ) : (
  //         muligMottaker.dokumentNavn
  //       ),
  //       data: {
  //         produserbardokument: GENERELT_FRITEKSTBREV_BRUKER,
  //         mottaker: muligMottaker.rolle,
  //         innledningFritekst: formValues?.innledningFritekst || null,
  //         begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
  //         orgNr: muligMottaker?.orgnr || null,
  //       },
  //     },
  //   ];
  // };

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: GENERELT_FRITEKSTBREV_BRUKER, // TODO: Endre til ikke yrkesaktiv brev
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  useEffect(() => {
    hentMuligeMottakere();
  }, []);

  // const slettKopiMottaker = (kopiMottaker: Api.DokumenterV2.MuligMottaker) => {
  //   if (!muligeMottakere) return;
  //   setMuligeMottakere({
  //     ...muligeMottakere,
  //     kopiMottakere: muligeMottakere.kopiMottakere.filter((mottaker) => mottaker !== kopiMottaker),
  //   });
  // };

  // const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker, kanSlettes: boolean) => {
  //   const sletteknapp = (
  //     <Nav.Knapp type="flat" form="kompakt" onClick={() => slettKopiMottaker(muligMottaker)}>
  //       <Ikoner.Bin />
  //       <span className="sr-only">Slett dokument {muligMottaker.dokumentNavn}</span>
  //     </Nav.Knapp>
  //   );
  //
  //   return [
  //     {
  //       verdi: (
  //         <PdfLenkeListe
  //           behandlingID={behandlingID}
  //           dokumenter={lagDokumenterData(muligMottaker)}
  //           vedKlikk={() => true}
  //           className="forhåndsvisning"
  //         />
  //       ),
  //     },
  //     { verdi: muligMottaker.mottakerNavn },
  //     {
  //       verdi: (
  //         <PdfLenkeListe
  //           behandlingID={behandlingID}
  //           dokumenter={lagDokumenterData(muligMottaker, true)}
  //           vedKlikk={() => true}
  //           className="forhåndsvisning"
  //         />
  //       ),
  //       style: "midtstilt",
  //     },
  //     {
  //       verdi: kanSlettes ? sletteknapp : null,
  //       style: "slettKnapp",
  //     },
  //   ];
  // };

  // const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
  //   return [
  //     mapMottakerRad(mottakere.hovedMottaker, false),
  //     ...mottakere.kopiMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker, true)),
  //     ...mottakere.fasteMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker, false)),
  //   ];
  // };
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

  const onSubmit = async () => {
    const dispatchFattVedtak = dispatch(vedtakOperations.fatt(behandlingID, lagFattVedtakFTRLReqDto()));
    setVedtakPending(true);
    if (mottatteOpplysningerErGyldig()) {
      dispatchFattVedtak().then((res) => {
        if (res.data?.data?.error) {
          setVedtakPending(false);
        }
      });
    } else {
      setVedtakPending(false);
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
        // <MottakerTabell
        //   rader={muligeMottakere ? mapMottakerRader(muligeMottakere) : []}
        //   kolonner={[
        //     { verdi: "Dokumenter", bredde: "60%" },
        //     { verdi: "Mottaker", bredde: "20%" },
        //     { verdi: "Forhåndsvis", bredde: "10%", style: "normal_font_weight midtstilt" },
        //     { verdi: "Slett", bredde: "10%", style: "normal_font_weight midtstilt" },
        //   ]}
        // />

        <BrevMottakereTabell
          muligeMottakere={muligeMottakere}
          hentBrevRequest={() => console.log("hentBrevRequest")}
          formIsValid={stegErGyldig}
        />
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: onSubmit,
          disabled: !stegErGyldig || !formIsValid,
          autoDisableVedSpinner: true,
          spinner: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
