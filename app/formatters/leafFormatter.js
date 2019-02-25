/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import PropTypes from 'prop-types';
import React from 'react';
import path from 'path';
import store from 'store/index.js';
import { ipcRenderer } from 'electron';

const openFile = (event) => {
    event.preventDefault();
    let state = store.getState();
    let pathToDefine = state.present.defines.byId[state.present.odm.defineId].pathToFile || '';
    ipcRenderer.send('openFileInExternalApp', path.dirname(pathToDefine), event.target.attributes[0].value);
};

class LeafFormatter extends React.Component {
    render () {
        return (
            <a href={this.props.leaf.href} onClick={openFile}>{this.props.leaf.title}</a>
        );
    }
}

LeafFormatter.propTypes = {
    leaf: PropTypes.object.isRequired,
};

export default LeafFormatter;
