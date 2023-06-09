import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import bem from "../../../bemUtils";
import { VurderingVedtakPeriode } from "./vurderingVedtakPeriode";
import LabelMedHjelpetekst from "../../../felleskomponenter/labelMedHjelpetekst";
import * as Forms from "../../../felleskomponenter/forms";
import vurdering_vedtak from "./vurderingVedtakSchema";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { kontrollOperations } from "../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import * as Utils from "../../../utils";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";
import { Feilmeldinger } from "../../../felleskomponenter/feilmeldinger";

interface Props {
  aktivtSteg: boolean;
}

export const VurderingVedtak = ({ aktivtSteg }: Props) => {
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const vurderingVedtakCls = bem("vurderingVedtakIkkeYrkesaktiv");

  const innledningFritekstHjelpetekst = "Hei";
  const begrunnelseFritekstHjelpetekst = "Hei";

  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);

  const { control, watch } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    context: {
      // sluttDato: mottatteOpplysningerPeriode.tom,
      // soknadsperiode: mottatteOpplysningerPeriode,
    },
    mode: "all",
    defaultValues: {
      innledningFritekst: "",
      begrunnelseFritekst: "",
    } as FieldValues,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formValues = watch();

  const kontrollerFerdigbehandling = () =>
    dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        skalRegisteropplysningerOppdateres: false,
      })
    );

  useEffect(() => {
    if (aktivtSteg) {
      kontrollerFerdigbehandling();
    }
  }, [aktivtSteg]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const harErrorFeilmelding = () => {
    if (typeof feilmeldinger === "string") {
      return !Utils._isEmpty(feilmeldinger);
    }
    return feilmeldinger.length > 0;
  };

  return (
    <div className={vurderingVedtakCls.block}>
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

      <Nav.Row className={vurderingVedtakCls.element("infolinje")}>
        <VurderingVedtakPeriode />
      </Nav.Row>

      <Nav.Row>
        <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
          <LabelMedHjelpetekst
            label="Fritekst til innledning"
            hjelpetekst={innledningFritekstHjelpetekst}
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
            hjelpetekst={begrunnelseFritekstHjelpetekst}
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
    </div>
  );
};
