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
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AnalysisResultMenu from 'components/menus/analysisResultMenu.js';
import AnalysisResultEditor from 'editors/analysisResultEditor.js';
import AnalysisResultFormatter from 'formatters/analysisResultFormatter.js';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { getDescription } from 'utils/defineStructureUtils.js';
import {
    selectGroup
} from 'actions/index.js';

const styles = theme => ({
    actions: {
        paddingBottom: 0
    },
    content: {
        paddingTop: 8
    },
    title: {
        margin: theme.spacing.unit,
        color: 'rgba(0,0,0,0.54)',
    },
    icon: {
        transform: 'translate(0, -5%)'
    },
    menu: {
        width: 200
    },
    root: {
        outline: 'none',
        marginBottom: theme.spacing.unit,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        mdv: state.present.odm.study.metaDataVersion,
        reviewMode: state.present.ui.main.reviewMode,
        variableTabIndex: state.present.ui.tabs.tabNames.indexOf('Variables'),
    };
};

class ConnectedAnalysisResultTile extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            editMode: false,
            anchorEl: null
        };
    }

    toggleEditMode = () => {
        this.setState({ editMode: !this.state.editMode });
    };

    handleMenuOpen = (event) => {
        this.setState({ anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ anchorEl: null });
    }

    deleteAnalysisResult = defineId => {
        this.handleMenuClose();
    };

    selectGroup = (itemGroupOid) => {
        let updateObj = {
            tabIndex: this.props.variableTabIndex,
            groupOid: itemGroupOid,
            scrollPosition: {},
        };
        this.props.selectGroup(updateObj);
    }

    render () {
        const { classes } = this.props;
        const analysisResult = this.props.mdv.analysisResultDisplays.analysisResults[this.props.analysisResultOid];
        let title = getDescription(analysisResult);

        return (
            <div className={classes.root}>
                <Card className={classes.card} raised={true}>
                    <CardActions className={classes.actions}>
                        {!this.state.editMode && (
                            <Grid container justify="space-between" wrap='nowrap'>
                                <Grid item>
                                    <Typography variant="h5" className={classes.title}>
                                        { title }
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Grid container justify="space-between" wrap='nowrap'>
                                        <Grid item>
                                            <IconButton
                                                color="default"
                                                onClick={this.toggleEditMode}
                                                disabled={this.props.reviewMode}
                                                className={classes.icon}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                onClick={this.handleMenuOpen}
                                                color='default'
                                                className={classes.icon}
                                            >
                                                <MoreVertIcon/>
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                    </CardActions>
                    <CardContent className={classes.content}>
                        {this.state.editMode ? (
                            <AnalysisResultEditor
                                analysisResultOid={this.props.analysisResultOid}
                                onUpdateFinished={() => { this.setState({ editMode: !this.state.editMode }); }}
                            />
                        ) : (
                            <AnalysisResultFormatter
                                mdv={this.props.mdv}
                                analysisResult={analysisResult}
                                selectGroup={this.selectGroup}
                            />
                        )}
                    </CardContent>
                </Card>
                <AnalysisResultMenu
                    onClose={this.handleMenuClose}
                    analysisResultMenuParams={
                        {
                            analysisResultOid: this.props.analysisResultOid,
                            resultDisplayOid: this.props.resultDisplayOid,
                        }
                    }
                    anchorEl={this.state.anchorEl}
                />
            </div>
        );
    }
}

ConnectedAnalysisResultTile.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    reviewMode: PropTypes.bool,
    analysisResultOid: PropTypes.string.isRequired,
    resultDisplayOid: PropTypes.string.isRequired,
    selectGroup: PropTypes.func.isRequired,
    variableTabIndex: PropTypes.number,
};

const AnalysisResultTile = connect(mapStateToProps, mapDispatchToProps)(ConnectedAnalysisResultTile);
export default withStyles(styles)(AnalysisResultTile);
