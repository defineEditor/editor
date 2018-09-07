import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';

// Redux functions
const mapStateToProps = state => {
    return {
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
    };
};

class ConnectedLinkedCodeListEditor extends React.Component {

    getLinkableCodelists = (type) => {
        let linkedCodeListType;
        if (type === 'decoded') {
            linkedCodeListType = 'enumerated';
        } else if (type === 'enumerated') {
            linkedCodeListType = 'decoded';
        }
        // Get list of codelists with decodes for enumeration codelist and vice versa for linked codelist selection;
        return Object.keys(this.props.codeLists).filter( codeListOid => {
            return this.props.codeLists[codeListOid].codeListType === linkedCodeListType;
        }).map( codeListOid => {
            if (this.props.codeLists[codeListOid].linkedCodeListOid !== undefined) {
                return {[this.props.codeLists[codeListOid].oid]: this.props.codeLists[codeListOid].name + ' (Linked)'};
            } else {
                return {[this.props.codeLists[codeListOid].oid]: this.props.codeLists[codeListOid].name};
            }
        });
    }

    handleChange = (updateObj) => {
        if (updateObj === '') {
            this.props.onUpdate(undefined);
        } else {
            this.props.onUpdate(updateObj);
        }
    }

    render () {
        // If it is not a enumeration or decoded codelist, just exit editing.
        if (this.props.row.codeListType !== 'decoded' && this.props.row.codeListType !== 'enumerated') {
            this.props.onUpdate(this.props.defaultValue);
        }
        return (
            <SimpleSelectEditor
                options={this.getLinkableCodelists(this.props.row.codeListType)}
                optional={true}
                onUpdate={this.handleChange}
                autoFocus={true}
            />
        );
    }
}

ConnectedLinkedCodeListEditor.propTypes = {
    codeLists    : PropTypes.object.isRequired,
    defaultValue : PropTypes.string.isRequired,
    row          : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func
};

const LinkedCodeListEditor = connect(mapStateToProps)(ConnectedLinkedCodeListEditor);
export default LinkedCodeListEditor;
