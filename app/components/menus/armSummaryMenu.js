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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import getArmResultDisplayOids from 'utils/getArmResultDisplayOids.js';
import { copyResultDisplays } from 'utils/armUtils.js';
import {
    addResultDisplays,
    deleteResultDisplays,
    selectGroup,
    updateCopyBuffer,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addResultDisplays: (updateObj) => dispatch(addResultDisplays(updateObj)),
        deleteResultDisplays: (deleteObj) => dispatch(deleteResultDisplays(deleteObj)),
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
        updateCopyBuffer: (updateObj) => dispatch(updateCopyBuffer(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        analysisResultDisplays: state.present.odm.study.metaDataVersion.analysisResultDisplays,
        armDetailsTabIndex: state.present.ui.tabs.tabNames.indexOf('Analysis Results'),
        reviewMode: state.present.ui.main.reviewMode,
        buffer: state.present.ui.main.copyBuffer['resultDisplays'],
        mdv: state.present.odm.study.metaDataVersion,
    };
};

class ConnectedArmSummaryMenu extends React.Component {
    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        // Run only when menu is opened
        if (Boolean(this.props.anchorEl) === true) {
            if (event.keyCode === 67) {
                this.copy();
            } else if (event.keyCode === 68) {
                this.deleteResultDisplay();
            } else if (event.keyCode === 80 && !(this.props.reviewMode || (this.props.buffer === undefined))) {
                this.paste(1)();
            } else if (event.keyCode === 86) {
                this.editResultDisplayValues();
            }
        }
    }

    deleteResultDisplay = () => {
        let analysisResults = this.props.analysisResultDisplays.analysisResults;
        let resultDisplays = this.props.analysisResultDisplays.resultDisplays;
        let resultDisplayOids = [this.props.armSummaryMenuParams.resultDisplayOid];
        const { commentOids, whereClauseOids, analysisResultOids } = getArmResultDisplayOids(resultDisplays, analysisResults, resultDisplayOids);
        let deleteObj = {
            resultDisplayOids,
            analysisResultOids,
            commentOids,
            whereClauseOids,
        };
        this.props.deleteResultDisplays(deleteObj);
        this.props.onClose();
    }

    insertRecordDialog = (shift) => () => {
        let params = this.props.armSummaryMenuParams;
        // This is confusing as insertRecord does not have +1 added to the orderNumber, but users probably will be confused with position 0
        // that is why +1 is added, to show the first position as 1.
        let orderNumber = this.props.analysisResultDisplays.resultDisplayOrder.indexOf(params.resultDisplayOid) + shift + 1;
        this.props.onAddVariable(orderNumber);
        this.props.onClose();
    }

    editResultDisplayValues = () => {
        let updateObj = {
            tabIndex: this.props.armDetailsTabIndex,
            groupOid: this.props.armSummaryMenuParams.resultDisplayOid,
            scrollPosition: {},
        };
        this.props.onClose();
        this.props.selectGroup(updateObj);
    }

    copy = () => {
        this.props.updateCopyBuffer({
            tab: 'resultDisplays',
            buffer: {
                resultDisplayOid: this.props.armSummaryMenuParams.resultDisplayOid,
            }
        });
        this.props.onClose();
    }

    paste = (shift) => () => {
        const { resultDisplayOid } = this.props.armSummaryMenuParams;
        let buffer = this.props.buffer;
        let mdv = this.props.mdv;
        let sourceMdv = mdv;
        let { resultDisplays, analysisResults, whereClauses, comments } = copyResultDisplays({
            mdv,
            sourceMdv,
            resultDisplayOidList: [ buffer.resultDisplayOid ],
            sameDefine: true,
        });

        let position = this.props.analysisResultDisplays.resultDisplayOrder.indexOf(resultDisplayOid) + shift + 1;

        this.props.addResultDisplays({
            position,
            resultDisplays,
            analysisResults,
            comments,
            whereClauses,
        });
        this.props.onClose();
    }

    render () {
        return (
            <React.Fragment>
                <Menu
                    id="menu"
                    anchorEl={this.props.anchorEl}
                    open={Boolean(this.props.anchorEl)}
                    onClose={this.props.onClose}
                    PaperProps={{
                        style: {
                            width: 245,
                        },
                    }}
                >
                    <MenuItem key='EditResultDisplay' onClick={this.editResultDisplayValues}>
                        <u>V</u>iew Details
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='InsertAboveDialog' onClick={this.insertRecordDialog(0)} disabled={this.props.reviewMode}>
                        Insert New Above
                    </MenuItem>
                    <MenuItem key='InsertBelowDialog' onClick={this.insertRecordDialog(1)} disabled={this.props.reviewMode}>
                        Insert New Below
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Copy' onClick={this.copy} disabled={this.props.reviewMode}>
                        <u>C</u>opy
                    </MenuItem>
                    <MenuItem
                        key='PasteAbove'
                        onClick={this.paste(0)}
                        disabled={this.props.reviewMode || this.props.buffer === undefined}
                    >
                        Paste Above
                    </MenuItem>
                    <MenuItem
                        key='PasteBelow'
                        onClick={this.paste(1)}
                        disabled={this.props.reviewMode || this.props.buffer === undefined}
                    >
                        <u>P</u>aste Below
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Delete' onClick={this.deleteResultDisplay} disabled={this.props.reviewMode}>
                        <u>D</u>elete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedArmSummaryMenu.propTypes = {
    armSummaryMenuParams: PropTypes.object.isRequired,
    analysisResultDisplays: PropTypes.object.isRequired,
    reviewMode: PropTypes.bool,
    onAddVariable: PropTypes.func.isRequired,
};

const ArmSummaryMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedArmSummaryMenu);
export default ArmSummaryMenu;
