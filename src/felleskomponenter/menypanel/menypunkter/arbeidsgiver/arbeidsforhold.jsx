import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as Mui from "../../../ui";

import * as Ikoner from "../../../../resources/images";
import EnkeltDato from "../../../enkeltDato";
import OrganisasjonsAdresse from "../../../adresser/organisasjonsAdresse";
import Permisjoner from "./permisjoner";
import TimerTimelonnet from "./timertimelonnet";
import Utenlandsopphold from "./utenlandsopphold";

import Arbeidsavtaler from "./arbeidsavtaler";

import "./arbeidsforhold.css";

export function Arbeidsforholdet(props) {
  const {
    ansettelsesPeriode,
    sistBekreftet,
    arbeidsforholdstype,
    Aordning,
    arbeidsgiver,
    arbeidsavtaler,
    timerTimelonnet,
    utenlandsopphold,
    permisjonOgPermittering,
  } = props.arbeidsforholdet;

  const varighet = Utils.dato.datoDiff(ansettelsesPeriode.fom, ansettelsesPeriode.tom);
  const varighetLabel = `${varighet} mnd`;

  return (
    <div className="panelSeksjon arbeidsforholdet">
      <Nav.Container fluid>
        <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst={arbeidsgiver.navn} understrek />
        <Nav.Row>
          <Nav.Column xs="6">
            <OrganisasjonsAdresse visNavn={false} visTittel={false} className="adresse" organisasjon={arbeidsgiver} />
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.BodyLong weight="semibold" size="small" style={{ marginTop: "0.5em" }}>
              Virksomhetsnummer
            </Nav.BodyLong>
            <Nav.BodyLong size="small">{arbeidsgiver.orgnr}</Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="arbeidsforholdet__enkelt">
          <div className="arbeidsforholdene panelSeksjon">
            <Nav.Row className="arbeidsforhold__enkelt">
              <Nav.Column xs="6">
                <dl className="arbeidsforholdet__detaljer">
                  <dt>Varighet</dt>
                  <dd>{ansettelsesPeriode.tom ? varighetLabel : "(ikke avsluttet)"}</dd>
                  <dt>Bekreftet</dt>
                  <dd>
                    <EnkeltDato dato={sistBekreftet} />
                  </dd>
                  <dt>Type arbeidsforhold</dt>
                  <dd>{arbeidsforholdstype}</dd>
                </dl>
              </Nav.Column>
              <Nav.Column xs="6">
                <dl className="arbeidsforholdet__detaljer">
                  <dt>Periode</dt>
                  <dd>
                    {ansettelsesPeriode.fom} - {ansettelsesPeriode.tom}
                  </dd>
                  <dt>A-ordning</dt>
                  <dd>{Utils.streng.boolTilNorsk(Aordning)}</dd>
                </dl>
              </Nav.Column>
              {arbeidsavtaler && <Arbeidsavtaler arbeidsavtaler={arbeidsavtaler} />}
            </Nav.Row>
          </div>
        </Nav.Row>
        <Nav.Row>
          {timerTimelonnet && <TimerTimelonnet timerTimelonnet={timerTimelonnet} />}
          {permisjonOgPermittering && <Permisjoner permisjoner={permisjonOgPermittering} />}
          {utenlandsopphold && <Utenlandsopphold utenlandsopphold={utenlandsopphold} />}
        </Nav.Row>
      </Nav.Container>
    </div>
  );
}

Arbeidsforholdet.propTypes = {
  arbeidsforholdet: MPT.Arbeidsforholdet.isRequired,
};

function Arbeidsforholdene(props) {
  const { arbeidsforholdene } = props;
  return (
    <div>
      {arbeidsforholdene.map((arbeidsforholdet) => (
        <Arbeidsforholdet key={Utils._uuid()} arbeidsforholdet={arbeidsforholdet} />
      ))}
    </div>
  );
}

Arbeidsforholdene.propTypes = {
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
};

export default Arbeidsforholdene;
