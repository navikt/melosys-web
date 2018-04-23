/* eslint react/no-multi-comp:off */
import React, { Component } from 'react';
import PT from 'prop-types';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import throttle from 'lodash.throttle';

import './dokument.css';

const uuid = require('uuid/v4');

/** For å oppnå full bredde innenfor div-kontainer må
 * vi plassere PDF-komponenten(pdf-js) i en wrapper siden pdf-js ikke støtter prosentvis bredde (kun px).
 * Parent vil da kunne finne bredden i sin egen div og sende den inn til PDFViser.
 */
class PDFViser extends Component {
  state = {};

  onLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  }

  render() {
    const { numPages } = this.state;
    const { pdfDokument } = this.props;
    const pageArray = new Array(numPages).fill(null);

    return (
      <div className="pdfviser">
        <Document
          file={pdfDokument}
          onLoadSuccess={this.onLoadSuccess}
        >
          { pageArray.map((item, index) => (
            <div key={uuid()} id={`section-${index + 1}`}>
              <Page width={this.props.wrapperDivSize} pageNumber={index + 1} />
            </div>
          ))}
        </Document>
      </div>
    );
  }
}

PDFViser.propTypes = {
  pdfDokument: PT.string.isRequired,
  wrapperDivSize: PT.number,
};

PDFViser.defaultProps = {
  wrapperDivSize: 0,
};

/**
 * Dette er hovedkomponenten som eksponeres utenfor pakken. Den wrapper inn
 * PDFLeser lenger opp, men sørger også for å finne korrekt bredde av containeren
 * via eventlisteners ved mount.
 */
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
    const { pdfDokument } = this.props;

    return (
      <div
        id="row"
        className="dokument">
        <div id="pdfWrapper" className="dokument__pdfwrapper" ref={ref => { this.pdfWrapper = ref; }}>
          <PDFViser wrapperDivSize={this.state.width} pdfDokument={pdfDokument} />
        </div>
      </div>
    );
  }
}

Dokument.propTypes = {
  pdfDokument: PT.string.isRequired,
};

export default Dokument;
