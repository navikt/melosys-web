import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Forms from "../../../../felleskomponenter/forms";

import { Lovvalgsperiode } from "./lovvalgsperiode";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";

import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";

import { Feilmeldinger } from "../../../../felleskomponenter/feilmeldinger";
import { INNLEDNING_FRITEKST_HJELPETEKST, BEGRUNNELSE_FRITEKST_HJELPETEKST } from "./tekster";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";

interface Props {
  aktivtSteg: boolean;
}

interface FormValuesProps {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
}

export const VurderingVedtak = ({ aktivtSteg }: Props) => {
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);

  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const begrunnelseFritekst = useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector);
  const innledningFritekst = useSelector(behandlingsresultatSelectors.InnledningFritekstSelector);

  const { control, watch } = useForm({
    mode: "all",
    defaultValues: {
      begrunnelseFritekst: begrunnelseFritekst || "",
      innledningFritekst: innledningFritekst || "",
    } as FieldValues,
  });
  const formValues = watch();

  const [kontrollPending, setKontrollPending] = useState(false);

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
      kontrollerFerdigbehandling();
    }
  }, [aktivtSteg]);

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !kontrollPending) {
      Api.Behandlinger.resultat.oppdatererFritekster(behandlingID, {
        innledningFritekst: values.innledningFritekst,
        begrunnelseFritekst: values.begrunnelseFritekst,
      });
    }
  };

  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), []);

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
          onChange={() => debouncedOppdaterFritekster(formValues)}
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
          onChange={() => debouncedOppdaterFritekster(formValues)}
        />
      </Nav.Row>
    </div>
  );
};
