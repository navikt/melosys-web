import React, { Fragment, useState } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, FormSection } from 'redux-form';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../../felleskomponenter/skjema';
import * as Validering from '../../felleskomponenter/skjema/validering';
import * as Mui from '../../felleskomponenter/ui';
import * as Ikoner from '../../resources/images';
import * as KV from '../../kodeverk';
import * as Api from '../../services/api';
import * as Utils from '../../utils';

import Brukernavnskjema from '../../felleskomponenter/brukernavnskjema';
import Knapperad from '../../felleskomponenter/knapperad';
import EnkeltDato from '../../felleskomponenter/datoOmrade/enkeltDato';

import MKV from '../../melosyskodeverk';

import './opprettnysak.css';

const OpprettNySak = ({
  form,
  formValues,
  tilForsiden,
  handleSubmit,
}) => {
  const [oppgaver, setOppgaver] = useState([]);
  const [oppgaverForsoktHentetFraEksisterendePerson, setOppgaverForsoktHentetFraEksisterendePerson] = useState(false);

  const { behandlingstype } = formValues;
  const soknadErValgt = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD;

  const hentOppgaver = async event => {
    const brukerID = event.target.value;

    if (Validering.erGyldigFnr(brukerID) || Validering.erGyldigDnr(brukerID)) {
      try {
        const oppgaverResponse = await Api.Oppgaver.sok(brukerID);
        setOppgaver(oppgaverResponse);
        setOppgaverForsoktHentetFraEksisterendePerson(true);
      } catch (e) {
        Utils.logger.error(e);
        setOppgaver([]);
      }
    } else {
      setOppgaver([]);
    }
  };

  const radioValg = oppgaver.map(oppgave => {
    const innhold = <Skjema.CustomRadioPanelElement
      tittel={oppgave.tema}
      data={[
        { term: 'Oppgavetype:', description: oppgave.oppgavetype },
        { term: 'Registrert dato:', description: <EnkeltDato dato={oppgave.registrertDato} /> },
        { term: 'Frist:', description: <EnkeltDato dato={oppgave.frist} /> },
        { term: 'Saksid:', description: oppgave.sakID },
      ]}
    />;

    return {
      value: oppgave.oppgaveID,
      innhold,
    };
  });

  const oppgaverFinnes = radioValg.length > 0;

  const filtrerteBehandlingstyper = MKV.KTObjects.behandlinger.behandlingstyper.filter(({ kode }) => ([
    MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
    MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_IKKE_YRKESAKTIV,
  ].includes(kode)));

  return (
    <form className="opprettnysak" onSubmit={handleSubmit}>
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12">
            <h1>Opprett sak</h1>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="8">
            <Nav.Panel>
              <Nav.Row>
                <Nav.Column xs="8">
                  <Mui.Undertittel tekst="Informasjon om bruker" ikon={Ikoner.AccountCircle} className="undertittel" />
                  <Brukernavnskjema
                    className="brukernavnskjema innrykk"
                    form={form}
                    onChange={hentOppgaver}
                  />
                  <Mui.Undertittel tekst="Informasjon om sak" ikon={Ikoner.Filenew} className="undertittel" />
                  <div className="innrykk">
                    <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
                      {
                        MKV.KTObjects.sakstyper.map(({ kode, term }) => (
                          <option key={kode} value={kode}>{term}</option>
                        ))
                      }
                    </Skjema.Select>
                    <Skjema.Select feltNavn="behandlingstype" bredde="fullbredde" label="Behandlingstype">
                      {
                        filtrerteBehandlingstyper.map(({ kode, term }) => (
                          <option key={kode} value={kode}>{term}</option>
                        ))
                      }
                    </Skjema.Select>
                    {
                      soknadErValgt &&
                      <Fragment>
                        <Nav.typo.Normaltekst>Søknadsperiode</Nav.typo.Normaltekst>
                        <FormSection name="soknadsinfo">
                          <Nav.Row>
                            <Nav.Column xs="5">
                              <Skjema.Input datoFelt feltNavn="fom" label="Fra" />
                            </Nav.Column>
                            <Nav.Column xs="5">
                              <Skjema.Input datoFelt feltNavn="tom" label="Til" />
                            </Nav.Column>
                          </Nav.Row>
                          <Skjema.LandVelger multiLand feltNavn="land" label="Land" errorConfig={{ submitFailed: true }} />
                        </FormSection>
                      </Fragment>
                    }
                  </div>
                  <Mui.Undertittel tekst="Knytt oppgave fra Gosys til saken" ikon={Ikoner.CheckList} className="undertittel" />
                  <div className="innrykk">
                    {
                      oppgaverFinnes &&
                      <Skjema.CustomRadioPanelGruppe
                        feltNavn="oppgaveID"
                        radios={radioValg}
                      />
                    }
                    {
                      !oppgaverFinnes && !oppgaverForsoktHentetFraEksisterendePerson &&
                      <Nav.AlertStripeInfo>Skriv inn brukers f.nr eller d.nr for å hente oppgaver.</Nav.AlertStripeInfo>
                    }
                    {
                      !oppgaverFinnes && oppgaverForsoktHentetFraEksisterendePerson &&
                      <Nav.AlertStripeAdvarsel>Det finnes ingen saker på denne personen.</Nav.AlertStripeAdvarsel>
                    }
                    <Skjema.Checkbox
                      className="skalTilordnes"
                      feltNavn="skalTilordnes"
                      label="Legg behandlingen i mine oppgaver"
                    />
                    <Knapperad
                      bekreftTekst="Opprett sak"
                      avbryt={tilForsiden}
                      avbrytTekst="Avbryt"
                      redigerbart
                    />
                  </div>
                </Nav.Column>
              </Nav.Row>
            </Nav.Panel>
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </form>
  );
};

OpprettNySak.propTypes = {
  form: PT.string.isRequired,
  formValues: PT.object,
  tilForsiden: PT.func.isRequired,
  handleSubmit: PT.func.isRequired,
};

OpprettNySak.defaultProps = {
  formValues: {},
};

const mapStateToProps = state => ({
  formValues: getFormValues(KV.Form.OPPRETT_NY_SAK)(state),
  initialValues: {
    skalTilordnes: false,
  },
});

const opprettNySak = async (values, dispatch, props) => {
  const soknadDto = {
    periode: {
      fom: values.behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD ? Utils.dato.formatterDatoTilISO(values.soknadsinfo.fom) : null,
      tom: values.behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD ? Utils.dato.formatterDatoTilISO(values.soknadsinfo.tom) : null,
    },
    land: values.behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD ? values.soknadsinfo.land : [],
  };

  const data = {
    brukerID: values.brukerID,
    sakstype: values.sakstype,
    behandlingstype: values.behandlingstype,
    soknadDto,
    skalTilordnes: values.skalTilordnes,
    oppgaveID: values.oppgaveID,
  };

  try {
    await Api.Fagsaker.fagsak.opprett(data);
    props.tilForsiden();
  } catch (e) {
    Utils.logger.error(e);
  }
};

const OpprettNySakForm = reduxForm({
  onSubmit: opprettNySak,
  form: KV.Form.OPPRETT_NY_SAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.opprettnysak),
})(OpprettNySak);

export default connect(mapStateToProps)(OpprettNySakForm);
