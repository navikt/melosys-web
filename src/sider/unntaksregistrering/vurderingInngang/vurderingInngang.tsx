import { useCallback, useContext, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../melosyskodeverk";
import * as Forms from "../../../felleskomponenter/forms";
import * as Mui from "../../../felleskomponenter/ui";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { menypanelOperations } from "../../../ducks/menypanel";
import { fagsakSelectors } from "../../../ducks/fagsaker";

import { FellesHandlersContext } from "../../../contexts";
import vurderingInngangSchema from "./vurderingInngangSchema";
import "./vurderingInngang.css";
import { DialogboksOppfriskSak } from "../../../felleskomponenter/dialogboks";
import { navigeringOperations } from "../../../ducks/navigering";
import { BehandlingUnderOppfriskningSelector } from "../../../ducks/modaler/selectors";

const { EU_EOS, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const gyldigeLandkoder = (sakstype: string) =>
  sakstype === EU_EOS ? MKV.KTObjects.landkoder : MKV.KTObjects.trygdeavtale_myndighetsland;

interface VurderingInngangProps {
  oppdaterStatus: (isValid: boolean) => void;
  bekreft: () => void;
}

const VurderingInngang = ({ bekreft, oppdaterStatus }: VurderingInngangProps) => {
  const dispatch = useDispatch();
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const periode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const avsenderland = useSelector(mottatteOpplysningerSelectors.AvsenderlandSelector);
  const lovvalgsland = useSelector(mottatteOpplysningerSelectors.LovvalgslandSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);
  const { oppfriskOgLastInnSaksopplysninger } = useContext(FellesHandlersContext) as any;
  const behandlingUnderOppfriskning = useSelector(BehandlingUnderOppfriskningSelector);

  const { control, watch, setValue, formState } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    context: { sakstype },
    mode: "all",
    defaultValues: {
      fom: Utils.dato.formatterDatoTilNorsk(periode?.fom),
      tom: Utils.dato.formatterDatoTilNorsk(periode?.tom),
      avsenderland: avsenderland || "",
      lovvalgsland: lovvalgsland || "",
    } as FieldValues,
  });
  const formValues = watch();

  const [initialValues, setInitialValues] = useState<FieldValues>({ ...formState.defaultValues });
  const [visOppfrisk, setVisOppfrisk] = useState(false);

  const skalHenteRegisteropplysninger =
    !registeropplysningerHentet ||
    !Utils.dato.erLikeDatoer(formValues?.fom, initialValues?.fom) ||
    !Utils.dato.erLikeDatoer(formValues?.tom, initialValues?.tom) ||
    formValues?.avsenderland !== initialValues?.avsenderland ||
    formValues?.lovvalgsland !== initialValues?.lovvalgsland;

  const stegErGyldig = formState?.isValid && !skalHenteRegisteropplysninger && !behandlingUnderOppfriskning;

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const debouncedOppdaterPeriode = useCallback(
    Utils._debounce(
      (data: { fom: string; tom: string }) =>
        dispatch(
          mottatteOpplysningerOperations.oppdaterPeriode({
            fom: Utils.dato.formatterDatoTilISO(data.fom, ""),
            tom: Utils.dato.formatterDatoTilISO(data.tom, ""),
          })
        ),
      500
    ),
    []
  );

  const lagreFom = (fom: string) => {
    debouncedOppdaterPeriode({ fom, tom: formValues.tom });
  };

  const lagreTom = (tom: string) => {
    debouncedOppdaterPeriode({ fom: formValues.fom, tom });
  };

  const lagreAvsenderland = (valgtLand: string) => {
    dispatch(mottatteOpplysningerOperations.oppdaterAvsenderland(valgtLand));
    if (Utils._isEmpty(formValues.lovvalgsland) || sakstype === TRYGDEAVTALE) {
      setValue("lovvalgsland", valgtLand);
      lagreLovvalgsland(valgtLand);
    }
  };

  const lagreLovvalgsland = (valgtLand: string) => {
    dispatch(mottatteOpplysningerOperations.oppdaterLovvalgsland(valgtLand));
  };

  const bekreftOgFortsett = () => {
    if (skalHenteRegisteropplysninger) {
      setInitialValues({
        fom: formValues.fom,
        tom: formValues.tom,
        avsenderland: formValues.avsenderland,
        lovvalgsland: formValues.lovvalgsland,
      });
      setVisOppfrisk(true);
    } else {
      bekreft();
    }
  };

  return (
    <div className="vurderingInngang_unntaksregistrering">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi opplysninger fra attesten</Nav.Typo.Innholdstittel>

      <Nav.Typo.Undertittel className="periode_label">Periode</Nav.Typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="2">
          <Forms.Datovelger
            label="Fra og med"
            name="fom"
            disabled={!redigerbart}
            control={control}
            onChange={lagreFom}
          />
        </Nav.Column>
        <Nav.Column xs="2">
          <Forms.Datovelger
            label="Til og med"
            name="tom"
            minDate={Utils.dato.norskStringTilDate(formValues?.fom)}
            disabled={!redigerbart}
            control={control}
            onChange={lagreTom}
          />
        </Nav.Column>
        <Nav.Column xs="4">
          <Forms.Select
            name="avsenderland"
            control={control}
            label="Avsenderland"
            emptyFieldDisabled={!!formValues.avsenderland}
            disabled={!redigerbart}
            onChange={lagreAvsenderland}
          >
            {gyldigeLandkoder(sakstype).map((item: KTObject) => (
              <option key={item.kode} value={item.kode}>
                {item.term}
              </option>
            ))}
          </Forms.Select>
        </Nav.Column>
        {sakstype === EU_EOS && (
          <Nav.Column xs="4">
            <Forms.Select
              name="lovvalgsland"
              control={control}
              label="Lovvalgsland"
              emptyFieldDisabled={!!formValues.lovvalgsland}
              disabled={!redigerbart}
              onChange={lagreLovvalgsland}
            >
              {gyldigeLandkoder(sakstype).map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        )}
      </Nav.Row>

      {sakstype === EU_EOS && (
        <Nav.AlertStripeInfo className="vurderingInngang_unntaksregistrering__alertstripe">
          Hvis avsenderlandet ikke er lovvalgsland, må du endre lovvalgsland.
        </Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreftOgFortsett,
          disabled: !formState?.isValid || !redigerbart,
        }}
      />

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={oppfriskOgLastInnSaksopplysninger}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            dispatch(menypanelOperations.visMenypanel());
            bekreft();
          }}
          tilForsiden={() => {
            setVisOppfrisk(false);
            dispatch(navigeringOperations.tilForsiden());
          }}
          bekreftetFraStart
        />
      )}
    </div>
  );
};

export default VurderingInngang;
