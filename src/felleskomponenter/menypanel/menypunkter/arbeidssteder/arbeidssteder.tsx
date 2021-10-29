import React, { ReactNode } from "react";
import { change, formValueSelector } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { Action } from "redux";

import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Ikoner from "../../../../resources/images";
import * as Nav from "../../../../navFrontend";
import * as Etiketter from "../../etiketter";
import * as Fly from "./fly";
import * as Land from "./land";
import * as Offshore from "./offshore";
import * as Skip from "./skip";

import EditerbartElementListe from "../editerbartElementListe";
import { Status } from "../editerbartElement";

import MKV from "../../../../melosyskodeverk";

import { behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";

import "./arbeidssteder.css";

type FlattArbeidssted = KV.Form.ArbeidsstedFly | KV.Form.ArbeidsstedOffshore | KV.Form.ArbeidsstedSkip;

const flattArbeidsstedErIkkeTomt = (arbeidssted: FlattArbeidssted) =>
  Object.values(arbeidssted).some((v) => !Utils._isNil(v) && v !== "");

const fysiskArbeidsstedErIkkeTomt = (fysiskArbeidssted: KV.Form.FysiskArbeidssted) =>
  !(
    (Utils._isNil(fysiskArbeidssted.virksomhetNavn) || fysiskArbeidssted.virksomhetNavn === "") &&
    Utils.adresse.erStrukturertAdresseObjektTomt(fysiskArbeidssted.adresse)
  );

const fysiskArbeidsstedDefaultElement: KV.Form.FysiskArbeidssted = {
  adresse: {
    tilleggsnavn: "",
    gatenavn: "",
    husnummerEtasjeLeilighet: "",
    landkode: "",
    postboks: "",
    postnummer: "",
    poststed: "",
    region: "",
  },
  virksomhetNavn: "",
};

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => {
  const arbeidPaaLand = soknadFormValueSelector(state, "arbeidPaaLand") as KV.Form.ArbeidsstedPaaLand;

  return {
    erHjemmekontor: arbeidPaaLand.erHjemmekontor,
    erFastArbeidssted: arbeidPaaLand.erFastArbeidssted,
    behandlingsgrunnlagtype: behandlingsgrunnlagSelectors.BehandlingsgrunnlagtypeSelector(state),
    soknadsland: soknadFormValueSelector(state, "soknadsland"),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  slettFastArbeidsstedOgHjemmekontorAvklaring: () => {
    dispatch(change(KV.Form.SOKNAD, "arbeidPaaLand.erFastArbeidssted", null));
    dispatch(change(KV.Form.SOKNAD, "arbeidPaaLand.erHjemmekontor", null));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type ArbeidsstederProps = PropsFromRedux & {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
  behandlingsgrunnlagEtikett: ReactNode;
};

export const Arbeidssteder = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  behandlingsgrunnlagEtikett,
  slettFastArbeidsstedOgHjemmekontorAvklaring,
  erFastArbeidssted,
  erHjemmekontor,
  behandlingsgrunnlagtype,
  soknadsland: { erUkjenteEllerAlleEosLand },
}: ArbeidsstederProps) => {
  const erSoknadFraAltinn =
    behandlingsgrunnlagtype === MKV.Koder.behandlingsgrunnlagtyper.SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;

  const arbeidsstederLister = (
    <>
      <EditerbartElementListe
        redigerbart={redigerbart}
        feltNavn="arbeidPaaLand.fysiskeArbeidssteder"
        redigererPreElementerKomponent={erSoknadFraAltinn ? Land.RedigererPreElementer : undefined}
        redigeringUtfortPreElementerKomponent={erSoknadFraAltinn ? Land.RedigeringUtfortPreElementer : undefined}
        redigererKomponent={Land.Redigerer}
        redigeringUtfortKomponent={Land.RedigeringUtfort}
        ingenDataKomponent={erSoknadFraAltinn ? Land.IngenData : undefined}
        leggTilTekst="Legg til nytt arbeidssted på land"
        hentDefaultElement={() => fysiskArbeidsstedDefaultElement}
        tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedLand}
        tittelIkon={Ikoner.Kontor}
        tittelUnderstrek
        elementUnderstrek
        harData={(elementListe) =>
          [erFastArbeidssted, erHjemmekontor].some((v) => !Utils._isNil(v)) ||
          (elementListe.length !== 0 && elementListe.every(fysiskArbeidsstedErIkkeTomt))
        }
        flereRedigeringsknapper={false}
        onBinClick={slettFastArbeidsstedOgHjemmekontorAvklaring}
        symbolsynlighet={{ [Status.IngenData]: { pencil: true, bin: false } }}
      />
      <EditerbartElementListe
        redigerbart={redigerbart}
        feltNavn="arbeidsstedOffshore"
        redigererKomponent={Offshore.Redigerer}
        redigeringUtfortKomponent={Offshore.RedigeringUtfort}
        leggTilTekst="Legg til nytt arbeidssted offshore"
        hentDefaultElement={() => ({})}
        tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedOffshore}
        tittelIkon={Ikoner.Helikopter}
        tittelUnderstrek
        elementUnderstrek
        harData={(elementListe) => elementListe.length !== 0 && elementListe.every(flattArbeidsstedErIkkeTomt)}
        flereRedigeringsknapper={false}
      />
      <EditerbartElementListe
        redigerbart={redigerbart}
        feltNavn="arbeidsstedSkip"
        redigererKomponent={Skip.Redigerer}
        redigeringUtfortKomponent={Skip.RedigeringUtfort}
        leggTilTekst="Legg til nytt arbeidssted på skip"
        hentDefaultElement={() => ({})}
        tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedSkip}
        tittelIkon={Ikoner.Skip}
        tittelUnderstrek
        elementUnderstrek
        harData={(elementListe) => elementListe.length !== 0 && elementListe.every(flattArbeidsstedErIkkeTomt)}
        flereRedigeringsknapper={false}
      />
      <EditerbartElementListe
        redigerbart={redigerbart}
        feltNavn="arbeidsstedFly"
        redigererKomponent={Fly.Redigerer}
        redigeringUtfortKomponent={Fly.RedigeringUtfort}
        leggTilTekst="Legg til nytt arbeidssted på fly"
        hentDefaultElement={() => ({})}
        tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedFly}
        tittelIkon={Ikoner.Fly}
        tittelUnderstrek
        elementUnderstrek
        harData={(elementListe) => elementListe.length !== 0 && elementListe.every(flattArbeidsstedErIkkeTomt)}
        flereRedigeringsknapper={false}
      />
    </>
  );

  const ukjenteEllerAlleEosLandValgtAlertstripe = (
    <Nav.AlertStripe type="info">
      Ikke mulig å legge til arbeidssted(er) når det ikke er oppgitt land. Du kan endre dette under sidemenypunkt
      “Periode og land”.
    </Nav.AlertStripe>
  );

  return (
    <div className="arbeidssteder">
      <Nav.Typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
        {KV.Menypunkter.Arbeidssteder.tittel}
      </Nav.Typo.Innholdstittel>
      <span>{behandlingsgrunnlagEtikett}</span>
      {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
      <div className="innhold">
        {erUkjenteEllerAlleEosLand ? ukjenteEllerAlleEosLandValgtAlertstripe : arbeidsstederLister}
      </div>
    </div>
  );
};

export default connector(Arbeidssteder);
