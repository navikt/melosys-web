import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import MKV from '../../../../melosyskodeverk';

import * as Nav from '../../../../utils/navFrontend';
import * as Api from '../../../../services/api';
import * as Utils from '../../../../utils';
import * as MPT from '../../../../proptypes';

import { fagsakSelectors } from '../../../../ducks/fagsaker';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';

import { redigerbartSelectors } from '../../../../ducks/redigerbart';

import Fullmektig from './fullmektig';

const aktoerTemplate = {
  aktoerID: undefined,
  databaseID: 0,
  institusjonsID: undefined,
  orgnr: undefined,
  representererKode: undefined,
  rolleKode: undefined,
  utenlandskPersonID: undefined,
};

export class Fullmektige extends Component {
  state = {
    fullmektige: [],
    disableLeggTilFullmektig: false,
  };
  async componentDidMount() {
    await this.hentFullmektige();
  }

  settRepresentant = (endretIndex, representererKode) => {
    this.setState(prevState => ({
      fullmektige: prevState.fullmektige.map((fullmektig, index) => (
        index === endretIndex ? { ...fullmektig, representererKode } : fullmektig
      )),
    }));
  };

  lagreNyFullmektigOgOppdaterLokalt = async (representererKode, orgnr) => {
    try {
      const lagretFullmektig = await this.lagreFullmektig(representererKode, orgnr);
      this.setState(prevState => ({
        fullmektige: this.byttUtTemplateMedLagretFullmektig(prevState.fullmektige, lagretFullmektig),
        disableLeggTilFullmektig: false,
      }));
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  byttUtTemplateMedLagretFullmektig = (fullmektige, lagretFullmektig) => fullmektige.map(fullmektig => {
    if (fullmektig.databaseID === 0) return { ...lagretFullmektig };
    return { ...fullmektig };
  });

  lagreFullmektig = (representererKode, orgnr, databaseID) => this.props.lagreAktoer(this.props.fagsak.saksnummer, {
    databaseID: databaseID || null,
    aktoerID: null,
    orgnr,
    utenlandskPersonID: null,
    institusjonsID: null,
    rolleKode: MKV.Koder.aktoersroller.REPRESENTANT,
    representererKode: representererKode || null,
  });

  apneLeggTilFullmektigDialog = () => {
    this.setState(prevState => ({
      fullmektige: [...prevState.fullmektige, { ...aktoerTemplate }],
      disableLeggTilFullmektig: true,
    }));
  };

  hentFullmektige = async () => {
    const { hentAktoer, fagsak } = this.props;
    const { saksnummer } = fagsak;
    try {
      if (!saksnummer) {
        throw new Error('fagsak.saksnummer er undefined', 'fullmektige', '89');
      }
      const fullmektige = await hentAktoer(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT);
      this.setState({ fullmektige });
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  slettFullmektigLokalt = databaseID => {
    const nyFullmektige = this.state.fullmektige.filter(fullmektig => fullmektig.databaseID !== databaseID);
    this.setState({
      fullmektige: nyFullmektige,
    });
    this.setState({ disableLeggTilFullmektig: false });
  };

  render() {
    const { redigerbart, slettAktoer, hentOrg } = this.props;

    const {
      lagreFullmektig,
      slettFullmektigLokalt,
      apneLeggTilFullmektigDialog,
      lagreNyFullmektigOgOppdaterLokalt,
      settRepresentant,
    } = this;

    const { disableLeggTilFullmektig, fullmektige } = this.state;

    return (
      <Nav.Container fluid>
        {fullmektige.map((fullmektig, index) => (
          <Fullmektig
            key={fullmektig.databaseID}
            index={index}
            databaseID={fullmektig.databaseID}
            redigerbart={redigerbart}
            fullmektig={fullmektig}
            lagreFullmektig={lagreFullmektig}
            slettAktoer={slettAktoer}
            slettFullmektigLokalt={slettFullmektigLokalt}
            lagreNyFullmektigOgOppdaterLokalt={lagreNyFullmektigOgOppdaterLokalt}
            hentOrg={hentOrg}
            settRepresentant={settRepresentant}
          />
        ))}
        <Nav.Knapp disabled={disableLeggTilFullmektig || !redigerbart} onClick={apneLeggTilFullmektigDialog} type="standard">+ LEGG TIL FULLMEKTIG</Nav.Knapp>
      </Nav.Container>
    );
  }
}

Fullmektige.propTypes = {
  fagsak: MPT.Fagsak.isRequired,
  hentOrg: PT.func.isRequired,
  hentAktoer: PT.func.isRequired,
  slettAktoer: PT.func.isRequired,
  lagreAktoer: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: behandlingerSelectors.ArbeidsgivereNorgeSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const hentOrg = orgNr => Api.Organisasjoner.hentOrganisasjon(orgNr);
const hentAktoer = (saksnr, rolleKode, representererKode) => Api.Fagsaker.aktoer.hent(saksnr, rolleKode, representererKode);
const lagreAktoer = (saksnr, data) => Api.Fagsaker.aktoer.send(saksnr, data);
const slettAktoer = databaseID => Api.Fagsaker.aktoer.slett(databaseID);

const FullmektigeWrapper = props => (
  <Fullmektige
    {...props}
    lagreAktoer={lagreAktoer}
    hentAktoer={hentAktoer}
    hentOrg={hentOrg}
    slettAktoer={slettAktoer}
  />
);

export default connect(mapStateToProps)(FullmektigeWrapper);
