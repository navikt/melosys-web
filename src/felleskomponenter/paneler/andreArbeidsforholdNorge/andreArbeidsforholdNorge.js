import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as MPT from '../../../proptypes';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as Mui from '../../../felleskomponenter/ui';
import * as Ikoner from '../../../resources/images';

import { redigerbartSelectors } from '../../../ducks/redigerbart';
import { OrganisasjonSelectors, OrganisasjonOperations } from '../../../ducks/organisasjoner';

import PanelHeader from '../../panelHeader/panelHeader';
import EkstraArbeidsforholdNorge from './ekstraArbeidsforholdNorge';

import './andreArbeidsforholdNorge.css';

export const AndreArbeidsforholdNorge = ({
  redigerbart,
  organisasjoner,
  hentOrganisasjon,
}) => (
  <div className="andreArbeidsforholdNorge panelSeksjon">
    <Nav.EkspanderbartpanelBase
      heading={<PanelHeader tittel={KV.Paneltitler.andreArbeidsforholdNorge} />}
      ariaTittel="Panel for andre arbeidsforhold i Norge"
    >
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst="Arbeidsforhold i Norge" className="undertittel" />
      <EkstraArbeidsforholdNorge
        leggTilTekst="LEGG TIL NYTT ARBEIDSFORHOLD"
        slettTekst="Slett arbeidsforhold"
        feltNavn="ekstraArbeidsgivere"
        redigerbart={redigerbart}
        hentOrganisasjon={hentOrganisasjon}
        leggTil={(fields, org) => fields.push(org.orgnr)}
        findOrganisasjon={orgnr => organisasjoner.find(enkeltOrg => enkeltOrg.orgnr === orgnr)}
      />
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst="Selvstendig næringsvirksomhet i Norge" className="undertittel selvstendigNaeringsvirksomhetUndertittel" />
      <EkstraArbeidsforholdNorge
        leggTilTekst="LEGG TIL NY SELVSTENDIG VIRKSOMHET"
        slettTekst="Slett virksomhet"
        feltNavn="selvstendigForetak"
        redigerbart={redigerbart}
        hentOrganisasjon={hentOrganisasjon}
        leggTil={(fields, org) => fields.push({ orgnr: org.orgnr })}
        findOrganisasjon={org => organisasjoner.find(enkeltOrg => enkeltOrg.orgnr === org.orgnr)}
      />
    </Nav.EkspanderbartpanelBase>
  </div>
);

AndreArbeidsforholdNorge.propTypes = {
  redigerbart: PT.bool.isRequired,
  organisasjoner: PT.arrayOf(MPT.Organisasjon),
  hentOrganisasjon: PT.func.isRequired,
};

AndreArbeidsforholdNorge.defaultProps = {
  organisasjoner: [],
};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
  organisasjoner: OrganisasjonSelectors.organisasjonerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentOrganisasjon: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AndreArbeidsforholdNorge);
