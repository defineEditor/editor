import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';

// Redux functions
const mapStateToProps = state => {
    return {
        codeLists: state.odm.study.metaDataVersion.codeLists,
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
            return this.props.codeLists[codeListOid].name;
        });
    }

    render () {
        return (
            <React.Fragment>
                {(this.props.row.codeListType === 'decoded' || this.props.row.codeListType === 'enumerated') ? (
                    <SimpleSelectEditor options={this.getLinkableCodelists(this.props.row.codeListType)} optional={true} onUpdate={this.props.onUpdate}/>
                ) : (
                    <div>Linked codelists are not applicable.</div>
                )
                }
            </React.Fragment>
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
