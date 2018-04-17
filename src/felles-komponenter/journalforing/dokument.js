/* eslint react/no-multi-comp:off */
import React, { Component } from 'react';
import PT from 'prop-types';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import throttle from 'lodash.throttle';

import * as Nav from '../../utils/navFrontend';

import './dokument.css';

const uuid = require('uuid/v4');

/** For å oppnå full bredde innenfor div-kontainer må
 * vi plassere PDF-komponenten(pdf-js) i en wrapper siden pdf-js ikke støtter prosentvis bredde (kun px).
 * Parent vil da kunne finne bredden i sin egen div og sende den inn til PDFViser.
 */
class PDFViser extends Component {
  state = {};

  onLoadSuccess = ({ numPages }) => {
    this.setState({ page: 1, numPages });
  }

  onPageComplete = page => {
    this.setState({ page });
  }

  tilSteg = steg => {
    this.setState({ page: steg + 1 });
  }

  renderPagination = (page, pages) => {
    const pageArray = new Array(pages).fill(null);
    return (
      <nav>
        <Nav.Stegindikator onChange={this.tilSteg}>
          {
            pageArray.map((item, index) => <Nav.Stegindikator.Steg key={uuid()} aktiv={index === page - 1}>Side { index }</Nav.Stegindikator.Steg>)
          }
        </Nav.Stegindikator>
      </nav>
    );
  }

  render() {
    const { page, numPages } = this.state;
    const { dokumentURL } = this.props;
    const pageArray = new Array(numPages).fill(null);
    const pagination = this.state.numPages && this.renderPagination(page, numPages);

    return (
      <div className="dokument">
        <div className="dokument__paginering">
          {pagination}
        </div>
        <Document
          file={dokumentURL}
          onLoadSuccess={this.onLoadSuccess}
        >
          { pageArray.map((item, index) => <Page key={uuid()} width={this.props.wrapperDivSize} pageNumber={index + 1} />)}
        </Document>
      </div>
    );
  }
}

PDFViser.propTypes = {
  dokumentURL: PT.string.isRequired,
  wrapperDivSize: PT.number.isRequired,
};

PDFViser.defaultProps = {};

class Dokument extends Component {
  state = { width: null }

  componentDidMount () {
    this.setDivSize();
    window.addEventListener('resize', throttle(this.setDivSize, 500));
  }

  componentWillUnmount () {
    window.removeEventListener('resize', throttle(this.setDivSize, 500));
  }

  setDivSize = () => {
    this.setState({ width: this.pdfWrapper.getBoundingClientRect().width });
  }

  render() {
    const { dokumentURL } = this.props;

    return (
      <div>
        <div
          id="row"
          style={
            {
              height: 'auto', width: '100%', display: 'flex', overflow: 'hidden',
            }
          }>
          <div id="pdfWrapper" style={{ width: '100%' }} ref={ref => { this.pdfWrapper = ref; }}>
            <PDFViser wrapperDivSize={this.state.width} dokumentURL={dokumentURL} />
          </div>
        </div>
      </div>
    );
  }
}

Dokument.propTypes = {
  dokumentURL: PT.string.isRequired,
};

export default Dokument;
