import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";

import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Api from "../../../../services/api";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../ducks/oppsummertfakta";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";

import vurderingVirksomhetSchema from "./vurderingVirksomhetSchema";
import "./vurderingVirksomhet.css";
import { RedigerbartSelector } from "../../../../ducks/redigerbart/selectors";
import { FormSkjemaStegStatus } from "../../../../felleskomponenter/stegvelger/StegvelgerFTRL";
import { STEG } from "../../../../felleskomponenter/stegvelger";

const komponentState = (state: RootState) => {
  const lagredeValgtevirksomheter = oppsummertfaktaSelectors.VirksomhetIDerSelector(state);
  return {
    virksomheterListe: behandlingerSelectors.AlleVirksomheterSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    lagredeValgtevirksomheter,
    initialValues: {
      valgteVirksomheter: lagredeValgtevirksomheter,
    },
  };
};

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentOppsummertFakta: (behandlingID: number) => dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingID)),
  sendVirksomheter: (behandlingID: number, virksomheter: Api.Avklartefakta.Virksomheter) =>
    dispatch(oppsummertfaktaOperations.sendVirksomheter(behandlingID, virksomheter)),
  hentMottatteOpplysninger: (behandlingID: number) => dispatch(mottatteOpplysningerOperations.hent(behandlingID)),
});

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  rapporterSkjema: (skjemaStatus: FormSkjemaStegStatus) => {};
}

export const VurderingVirksomhet = ({ bekreft, tilbake, rapporterSkjema }: Props) => {
  const redigerbart = useSelector((state: RootState) => RedigerbartSelector(state));
  const dispatch = useDispatch();

  const { hentOppsummertFakta, sendVirksomheter, hentMottatteOpplysninger } = komponentDispatch(dispatch);
  const { virksomheterListe, behandlingID, initialValues, lagredeValgtevirksomheter } = useSelector(
    (state: RootState) => komponentState(state)
  );

  const {
    setValue,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingVirksomhetSchema),
    mode: "onChange",
    defaultValues: {
      ...initialValues,
    } as FieldValues,
  });

  const formValues = watch();

  const [erMottatteOpplysningerLastetInn, setErMottatteOpplysningerLastetInn] = useState(false);
  const hjelpetekst =
    "Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. " +
    'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';

  const lastInnMottatteOpplysninger = async () => {
    await hentMottatteOpplysninger(behandlingID);
    setErMottatteOpplysningerLastetInn(true);
  };
  useEffect(() => {
    rapporterSkjema({ stegNavn: STEG.VIRKSOMHET, dataErGyldig: formIsValid });
  }, [formIsValid]);

  useEffect(() => {
    lastInnMottatteOpplysninger();
    return () => {
      hentOppsummertFakta(behandlingID);
    };
  }, []);

  const handleFortsett = () => {
    if (formValues && formValues.valgteVirksomheter) {
      sendVirksomheter(behandlingID, { virksomhetIDer: formValues.valgteVirksomheter });
      bekreft();
    }
  };

  if (!erMottatteOpplysningerLastetInn || !formValues) {
    return null;
  }

  return (
    <div className="vurderingVirksomhet">
      <Nav.Typo.Undertittel className="undertittel">
        <LabelMedHjelpetekst label="Velg virksomhet" hjelpetekst={hjelpetekst} hjelpetekstClassName="hjelpetekst" />
      </Nav.Typo.Undertittel>

      <Mui.Checkboxgruppe
        muligeValg={virksomheterListe}
        onChange={(checkedVirksomheter) =>
          setValue("valgteVirksomheter", checkedVirksomheter, { shouldValidate: true })
        }
        disabled={!redigerbart}
        defaultValg={lagredeValgtevirksomheter}
      />

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: handleFortsett, disabled: !formIsValid || !redigerbart }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
