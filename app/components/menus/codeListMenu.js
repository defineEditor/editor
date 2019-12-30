/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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
import clone from 'clone';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import getOid from 'utils/getOid.js';
import { CodeList } from 'core/defineStructure.js';
import {
    deleteCodeLists,
    selectGroup,
    addCodeList,
    updateCopyBuffer,
    openModal,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteCodeLists: (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
        addCodeList: (updateObj, orderNumber) => dispatch(addCodeList(updateObj, orderNumber)),
        updateCopyBuffer: (updateObj) => dispatch(updateCopyBuffer(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
    };
};

const mapStateToProps = state => {
    let reviewMode = state.present.ui.main.reviewMode || state.present.settings.editor.onlyArmEdit;
    return {
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
        codedValuesTabIndex: state.present.ui.tabs.tabNames.indexOf('Coded Values'),
        reviewMode,
        codeListOrder: state.present.odm.study.metaDataVersion.order.codeListOrder,
        buffer: state.present.ui.main.copyBuffer['codeLists'],
        showDeleteCodeListWarning: state.present.settings.popUp.onCodeListDelete,
    };
};

class ConnectedCodeListMenu extends React.Component {
    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        // Run only when menu is opened
        if (Boolean(this.props.anchorEl) === true && !this.props.reviewMode) {
            if (event.keyCode === 73) {
                this.insertRecord(1)();
            } else if (event.keyCode === 67) {
                this.copy();
            } else if (event.keyCode === 85) {
                this.duplicate();
            } else if (event.keyCode === 68) {
                this.deleteCodeList();
            } else if (event.keyCode === 80 && !(this.props.buffer === undefined)) {
                this.paste(1)();
            } else if (event.keyCode === 77) {
                event.preventDefault();
                this.openComments();
            } else if (event.keyCode === 86) {
                this.editCodeListValues();
            }
        }
    }

    insertRecord = (shift) => () => {
        let codeListOid = getOid('CodeList', Object.keys(this.props.codeLists));
        let orderNumber = this.props.codeListOrder.indexOf(this.props.codeListMenuParams.codeListOid) + shift;
        this.props.addCodeList({ oid: codeListOid, name: '', codeListType: 'decoded' }, orderNumber);
        this.props.onClose();
    }

    copy = () => {
        this.props.updateCopyBuffer({
            tab: 'codeLists',
            buffer: {
                codeListOid: this.props.codeListMenuParams.codeListOid,
            }

        });
        this.props.onClose();
    }

    duplicate = () => {
        const buffer = {
            codeListOid: this.props.codeListMenuParams.codeListOid,
        };
        this.paste(1, buffer)();
    }

    paste = (shift, copyBuffer) => () => {
        let buffer = copyBuffer || this.props.buffer;
        // copy codelist from the buffer
        let codeList = { ...new CodeList({ ...clone(this.props.codeLists[buffer.codeListOid]), reviewCommentOids: undefined }) };
        // change codelist OID/name and remove sources/links to other codelists, if available
        codeList.oid = getOid('CodeList', this.props.codeListOrder);
        codeList.name = codeList.name + ' (Copy)';
        codeList.linkedCodeListOid = undefined;
        codeList.sources = undefined;
        // determine the place to insert the codelist to
        let orderNumber = this.props.codeListOrder.indexOf(this.props.codeListMenuParams.codeListOid) + shift;
        // insert the codelist
        this.props.addCodeList(codeList, orderNumber);
        this.props.onClose();
    }

    deleteCodeList = () => {
        let codeLists = this.props.codeLists;
        let codeListOids = [this.props.codeListMenuParams.codeListOid];
        let itemDefOids = [];
        let reviewCommentOids = { codeLists: {} };
        codeListOids.forEach(codeListOid => {
            // Get the list of ItemOIDs for which the codelists should be removed;
            codeLists[codeListOid].sources.itemDefs.forEach(itemDefOid => {
                itemDefOids.push(itemDefOid);
            });
            // Get review comments
            codeLists[codeListOid].reviewCommentOids.forEach(rcOid => {
                if (reviewCommentOids.codeLists[rcOid] === undefined) {
                    reviewCommentOids.codeLists[rcOid] = [];
                }
                if (!reviewCommentOids.codeLists[rcOid].includes(codeListOid)) {
                    reviewCommentOids.codeLists[rcOid].push(codeListOid);
                }
            });
        });

        let deleteObj = {
            codeListOids,
            itemDefOids,
            reviewCommentOids,
        };
        // check if the prompt option is enabled and codelist being deleted are used by variables
        if (this.props.showDeleteCodeListWarning && itemDefOids.length !== 0) {
            // if the check is enabled and codelists are used by some variables, open modal to confirm deletion
            this.props.openModal({
                type: 'DELETE_CODELISTS',
                props: { deleteObj }
            });
        } else {
            // otherwise, delete the codelists straightaway
            this.props.deleteCodeLists(deleteObj);
        }
        this.props.onClose();
    }

    editCodeListValues = () => {
        let updateObj = {
            tabIndex: this.props.codedValuesTabIndex,
            groupOid: this.props.codeListMenuParams.codeListOid,
            scrollPosition: {},
        };
        this.props.onClose();
        this.props.selectGroup(updateObj);
    }

    openComments = () => {
        this.props.openModal({
            type: 'REVIEW_COMMENT',
            props: { sources: { codeLists: [this.props.codeListMenuParams.codeListOid] } }
        });
        this.props.onClose();
    }

    render () {
        return (
            <React.Fragment>
                <Menu
                    id="itemMenu"
                    anchorEl={this.props.anchorEl}
                    open={Boolean(this.props.anchorEl)}
                    onClose={this.props.onClose}
                    PaperProps={{
                        style: {
                            width: 245,
                        },
                    }}
                >
                    { !(this.props.codeListMenuParams.codeListType === 'external') && (
                        <MenuItem key='EditCodelistValues' onClick={this.editCodeListValues}>
                            <u>V</u>iew Codelist Values
                        </MenuItem>
                    )}
                    <MenuItem key='Insert Row Above' onClick={this.insertRecord(0)} disabled={this.props.reviewMode}>
                        Insert Row Above
                    </MenuItem>
                    <MenuItem key='Insert Row Below' onClick={this.insertRecord(1)} disabled={this.props.reviewMode}>
                        <u>I</u>nsert Row Below
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Copy Codelist' onClick={this.copy} disabled={this.props.reviewMode}>
                        <u>C</u>opy Codelist
                    </MenuItem>
                    <MenuItem key='Paste Codelist Above' onClick={this.paste(0)} disabled={this.props.reviewMode || this.props.buffer === undefined}>
                        Paste Codelist Above
                    </MenuItem>
                    <MenuItem key='Paste Codelist Below' onClick={this.paste(1)} disabled={this.props.reviewMode || this.props.buffer === undefined}>
                        <u>P</u>aste Codelist Below
                    </MenuItem>
                    <MenuItem key='DuplicateVariable' onClick={this.duplicate} disabled={this.props.reviewMode}>
                        D<u>u</u>plicate Codelist
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Comments' onClick={this.openComments}>
                        Co<u>m</u>ments
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Delete' onClick={this.deleteCodeList} disabled={this.props.reviewMode}>
                        <u>D</u>elete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedCodeListMenu.propTypes = {
    codeListMenuParams: PropTypes.object.isRequired,
    codeLists: PropTypes.object.isRequired,
    codeListOrder: PropTypes.array.isRequired,
    reviewMode: PropTypes.bool,
};

const CodeListMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListMenu);
export default CodeListMenu;
