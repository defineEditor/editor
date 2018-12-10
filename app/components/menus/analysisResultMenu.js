/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import getArmAnalysisResultOids from 'utils/getArmAnalysisResultOids.js';
import { copyAnalysisResults } from 'utils/armUtils.js';
import {
    deleteAnalysisResults,
    addAnalysisResults,
    updateCopyBuffer,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteAnalysisResults : (deleteObj) => dispatch(deleteAnalysisResults(deleteObj)),
        addAnalysisResults : (updateObj) => dispatch(addAnalysisResults(updateObj)),
        updateCopyBuffer : (updateObj) => dispatch(updateCopyBuffer(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        analysisResultDisplays : state.present.odm.study.metaDataVersion.analysisResultDisplays,
        mdv                    : state.present.odm.study.metaDataVersion,
        reviewMode             : state.present.ui.main.reviewMode,
        buffer                 : state.present.ui.main.copyBuffer['analysisResults'],
    };
};

class ConnectedAnalysisResultMenu extends React.Component {

    delete = () => {
        let analysisResults = this.props.analysisResultDisplays.analysisResults;
        let analysisResultOids = [this.props.analysisResultMenuParams.analysisResultOid];
        const { commentOids, whereClauseOids } = getArmAnalysisResultOids(analysisResults, analysisResultOids);
        let deleteObj = {
            resultDisplayOid: this.props.analysisResultMenuParams.resultDisplayOid,
            analysisResultOids,
            commentOids,
            whereClauseOids,
        };
        this.props.deleteAnalysisResults(deleteObj);
        this.props.onClose();
    }

    copy = () => {
        this.props.updateCopyBuffer({
            tab: 'analysisResults',
            buffer: {
                analysisResultOid: this.props.analysisResultMenuParams.analysisResultOid,
            }
        });
        this.props.onClose();
    }

    paste = (shift) => () => {
        const { resultDisplayOid, analysisResultOid } = this.props.analysisResultMenuParams;
        let buffer = this.props.buffer;
        let mdv = this.props.mdv;
        let sourceMdv = mdv;
        let { analysisResults, whereClauses, comments } = copyAnalysisResults({
            mdv,
            sourceMdv,
            analysisResultOidList: [ buffer.analysisResultOid ],
            sameDefine : true,
        });

        let position = mdv.analysisResultDisplays.resultDisplays[resultDisplayOid].analysisResultOrder.indexOf(analysisResultOid) + shift + 1;

        this.props.addAnalysisResults({
            resultDisplayOid,
            position,
            analysisResults,
            comments,
            whereClauses,
        });
        this.props.onClose();
    }

    render() {
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
                    <MenuItem key='Copy' onClick={this.copy} disabled={this.props.reviewMode}>
                        Copy
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
                        Paste Below
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Delete' onClick={this.delete} disabled={this.props.reviewMode}>
                        Delete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedAnalysisResultMenu.propTypes = {
    analysisResultMenuParams : PropTypes.object.isRequired,
    analysisResultDisplays   : PropTypes.object.isRequired,
    updateCopyBuffer         : PropTypes.func.isRequired,
    reviewMode               : PropTypes.bool,
};

const AnalysisResultMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedAnalysisResultMenu);
export default AnalysisResultMenu;
