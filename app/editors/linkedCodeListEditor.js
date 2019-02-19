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

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import {
    openModal,
    updateCodeList,
} from 'actions/index.js';

// Redux functions
const mapStateToProps = state => {
    return {
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        openModal: (updateObj) => dispatch(openModal(updateObj)),
        updateCodeList: (oid, updateObj) => dispatch(updateCodeList(oid, updateObj)),
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
        return Object.keys(this.props.codeLists).filter(codeListOid => {
            return this.props.codeLists[codeListOid].codeListType === linkedCodeListType;
        }).map(codeListOid => {
            if (this.props.codeLists[codeListOid].linkedCodeListOid !== undefined) {
                return { [this.props.codeLists[codeListOid].oid]: this.props.codeLists[codeListOid].name + ' (Linked)' };
            } else {
                return { [this.props.codeLists[codeListOid].oid]: this.props.codeLists[codeListOid].name };
            }
        });
    }

    handleChange = (selectedCodeListOid) => {
        this.props.onUpdate(this.props.defaultValue);
        // when Esc is pressed, do nothing and exit editor
        if (selectedCodeListOid === undefined) {
            return;
        }
        // Linking a codelist may change of the enumeration codelist, so provide standardCodelist for the enumerated codelist
        let standardCodeListOid;
        let standardOid;
        if (selectedCodeListOid !== '') {
            let codeList = this.props.codeLists[this.props.row.oid];
            let linkedCodeList = this.props.codeLists[selectedCodeListOid];
            if (codeList.codeListType === 'enumerated' &&
                codeList.standardOid !== undefined &&
                this.props.stdCodeLists.hasOwnProperty(codeList.standardOid) &&
                this.props.stdCodeLists[codeList.standardOid].nciCodeOids.hasOwnProperty(codeList.alias.name)
            ) {
                standardCodeListOid = this.props.stdCodeLists[codeList.standardOid].nciCodeOids[codeList.alias.name];
                standardOid = codeList.standardOid;
                // updateObj.standardCodeList = this.props.stdCodeLists[codeList.standardOid].codeLists[standardCodeListOid];
            } else if (linkedCodeList.codeListType === 'enumerated' &&
                linkedCodeList.standardOid !== undefined &&
                this.props.stdCodeLists.hasOwnProperty(linkedCodeList.standardOid) &&
                this.props.stdCodeLists[linkedCodeList.standardOid].nciCodeOids.hasOwnProperty(linkedCodeList.alias.name)
            ) {
                standardCodeListOid = this.props.stdCodeLists[linkedCodeList.standardOid].nciCodeOids[linkedCodeList.alias.name];
                standardOid = linkedCodeList.standardOid;
                // updateObj.standardCodeList = this.props.stdCodeLists[linkedCodeList.standardOid].codeLists[standardCodeListOid];
            }
        }
        // updateObj['linkedCodeListOid'] = selectedCodeListOid;
        // this.props.updateCodeList(row.oid, updateObj);
        if (selectedCodeListOid === '') {
            this.props.updateCodeList(this.props.row.oid, { linkedCodeListOid: undefined });
        } else {
            // TODO: add clause to check if modal is needed
            this.props.updateCodeList(this.props.row.oid, {
                linkedCodeListOid: selectedCodeListOid,
                standardCodeList: standardCodeListOid ? this.props.stdCodeLists[standardOid].codeLists[standardCodeListOid] : undefined,
            });
            this.props.openModal({
                type: 'LINK_CODELIST',
                props: { codeListOid: this.props.row.oid, linkedCodeListOid: selectedCodeListOid, standardCodeListOid, standardOid }
            });
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
    codeLists: PropTypes.object.isRequired,
    defaultValue: PropTypes.string.isRequired,
    row: PropTypes.object.isRequired,
    onUpdate: PropTypes.func
};

const LinkedCodeListEditor = connect(mapStateToProps, mapDispatchToProps)(ConnectedLinkedCodeListEditor);
export default LinkedCodeListEditor;
