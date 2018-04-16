import React, { Component } from 'react';
import PT from 'prop-types';
import PDF from 'react-pdf-js';

import * as Nav from '../../utils/navFrontend';

import './dokument.css';

const uuid = require('uuid/v4');

/**
 */
class Dokument extends Component {
  state = {};

  onDocumentComplete = pages => {
    this.setState({ page: 1, pages });
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
    let pagination = null;
    if (this.state.pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages);
    }

    return (
      <div className="dokument">
        {pagination}
        <PDF
          file="/dokumenttest.pdf"
          onDocumentComplete={this.onDocumentComplete}
          onPageComplete={this.onPageComplete}
          page={this.state.page}
          fillWidth
        />
      </div>
    );
  }
}

Dokument.propTypes = {
  dokumentURL: PT.string,
};

Dokument.defaultProps = {
  dokumentURL: '',
};

export default Dokument;
