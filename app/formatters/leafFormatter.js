import PropTypes from 'prop-types';
import React from 'react';
import path from 'path';
import store from 'store/index.js';
import { ipcRenderer } from 'electron';

const openFile = (event) => {
    event.preventDefault();
    let state = store.getState();
    let pathToDefine = state.present.defines.byId[state.present.odm.defineId].pathToFile;
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
    leaf : PropTypes.object.isRequired,
};

export default LeafFormatter;
