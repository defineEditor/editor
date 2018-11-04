import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import getArmResultDisplayOids from 'utils/getArmResultDisplayOids.js';
import {
    deleteResultDisplays,
    selectGroup
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteResultDisplays : (deleteObj) => dispatch(deleteResultDisplays(deleteObj)),
        selectGroup         : (updateObj) => dispatch(selectGroup(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        analysisResultDisplays : state.present.odm.study.metaDataVersion.analysisResultDisplays,
        armDetailsTabIndex     : state.present.ui.tabs.tabNames.indexOf('ARM Details'),
        reviewMode             : state.present.ui.main.reviewMode,
    };
};

class ConnectedArmSummaryMenu extends React.Component {

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

    editResultDisplayValues = () => {
        let updateObj = {
            tabIndex       : this.props.codedValuesTabIndex,
            groupOid       : this.props.armSummaryMenuParams.resultDisplaysOid,
            scrollPosition : {},
        };
        this.props.selectGroup(updateObj);
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
                    <MenuItem key='EditResultDisplay' onClick={this.editResultDisplayValues}>
                        View Details
                    </MenuItem>
                    <MenuItem key='Delete' onClick={this.deleteResultDisplay} disabled={this.props.reviewMode}>
                        Delete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedArmSummaryMenu.propTypes = {
    armSummaryMenuParams   : PropTypes.object.isRequired,
    analysisResultDisplays : PropTypes.object.isRequired,
    reviewMode             : PropTypes.bool,
};

const ArmSummaryMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedArmSummaryMenu);
export default ArmSummaryMenu;
