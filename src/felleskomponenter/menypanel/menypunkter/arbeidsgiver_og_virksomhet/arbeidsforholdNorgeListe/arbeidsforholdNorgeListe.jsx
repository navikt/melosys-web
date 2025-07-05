import PT from "prop-types";
import { FieldArray } from "redux-form";
import classnames from "classnames";

import * as Utils from "../../../../../utils";
import * as Mui from "../../../../ui";
import * as Nav from "../../../../../navFrontend";
import * as Ikoner from "../../../../../resources/images";
import * as MPT from "../../../../../proptypes";

import EditerbartElement, { visAlltidBinSymbolsynlighet } from "../../editerbartElement";
import Organisasjon from "../../arbeidsgiver/organisasjon";
import Kontaktopplysninger, { useKontaktOpplysninger } from "../../kontaktopplysninger";
import EnkeltArbeidsforholdNorgeRedigeringUtfort from "./enkeltArbeidsforholdNorgeRedigeringUtfort";

import "./arbeidsforholdNorgeListe.css";
import Orgnrinput from "./orgnrinput";

function EnkeltArbeidsforholdNorgeRedigerer({
  erstatt,
  valideringer,
  hentVedMount = false,
  redigerbart,
  hentOrganisasjon,
  organisasjon,
  orgIkkeFunnetTekst,
  orgFeilVedHentingTekst,
  onKontaktopplysningerChange,
  kontaktopplysninger,
  onKontaktopplysningerInputBlur,
  onKontaktopplysningerSlettClick,
}) {
  const orgFinnes = !Utils._isEmpty(organisasjon) && !Utils._isEmpty(organisasjon.orgnr);

  return (
    <Nav.Row className="enkeltArbeidsforholdNorgeRedigerer">
      <Nav.Column xs="5">
        <Orgnrinput
          onOrgnrFunnet={erstatt}
          valideringer={valideringer}
          hentVedMount={hentVedMount}
          redigerbart={redigerbart}
          hentOrganisasjon={hentOrganisasjon}
          defaultOrgnr={organisasjon.orgnr || ""}
          ikkeFunnetFeilmelding={orgIkkeFunnetTekst}
          feilVedHentingFeilmelding={orgFeilVedHentingTekst}
        />
        {orgFinnes && (
          <Organisasjon
            organisasjon={organisasjon}
            redigerbart={redigerbart}
            visNavn
            visAdresseTittel={false}
            boldAdresseNavn
          />
        )}
      </Nav.Column>
      <Nav.Column xs="7">
        {orgFinnes && (
          <Kontaktopplysninger
            redigerbart={redigerbart}
            onChange={onKontaktopplysningerChange}
            kontaktopplysninger={kontaktopplysninger}
            onInputBlur={onKontaktopplysningerInputBlur}
            onSlettKnappClick={onKontaktopplysningerSlettClick}
          />
        )}
      </Nav.Column>
    </Nav.Row>
  );
}

EnkeltArbeidsforholdNorgeRedigerer.propTypes = {
  valideringer: PT.arrayOf(
    PT.shape({
      validering: PT.func.isRequired,
      feilmelding: PT.string.isRequired,
    }),
  ).isRequired,
  hentVedMount: PT.bool,
  organisasjon: MPT.Organisasjon.isRequired,
  erstatt: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  orgIkkeFunnetTekst: PT.string,
  orgFeilVedHentingTekst: PT.string,
  onKontaktopplysningerChange: PT.func.isRequired,
  kontaktopplysninger: PT.shape({
    kontaktnavn: PT.string,
    kontaktorgnr: PT.string,
  }).isRequired,
  onKontaktopplysningerInputBlur: PT.func.isRequired,
  onKontaktopplysningerSlettClick: PT.func.isRequired,
};

function EnkeltArbeidsforholdNorge({
  fields,
  redigerbart,
  hentOrganisasjon,
  findOrganisasjon,
  transformerOrgTilElement,
  elementerInneholderOrg,
  saksnummer,
  tittelTekst,
  tittelIkon,
  indeks,
  element = {},
  elementer,
}) {
  const organisasjon = findOrganisasjon(element) || {};

  const [kontaktopplysninger, setKontaktopplysninger, slettKontaktOpplysninger, lagreKontaktOpplysninger] =
    useKontaktOpplysninger(saksnummer, organisasjon.orgnr || "");

  const slett = () => {
    slettKontaktOpplysninger();
    fields.remove(indeks);
  };

  const erstatt = (verdi) => fields.splice(indeks, 1, transformerOrgTilElement(verdi));
  const valideringer = [
    {
      validering: (orgnr) => !Utils.organisasjon.erOrgnrGyldig(orgnr),
      feilmelding: "Ugyldig org.nr.",
    },
    {
      validering: (orgnr) => elementerInneholderOrg(elementer, orgnr) && orgnr !== organisasjon.orgnr,
      feilmelding: "Organisasjon er allerede lagt til",
    },
  ];

  return (
    <EditerbartElement
      className="redigerbartElement"
      redigerbart={redigerbart}
      harData={Boolean(organisasjon.orgnr)}
      tittel={`${tittelTekst}${organisasjon.navn ? `: ${organisasjon.navn}` : ""}`}
      tittelIkon={tittelIkon}
      tittelUnderstrek
      onBinClick={slett}
      visLagreKnappBareHvisHarData
      symbolsynlighet={visAlltidBinSymbolsynlighet}
      redigererRender={() => (
        <EnkeltArbeidsforholdNorgeRedigerer
          erstatt={erstatt}
          valideringer={valideringer}
          redigerbart={redigerbart}
          hentOrganisasjon={hentOrganisasjon}
          organisasjon={organisasjon}
          hentVedMount={Boolean(organisasjon.orgnr)}
          onKontaktopplysningerChange={setKontaktopplysninger}
          kontaktopplysninger={kontaktopplysninger}
          onKontaktopplysningerInputBlur={lagreKontaktOpplysninger}
          onKontaktopplysningerSlettClick={slettKontaktOpplysninger}
        />
      )}
      redigeringUtfortRender={() => (
        <EnkeltArbeidsforholdNorgeRedigeringUtfort saksnummer={saksnummer} org={organisasjon} />
      )}
    />
  );
}

EnkeltArbeidsforholdNorge.propTypes = {
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  findOrganisasjon: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  transformerOrgTilElement: PT.func.isRequired,
  elementerInneholderOrg: PT.func.isRequired,
  saksnummer: PT.string.isRequired,
  tittelTekst: PT.string.isRequired,
  tittelIkon: PT.elementType.isRequired,
  indeks: PT.number.isRequired,
  element: PT.any,
  elementer: PT.arrayOf(PT.any).isRequired,
};

function InnerArbeidsforholdNorgeListe({
  leggTilTekst,
  fields,
  redigerbart,
  hentOrganisasjon,
  findOrganisasjon,
  transformerOrgTilElement = (verdi) => verdi,
  defaultElement,
  elementerInneholderOrg,
  saksnummer,
  tittelTekst,
  tittelIkon,
  className,
}) {
  const elementer = fields.getAll() || [];

  const leggTilDefault = () => {
    fields.push(defaultElement);
  };

  const cls = classnames(className, "innerArbeidsforholdNorgeListe");

  return (
    <div className={cls}>
      {elementer.map((element, indeks) => (
        <EnkeltArbeidsforholdNorge
          key={indeks}
          fields={fields}
          redigerbart={redigerbart}
          hentOrganisasjon={hentOrganisasjon}
          findOrganisasjon={findOrganisasjon}
          transformerOrgTilElement={transformerOrgTilElement}
          elementerInneholderOrg={elementerInneholderOrg}
          saksnummer={saksnummer}
          tittelTekst={tittelTekst}
          tittelIkon={tittelIkon}
          indeks={indeks}
          element={element}
          elementer={elementer}
        />
      ))}
      {redigerbart && (
        <div className="leggTilKnapp">
          <Mui.Lenkeknapp onClick={leggTilDefault} ikon={Ikoner.Add}>
            {leggTilTekst}
          </Mui.Lenkeknapp>
        </div>
      )}
    </div>
  );
}

InnerArbeidsforholdNorgeListe.propTypes = {
  leggTilTekst: PT.string.isRequired,
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  findOrganisasjon: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  transformerOrgTilElement: PT.func,
  defaultElement: PT.any,
  elementerInneholderOrg: PT.func.isRequired,
  saksnummer: PT.string.isRequired,
  tittelTekst: PT.string.isRequired,
  tittelIkon: PT.elementType.isRequired,
  className: PT.string,
};

function ArbeidsforholdNorgeListe({ feltNavn, ...rest }) {
  return (
    <FieldArray rerenderOnEveryChange name={feltNavn} component={InnerArbeidsforholdNorgeListe} props={{ ...rest }} />
  );
}

ArbeidsforholdNorgeListe.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default ArbeidsforholdNorgeListe;
