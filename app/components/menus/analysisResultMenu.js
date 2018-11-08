import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import getArmAnalysisResultOids from 'utils/getArmAnalysisResultOids.js';
import {
    deleteAnalysisResults,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteAnalysisResults : (deleteObj) => dispatch(deleteAnalysisResults(deleteObj)),
    };
};

const mapStateToProps = state => {
    return {
        analysisResultDisplays : state.present.odm.study.metaDataVersion.analysisResultDisplays,
        reviewMode             : state.present.ui.main.reviewMode,
    };
};

class ConnectedAnalysisResultMenu extends React.Component {

    deleteAnalysisResult = () => {
        let analysisResults = this.props.analysisResultDisplays.analysisResults;
        let analysisResultOids = [this.props.armSummaryMenuParams.analysisResultOid];
        const { commentOids, whereClauseOids } = getArmAnalysisResultOids(analysisResults, analysisResults, analysisResultOids);
        let deleteObj = {
            resultDisplay: this.props.analysisResultMenuParams.resultDisplayOid,
            analysisResultOids,
            commentOids,
            whereClauseOids,
        };
        this.props.deleteAnalysisResults(deleteObj);
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
                    <MenuItem key='Delete' onClick={this.deleteAnalysisResult} disabled={this.props.reviewMode}>
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
    reviewMode               : PropTypes.bool,
};

const AnalysisResultMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedAnalysisResultMenu);
export default AnalysisResultMenu;
