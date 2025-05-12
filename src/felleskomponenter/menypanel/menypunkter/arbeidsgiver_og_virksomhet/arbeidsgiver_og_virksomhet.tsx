import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { formValueSelector } from "redux-form";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Tags from "../../tags";
import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";

import { Organisasjon } from "../../../../services/api";

import ArbeidsforholdNorgeListe from "./arbeidsforholdNorgeListe";
import EditerbartElementListe from "../editerbartElementListe";
import EnkeltArbeidsforholdUtlandRedigerer from "./enkeltArbeidsforholdUtlandRedigerer";
import EnkeltArbeidsforholdUtlandRedigeringUtfort from "./enkeltArbeidsforholdUtlandRedigeringUtfort";

import { OrganisasjonSelectors, OrganisasjonOperations } from "../../../../ducks/organisasjoner";
import { fagsakSelectors } from "../../../../ducks/fagsaker";

import "./arbeidsgiver_og_virksomhet.css";

const arbeidsforholdUtlandHarData = (
  elementListe: KV.Form.ArbeidsforholdUtland[],
  element: KV.Form.ArbeidsforholdUtland,
): boolean =>
  Boolean(
    element.navn ||
      element.orgnr ||
      Utils._isBoolean(element.selvstendigNaeringsvirksomhet) ||
      (element.adresse ? Utils.adresse.erStrukturertAdresseObjektTomt(element.adresse) : false),
  );

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => ({
  organisasjoner: OrganisasjonSelectors.organisasjonerSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  ekstraArbeidsgivere: soknadFormValueSelector(state, "juridiskArbeidsgiverNorge.ekstraArbeidsgivere"),
  selvstendigForetak: soknadFormValueSelector(state, "selvstendigForetak"),
  arbeidsforholdUtland: soknadFormValueSelector(state, "arbeidsforholdUtland"),
  selvstendigNaeringsvirksomhetUtland: soknadFormValueSelector(state, "selvstendigNaeringsvirksomhetUtland"),
});
const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  hentOrganisasjon: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type ArbeidsgiverOgVirksomhetProps = PropsFromRedux & {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
};

export function ArbeidsgiverOgVirksomhet({
  redigerbart,
  organisasjoner,
  hentOrganisasjon,
  saksnummer,
  visArbeidsforholdRolleEtiketter,
  ekstraArbeidsgivere = [],
  selvstendigForetak = [],
  arbeidsforholdUtland = [],
  selvstendigNaeringsvirksomhetUtland = [],
}: ArbeidsgiverOgVirksomhetProps) {
  const finnOrganisasjon = (orgnr: string) => {
    const org = organisasjoner.find((o: Organisasjon) => o.orgnr === orgnr);
    return org || { orgnr };
  };

  const arbeidsforholdUtlandHjelpetekst =
    "Her legger du inn informasjon om utenlandsk arbeidsgiver som søker er ansatt og lønnet av. Når det ligger informasjon i dette menypunktet, blir det sendt kopi av vedtak og A1 til Statlig skatteoppkreving. Du skal ikke legge til utenlandsk oppdragsgiver her.";

  return (
    <Nav.Container fluid className="arbeidsgiver__og__virksomhet">
      <div className="tittel">
        <Nav.Heading level="2" style={{ display: "inline", marginRight: "1em" }}>
          {KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel}
        </Nav.Heading>
        {visArbeidsforholdRolleEtiketter && <Tags.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
      </div>
      {ekstraArbeidsgivere.length === 0 && (
        <Nav.Heading level="3" className="arbeidsgiver__og__virksomhet__understrek">
          <Ikoner.Building className="arbeidsgiver__og__virksomhet__mellomrom_ikon_tekst" />
          {KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdINorge}
        </Nav.Heading>
      )}
      <ArbeidsforholdNorgeListe
        className="arbeidsforhold__liste"
        saksnummer={saksnummer}
        leggTilTekst="Legg til arbeidsgiver"
        tittelTekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdINorge}
        tittelIkon={Ikoner.Building}
        feltNavn="juridiskArbeidsgiverNorge.ekstraArbeidsgivere"
        redigerbart={redigerbart}
        hentOrganisasjon={hentOrganisasjon}
        transformerOrgTilElement={(org: Organisasjon) => org.orgnr}
        findOrganisasjon={finnOrganisasjon}
        defaultElement={null}
        elementerInneholderOrg={(orgListe: string[], orgnr: string) => orgListe.includes(orgnr)}
      />
      {selvstendigForetak.length === 0 && (
        <Nav.Heading level="3" className="arbeidsgiver__og__virksomhet__understrek">
          <Ikoner.Man className="arbeidsgiver__og__virksomhet__mellomrom_ikon_tekst" />
          {KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeINorge}
        </Nav.Heading>
      )}
      <ArbeidsforholdNorgeListe
        className="arbeidsforhold__liste"
        saksnummer={saksnummer}
        leggTilTekst="Legg til selvstendig virksomhet"
        tittelTekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeINorge}
        tittelIkon={Ikoner.Man}
        feltNavn="selvstendigForetak"
        redigerbart={redigerbart}
        hentOrganisasjon={hentOrganisasjon}
        transformerOrgTilElement={(org: Organisasjon) => ({ orgnr: org.orgnr })}
        findOrganisasjon={(org: Organisasjon) =>
          organisasjoner.find((enkeltOrg: Organisasjon) => enkeltOrg.orgnr === org.orgnr)
        }
        defaultElement={{}}
        elementerInneholderOrg={(orgListe: Organisasjon[], orgnr: string) =>
          orgListe.find((org) => org.orgnr === orgnr)
        }
      />
      {arbeidsforholdUtland.length === 0 && (
        <Nav.Heading
          level="3"
          className="arbeidsgiver__og__virksomhet__heading arbeidsgiver__og__virksomhet__understrek"
        >
          <Ikoner.Building className="arbeidsgiver__og__virksomhet__mellomrom_ikon_tekst" />
          <span className="heading-tittel">
            {KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdIUtlandet}
          </span>
          <Nav.HelpText
            className="nav-helptext"
            title={`${KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdIUtlandet} hjelpetekst`}
          >
            {arbeidsforholdUtlandHjelpetekst}
          </Nav.HelpText>
        </Nav.Heading>
      )}
      <EditerbartElementListe
        redigerbart={redigerbart}
        className="arbeidsforhold__liste"
        feltNavn="arbeidsforholdUtland"
        leggTilTekst="Legg til arbeidsgiver"
        redigererKomponent={EnkeltArbeidsforholdUtlandRedigerer}
        redigeringUtfortKomponent={EnkeltArbeidsforholdUtlandRedigeringUtfort}
        elementUnderstrek
        hentDefaultElement={() => ({ uuid: Utils._uuid() })}
        hentNavn={(element: KV.Form.ArbeidsforholdUtland) => element.navn || ""}
        tittelTekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdIUtlandet}
        harData={arbeidsforholdUtlandHarData}
        tittelIkon={Ikoner.Building}
      />
      {selvstendigNaeringsvirksomhetUtland.length === 0 && (
        <Nav.Heading level="3" className="arbeidsgiver__og__virksomhet__understrek">
          <Ikoner.Man className="arbeidsgiver__og__virksomhet__mellomrom_ikon_tekst" />
          {KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet}
        </Nav.Heading>
      )}
      <EditerbartElementListe
        redigerbart={redigerbart}
        className="arbeidsforhold__liste"
        leggTilTekst="Legg til selvstendig virksomhet"
        feltNavn="selvstendigNaeringsvirksomhetUtland"
        redigererKomponent={EnkeltArbeidsforholdUtlandRedigerer}
        redigeringUtfortKomponent={EnkeltArbeidsforholdUtlandRedigeringUtfort}
        elementUnderstrek
        hentDefaultElement={() => ({ uuid: Utils._uuid() })}
        hentNavn={(element: KV.Form.ArbeidsforholdUtland) => element.navn || ""}
        tittelTekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet}
        harData={arbeidsforholdUtlandHarData}
        tittelIkon={Ikoner.Man}
      />
    </Nav.Container>
  );
}

export default connector(ArbeidsgiverOgVirksomhet);
