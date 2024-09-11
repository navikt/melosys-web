import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Api from "../../../../../services/api";
import * as Utils from "../../../../../utils";

import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";

import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { mottatteOpplysningerOperations } from "../../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";

import vurderingVirksomhetSchema from "./vurderingVirksomhetSchema";
import { KTObject } from "@navikt/melosys-kodeverk";

const komponentState = (state: RootState) => {
  const lagredeValgtevirksomheter = oppsummertfaktaSelectors.VirksomhetIDerSelector(state);
  return {
    virksomheterListe: behandlingerSelectors.AlleVirksomheterSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    redigerbart: redigerbartSelectors.RedigerbartSelector(state),
    lagredeValgtevirksomheter,
    initialValues: {
      valgteVirksomheter: lagredeValgtevirksomheter,
    },
  };
};

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  sendVirksomheter: (behandlingID: number, virksomheter: Api.Avklartefakta.Virksomheter) =>
    dispatch(oppsummertfaktaOperations.sendVirksomheter(behandlingID, virksomheter)),
  hentMottatteOpplysninger: (behandlingID: number) => dispatch(mottatteOpplysningerOperations.hent(behandlingID)),
});

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingVirksomhet = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();

  const { sendVirksomheter, hentMottatteOpplysninger } = komponentDispatch(dispatch);
  const { redigerbart, virksomheterListe, behandlingID, initialValues, lagredeValgtevirksomheter } =
    useSelector(komponentState);
  const [erMottatteOpplysningerLastetInn, setErMottatteOpplysningerLastetInn] = useState(false);
  const hjelpetekst =
    "Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. " +
    'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';
  const INGEN_VIRKSOMHETER_TEKST =
    'Det er ingen virksomhet registrert. Du må legge til virksomhet under "Arbeidsgiver/virksomhet".';

  const {
    setValue,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingVirksomhetSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    values: useMemo(() => initialValues, [initialValues]),
  });
  const formValues = watch();

  const lastInnMottatteOpplysninger = async () => {
    await hentMottatteOpplysninger(behandlingID);
    setErMottatteOpplysningerLastetInn(true);
  };

  useEffect(() => {
    lastInnMottatteOpplysninger();
  }, []);

  useEffect(() => {
    oppdaterStatus(formIsValid);
  }, [formIsValid]);

  const handleFortsett = () => {
    if (formValues && formValues.valgteVirksomheter) {
      sendVirksomheter(behandlingID, { virksomhetIDer: formValues.valgteVirksomheter });
      bekreft();
    }
  };

  if (!erMottatteOpplysningerLastetInn || !formValues || !aktivtSteg) {
    return null;
  }
  return (
    <>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        <LabelMedHjelpetekst label="Virksomhet" />
      </Nav.Typo.Innholdstittel>
      {!Utils._isEmpty(virksomheterListe) ? (
        <Nav.CheckboxGroup
          legend={<LabelMedHjelpetekst label="Velg virksomhet(er)" hjelpetekst={hjelpetekst} bold small />}
          readOnly={!redigerbart}
          defaultValue={lagredeValgtevirksomheter}
          onChange={(checkedVirksomheter: string[]) =>
            setValue("valgteVirksomheter", checkedVirksomheter, { shouldValidate: true })
          }
        >
          {virksomheterListe.map((fullmakt: KTObject) => (
            <Nav.Checkbox key={fullmakt.kode} value={fullmakt.kode} disabled={!redigerbart}>
              {fullmakt.term}
            </Nav.Checkbox>
          ))}
        </Nav.CheckboxGroup>
      ) : (
        <Nav.Alert variant="error" className="alertstripe">
          {INGEN_VIRKSOMHETER_TEKST}
        </Nav.Alert>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: handleFortsett, disabled: !formIsValid || !redigerbart }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </>
  );
};
