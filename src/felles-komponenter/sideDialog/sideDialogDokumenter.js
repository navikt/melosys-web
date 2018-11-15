import React, { Component } from 'react';
import { connect } from 'react-redux';
// import PT from 'prop-types';
import * as API from '../../services/api';
import * as Ikoner from '../../resources/images/index';
import './sideDialogDokumenter.css';
import * as fagsakSelectors from "../../ducks/fagsaker/selectors";

class SideDialogDokumenter extends Component {

  state = { oversikt: [] };

  async componentDidMount() {
    const { oppsummering: { saksnummer } } = this.props;
    await this.hentDokumentOversikt(saksnummer);
  }
  settOversikt = oversikt => this.setState({ oversikt });

  hentDokumentOversikt = async snr => {
    const oversikt = await API.Dokumenter.hentOversikt(snr);
    this.settOversikt(oversikt);
    console.log('oversikt', oversikt);
  }
  render() {
    return (
      <div className="sideDialogDokumenter">
        <table width="100%">
          <thead>
            <tr>
              <th>inn/ut</th>
              <th>Dokument</th>
              <th>Avsender/mottaker</th>
              <th>Dato</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><img src={Ikoner.Svar} alt="SVAR" /></td>
              <td>
                <span>
                  <a href="#">Vedtaksbrev</a><br />
                  <img src={Ikoner.Binders} alt="Vedlegg" /><a href="#">A1</a>
                </span>
              </td>
              <td>Peder Christen Asbjørnsen</td>
              <td>03.06.2017</td>
            </tr>
            <tr>
              <td><img src={Ikoner.InnBrev} alt="INN" /></td>
              <td>
                <span><a href="#">Inntektsmelding</a></span>
              </td>
              <td>Svensk trygdemyndighet</td>
              <td>30.05.2017</td>
            </tr>
            <tr>
              <td><img src={Ikoner.Svar} alt="SVAR" /></td>
              <td>
                <span><a href="#">Manglende dokumentasjon</a></span>
              </td>
              <td>Clemens Bonifacious</td>
              <td>03.06.2017</td>
            </tr>
            <tr>
              <td><img src={Ikoner.InnBrev} alt="Innbrev" /></td>
              <td>
                <span>
                <a href="#">Endring av søknad</a><br />
                <img src={Ikoner.Binders} alt="Vedlegg" /><a href="#">Fullmakt</a>
              </span>
              </td>
              <td>Thorine Elisabeth Bruun</td>
              <td>24.05.2017</td>
            </tr>
            <tr>
              <td><img src={Ikoner.Svar} alt="SVAR" /></td>
              <td>
                <span><a href="#">Forvaltningsmelding</a></span>
              </td>
              <td>Peder Christen Asbjørnsen</td>
              <td>12.05.2017</td>
            </tr>
            <tr>
              <td><img src={Ikoner.InnBrev} alt="BrevMottat"/></td>
              <td>
                <span>
                  <a href="#">Søknad</a><br />
                  <img src={Ikoner.Binders} alt="Vedlegg" /><a href="#">Fremtidig arbeidskontrakt</a>
                </span>
              </td>
              <td>Peder Christen Asbjørnsen</td>
              <td>22.04.2017</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SideDialogDokumenter);
