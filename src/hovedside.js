import React from 'react';
import PT from 'prop-types';
import Topplinje from './topplinje';
import './hovedside.css';
function Hovedside({ children }) {
    return (
        <div className="hovedside">
            <Topplinje />
            <div className="main-container">{children}</div>
        </div>
    );
}

Hovedside.defaultProps = {
    children: null,
    routes: null,
};

Hovedside.propTypes = {
    children: PT.node,
};

Hovedside.defaultProps = {
    children: undefined,
};

export default Hovedside;
