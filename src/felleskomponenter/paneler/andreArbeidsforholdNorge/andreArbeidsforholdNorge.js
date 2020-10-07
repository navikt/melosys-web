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
import ArbeidsforholdNorgeListe from './arbeidsforholdNorgeListe';

import './andreArbeidsforholdNorge.css';

export const AndreArbeidsforholdNorge = ({
  redigerbart,
  organisasjoner,
  hentOrganisasjon,
}) => {
  const finnOrganisasjon = orgnr => {
    const org = organisasjoner.find(o => o.orgnr === orgnr);
    return org || { orgnr };
  };

  return (
    <div className="andreArbeidsforholdNorge panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader tittel={KV.Panel.andreArbeidsforholdNorge.tittel} />}
        ariaTittel="Panel for andre arbeidsforhold i Norge"
      >
        <Mui.Undertittel
          ikon={Ikoner.Arbeidsgiver}
          tekst={KV.Panel.andreArbeidsforholdNorge.undertitler.arbeidsforholdINorge}
          className="undertittel"
          understrek
        />
        <ArbeidsforholdNorgeListe
          leggTilTekst="+ LEGG TIL NYTT ARBEIDSFORHOLD"
          slettTekst="Slett arbeidsforhold"
          feltNavn="ekstraArbeidsgivere"
          redigerbart={redigerbart}
          hentOrganisasjon={hentOrganisasjon}
          transformerOrgTilElement={org => org.orgnr}
          findOrganisasjon={finnOrganisasjon}
          defaultElement={null}
          elementerInneholderOrg={(orgListe, orgnr) => orgListe.includes(orgnr)}
        />
        <Mui.Undertittel
          ikon={Ikoner.Arbeidsgiver}
          tekst={KV.Panel.andreArbeidsforholdNorge.undertitler.selvstendigNaeringsdrivendeINorge}
          className="undertittel selvstendigNaeringsvirksomhetUndertittel"
          understrek
        />
        <ArbeidsforholdNorgeListe
          leggTilTekst="+ LEGG TIL NY SELVSTENDIG VIRKSOMHET"
          slettTekst="Slett virksomhet"
          feltNavn="selvstendigForetak"
          redigerbart={redigerbart}
          hentOrganisasjon={hentOrganisasjon}
          transformerOrgTilElement={org => ({ orgnr: org.orgnr })}
          findOrganisasjon={org => organisasjoner.find(enkeltOrg => enkeltOrg.orgnr === org.orgnr)}
          defaultElement={{}}
          elementerInneholderOrg={(orgListe, orgnr) => orgListe.find(org => org.orgnr === orgnr)}
        />
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

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
