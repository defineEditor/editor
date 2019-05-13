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

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import setScrollPosition from 'utils/setScrollPosition.js';
import {
    updateLeafs,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 3,
        width: '100%',
        padding: theme.spacing.unit * 2,
        backgroundColor: '#F5F5F5',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateLeafs: (updateObj) => dispatch(updateLeafs(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        reviewComments: state.present.odm.reviewComments,
        mdv: state.present.odm.study.metaDataVersion,
        odm: state.present.odm,
        tabs: state.present.ui.tabs,
    };
};

const panelLabels = {
    standards: 'Standards',
    itemGroups: 'Datasets',
    itemDefs: 'Variables',
    codeLists: 'Codelists',
    resultDisplays: 'Result Displays',
    analysisResults: 'Analysis Results',
};

const panels = Object.keys(panelLabels);

class ConnectedReviewCommentTab extends React.Component {
    constructor (props) {
        super(props);

        let panelStatus = {};
        panels.forEach(panelId => {
            panelStatus[panelId] = false;
        });

        this.state = {
            panelStatus,
        };
    }

    componentDidMount () {
        setScrollPosition(this.props.tabs);
    }

    handleChange = (panelId) => () => {
        this.setState({ panelStatus: { ...this.state.panelStatus, [panelId]: !this.state.panelStatus[panelId] } });
    }

    getReviewCommentData = (reviewComments, panelId) => {
        // Filter required comments
        let results = [];
        let rcOids = Object.keys(reviewComments).filter(id => {
            if (panelId === 'standards') {
                return Object.keys(reviewComments[id].sources).some(sourceId => {
                    if (['standards', 'metaDataVersion', 'globalVariables', 'odm'].includes(sourceId)) {
                        return true;
                    }
                });
            } else {
                return Object.keys(reviewComments[id].sources).includes(panelId);
            }
        });

        rcOids.forEach(id => {
            let reviewComment = reviewComments[id];
            let commentData = {
                text: reviewComment.text,
                resolved: false,
                lastModified: reviewComment.modifiedAt,
                author: reviewComment.author,
            };
            if (reviewComment.resolvedBy) {
                commentData.resolved = true;
            }
            results.push(commentData);
        });

        return results;
    }

    getPanelStats = (data) => {
        let result = { count: 0, resolvedCount: 0 };
        result.count = Object.keys(data).length;
        result.resolvedCount = Object.values(data).filter(comment => (comment.resolved)).length;
        return result;
    }

    render () {
        const { classes, reviewComments } = this.props;
        return (
            <div className={classes.root}>
                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <Typography variant="h4" color='textSecondary'>
                            Review Comments
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        { panels.map(panelId => {
                            let data = this.getReviewCommentData(reviewComments, panelId);
                            let panelStats = this.getPanelStats(data);
                            return (
                                <ExpansionPanel
                                    key={panelId}
                                    expanded={this.state.panelStatus[panelId] === true && panelStats.count > 0}
                                    onChange={this.handleChange(panelId)}
                                    disabled={panelStats.count === 0}
                                >
                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography className={classes.heading}>{panelLabels[panelId]}</Typography>
                                        <Typography className={classes.secondaryHeading}>
                                            {panelStats.count} comment{panelStats.count !== 1 && ('s')}
                                            { panelStats.resolvedCount > 0 && (`(${panelStats.resolvedCount} resolved)`) }
                                        </Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                        <Typography>
                                            Here go details
                                        </Typography>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            );
                        }) }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedReviewCommentTab.propTypes = {
    defineVersion: PropTypes.string.isRequired,
    reviewComments: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    odm: PropTypes.object.isRequired,
};
ConnectedReviewCommentTab.displayName = 'ReviewCommentTab';

const ReviewCommentTab = connect(mapStateToProps, mapDispatchToProps)(ConnectedReviewCommentTab);
export default withStyles(styles)(ReviewCommentTab);
