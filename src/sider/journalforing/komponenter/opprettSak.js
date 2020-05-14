import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import PT from 'prop-types';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';
import * as Utils from '../../../utils';
import * as KV from '../../../kodeverk';
import { formSelectors } from '../../../ducks/form';
import MKV from '../../../melosyskodeverk';

import './opprettSak.css';

export const OpprettSakTittel = () => (
  <div className="enkeltSak__meta">
    <Nav.typo.Element>Opprett ny sak</Nav.typo.Element>
  </div>
);
const OpprettFagsak = props => {
  const { sakstyper, behandlingstemaer } = props;
  const { journalforingSkjemaVerdier } = props;
  const { opprettnysak_behandlingstema: valgtBehandlingstema } = journalforingSkjemaVerdier;

  const art16 = [
    KV.kodeTilObjekt(
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
      MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004
    ),
    KV.kodeTilObjekt(
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_2,
      MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004
    ),
  ];

  const skalViseSoknadsperiodeOgLand = behandlingstema => ![
    MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED,
    MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
  ].includes(behandlingstema);

  return (
    <div className="panelramme">
      <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
        { sakstyper.map(elem => (<option key={elem.kode} value={elem.kode}>{elem.term}</option>)) }
      </Skjema.Select>
      <Skjema.Select feltNavn="opprettnysak_behandlingstema" bredde="fullbredde" label="Behandlingstema">
        {
          behandlingstemaer &&
          behandlingstemaer.map(elem => (<option key={elem.kode} value={elem.kode}>{elem.term}</option>))
        }
      </Skjema.Select>
      {skalViseSoknadsperiodeOgLand(valgtBehandlingstema) &&
        <Fragment>
          { valgtBehandlingstema === MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL &&
          <Fragment>
            <Nav.Fieldset legend="Unntak fra lovvalgsland:">
              <Nav.Row className="">
                <Nav.Column xs="12">
                  <Skjema.LandVelger label="Velg ett land:" feltNavn="journalforingUnntakFraLovvalgsland" multiLand={false} />
                </Nav.Column>
              </Nav.Row>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Lovvalgsbestemmelse">
              <Nav.Row className="">
                <Nav.Column xs="12">
                  <Skjema.Select label="Artikkelen det gjelder:" feltNavn="journalforingLovvalgsbestemmelse">
                    { art16.map(kodeObjekt => <option key={Utils._uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
                  </Skjema.Select>
                </Nav.Column>
              </Nav.Row>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Unntak fra lovvalgsbestemmelse">
              <Nav.Row className="">
                <Nav.Column xs="12">
                  <Skjema.Select label="Artikkelen det søkes unntak fra:" feltNavn="journalforingUnntakFraLovvalgsbestemmelse">
                    { MKV.Kodekombinasjoner.unntaksbestemmelser.map(kodeObjekt => <option key={Utils._uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
                  </Skjema.Select>
                </Nav.Column>
              </Nav.Row>
            </Nav.Fieldset>
          </Fragment>
          }
          <Nav.Fieldset legend="Søknadsperiode:" className="opprettnysak__soknadsperiode">
            <Nav.Row className="">
              <Nav.Column xs="6">
                <Skjema.Input datoFelt label="Fra" feltNavn="journalforingPeriodeFraOgMed" />
              </Nav.Column>
              <Nav.Column xs="6">
                <Skjema.Input datoFelt label="Til" feltNavn="journalforingPeriodeTilOgMed" />
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
          <Nav.Fieldset legend="Land:">
            <Nav.Row className="">
              <Nav.Column xs="12">
                <Skjema.LandVelger feltNavn="journalforingSoknadsland" multiLand errorConfig={{ submitFailed: true }} />
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
        </Fragment>
      }
    </div>
  );
};
OpprettFagsak.propTypes = {
  behandlingstemaer: PT.arrayOf(MPT.Kodeverk).isRequired,
  sakstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  journalforingSkjemaVerdier: PT.object,
};

OpprettFagsak.defaultProps = {
  journalforingSkjemaVerdier: {},
};
const mapStateToProps = state => ({
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});
export default connect(mapStateToProps, mapDispatchToProps)(OpprettFagsak);
