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
        stdCodeLists: state.present.stdCodeLists,
        showLinkCodeListWarning: state.present.settings.popUp.onCodeListLink,
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
        // tell bootstrap table to exit editing cell
        this.props.onUpdate(this.props.defaultValue);
        if (selectedCodeListOid === undefined) {
            // when Esc is pressed, do nothing and exit editor
            // rule disabled to show what happens if undefined is returned
            // eslint-disable-next-line no-useless-return
            return;
        } else if (selectedCodeListOid === '') {
            // if empty row is selected, unlink the codelist if linked
            this.props.updateCodeList(this.props.row.oid, { linkedCodeListOid: undefined });
        } else {
            let standardCodeListOid;
            let standardOid;
            let enumeratedCodeListOid;
            let enumeratedCodeListElements;
            let decodedCodeListOid;
            let decodedCodeListElements;
            // collect the elements of the codelists to link and the standardOid/standardCodeListOid, if present
            [this.props.row.oid, selectedCodeListOid].forEach((codeListOid) => {
                let codeList = this.props.codeLists[codeListOid];
                switch (codeList.codeListType) {
                    case 'enumerated':
                        enumeratedCodeListOid = codeList.oid;
                        enumeratedCodeListElements = codeList.itemOrder.map(item => codeList.enumeratedItems[item].codedValue);
                        if (codeList.standardOid !== undefined &&
                            this.props.stdCodeLists.hasOwnProperty(codeList.standardOid) &&
                            this.props.stdCodeLists[codeList.standardOid].nciCodeOids.hasOwnProperty(codeList.alias.name)
                        ) {
                            standardCodeListOid = this.props.stdCodeLists[codeList.standardOid].nciCodeOids[codeList.alias.name];
                            standardOid = codeList.standardOid;
                        }
                        break;
                    case 'decoded':
                        decodedCodeListOid = codeList.oid;
                        decodedCodeListElements = codeList.itemOrder.map(item => (codeList.codeListItems[item].decodes[0] || { value: '' }).value);
                        break;
                }
            });
            // if enumerated codelist contains an element, which is not present in decoded codelist (meaning it will be lost after linking)
            // or vice versa (meaning new elements from decoded codelist will be added)
            // and the corresponding setting is turned on, then issue a warning; otherwise, just link the codelists;
            if (this.props.showLinkCodeListWarning &&
                (enumeratedCodeListElements.some(item => decodedCodeListElements.indexOf(item) === -1) || decodedCodeListElements.some(item => enumeratedCodeListElements.indexOf(item) === -1))) {
                this.props.openModal({
                    type: 'LINK_CODELIST',
                    props: { codeListOid: this.props.row.oid, linkedCodeListOid: selectedCodeListOid, standardCodeListOid, standardOid, enumeratedCodeListOid, decodedCodeListOid }
                });
            } else {
                this.props.updateCodeList(this.props.row.oid, {
                    linkedCodeListOid: selectedCodeListOid,
                    standardCodeList: standardCodeListOid ? this.props.stdCodeLists[standardOid].codeLists[standardCodeListOid] : undefined,
                });
            }
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
