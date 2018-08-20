import PropTypes from 'prop-types';
import React from 'react';
import { ipcRenderer } from 'electron';

class LeafFormatter extends React.Component {
    openFile = (event) => {
        event.preventDefault();
        ipcRenderer.send('openFileInExternalApp', this.props.leaf.baseFolder, event.target.attributes[0].value);
    }
    render () {
        return (
            <a href={this.props.leaf.href} onClick={this.openFile}>{this.props.leaf.title}</a>
        );
    }
}

LeafFormatter.propTypes = {
    leaf : PropTypes.object.isRequired,
};

export default LeafFormatter;
