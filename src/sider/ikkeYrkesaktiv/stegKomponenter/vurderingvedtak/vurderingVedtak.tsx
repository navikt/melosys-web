import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Utils from "../../../../utils";

import { Lovvalgsperiode } from "./lovvalgsperiode";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";

import vurdering_vedtak from "./vurderingVedtakSchema";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";

import { Feilmeldinger } from "../../../../felleskomponenter/feilmeldinger";
import { INNLEDNING_FRITEKST_HJELPETEKST, BEGRUNNELSE_FRITEKST_HJELPETEKST } from "./tekster";

interface Props {
  aktivtSteg: boolean;
}

export const VurderingVedtak = ({ aktivtSteg }: Props) => {
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);

  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);

  const { control } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    context: {
      soknadsperiode: mottatteOpplysningerPeriode,
    },
    mode: "all",
    values: {
      fom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato),
      tom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato),
      innledningFritekst: "",
      begrunnelseFritekst: "",
    } as FieldValues,
  });

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

      <Nav.Row className="infolinje">
        <Lovvalgsperiode />
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
    </div>
  );
};
