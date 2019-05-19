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
import { sanitize } from 'dompurify';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import { FaArrowCircleRight as GoToSourceIcon, FaCheck, FaTimes } from 'react-icons/fa';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import setScrollPosition from 'utils/setScrollPosition.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import {
    openModal,
    selectGroup,
    changeTab,
    toggleResolveComment,
    toggleReviewCommentPanel,
    toggleReviewCommentShowResolved,
} from 'actions/index.js';

const styles = theme => ({
    table: {
        backgroundColor: '#FFFFFF',
    },
    resolved: {
        backgroundColor: '#EEEEEE',
    },
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
    icon: {
        marginLeft: theme.spacing.unit,
    },
    button: {
        marginLeft: theme.spacing.unit,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        openModal: (updateObj) => dispatch(openModal(updateObj)),
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
        changeTab: (updateObj) => dispatch(changeTab(updateObj)),
        toggleResolveComment: (updateObj) => dispatch(toggleResolveComment(updateObj)),
        toggleReviewCommentPanel: (updateObj) => dispatch(toggleReviewCommentPanel(updateObj)),
        toggleReviewCommentShowResolved: () => dispatch(toggleReviewCommentShowResolved()),
    };
};

const mapStateToProps = state => {
    const settings = state.present.ui.tabs.settings[state.present.ui.tabs.currentTab];
    return {
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        reviewComments: state.present.odm.reviewComments,
        mdv: state.present.odm.study.metaDataVersion,
        odm: state.present.odm,
        tabs: state.present.ui.tabs,
        author: state.present.settings.general.userName,
        panelStatus: settings.panelStatus,
        showResolved: settings.showResolved,
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

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.primary.main,
        color: '#EEEEEE',
        fontSize: 16,
        fontWeight: 'bold',
    },
}))(TableCell);

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
        this.props.toggleReviewCommentPanel({ panelId });
    }

    toggleShowResolved = () => {
        this.props.toggleReviewCommentShowResolved();
    }

    getReviewCommentData = (reviewComments, panelId, showResolved, mdv) => {
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
                id: id,
                text: sanitize(reviewComment.text),
                resolved: false,
                lastModified: reviewComment.modifiedAt,
                author: reviewComment.author,
            };
            if (reviewComment.resolvedBy) {
                if (showResolved === false) {
                    // In case resolved comments are not show, skip the iteration
                    return;
                } else {
                    commentData.resolved = true;
                }
            }
            // Get names of the sources
            let sourceName = '';
            let sources = reviewComments[id].sources;
            if (panelId === 'standards') {
                let sourceId = Object.keys(sources)[0];
                switch (sourceId) {
                    case 'standards':
                        sourceName = 'Standards';
                        break;
                    case 'metaDataVersion':
                        sourceName = 'Metadata Version';
                        break;
                    case 'globalVariables':
                        sourceName = 'Global Variables';
                        break;
                    case 'odm':
                        sourceName = 'ODM';
                        break;
                    default:
                        sourceName = '';
                        break;
                }
            } else {
                let sourceId = Object.keys(sources)[0];
                let sourceValue = sources[sourceId][0];
                if (['analysisResults', 'resultDisplays'].includes(panelId)) {
                    if (sourceId &&
                        mdv.analysisResultDisplays &&
                        mdv.analysisResultDisplays[sourceId] &&
                        mdv.analysisResultDisplays[sourceId].hasOwnProperty(sourceValue) &&
                        mdv.analysisResultDisplays[sourceId][sourceValue].descriptions
                    ) {
                        if (panelId === 'analysisResults') {
                            sourceName = getDescription(mdv.analysisResultDisplays[sourceId][sourceValue]);
                            // Get name of the result display
                            const analysisResult = mdv.analysisResultDisplays[sourceId][sourceValue];
                            if (analysisResult.sources &&
                                analysisResult.sources.resultDisplays
                            ) {
                                const resultDisplay = mdv.analysisResultDisplays.resultDisplays[analysisResult.sources.resultDisplays[0]];
                                commentData.parentItemOid = resultDisplay.oid;
                                if (resultDisplay) {
                                    sourceName = `${resultDisplay.name} ${sourceName}`;
                                }
                            }
                        } else {
                            sourceName = mdv.analysisResultDisplays[sourceId][sourceValue].name;
                        }
                    }
                } else {
                    if (sourceId && mdv[sourceId] && mdv[sourceId].hasOwnProperty(sourceValue)) {
                        sourceName = mdv[sourceId][sourceValue].name;
                        if (sourceId === 'itemDefs') {
                            // Get the dataset name or the VLM name
                            const itemDef = mdv[sourceId][sourceValue];
                            if (itemDef.parentItemDefOid && mdv.itemDefs.hasOwnProperty(itemDef.parentItemDefOid)) {
                                // VLM
                                const parentItemDef = mdv.itemDefs[itemDef.parentItemDefOid];
                                const itemGroupOid = parentItemDef.sources && parentItemDef.sources.itemGroups && parentItemDef.sources.itemGroups[0];
                                commentData.parentItemOid = itemGroupOid;
                                if (itemGroupOid && mdv.itemGroups.hasOwnProperty(itemGroupOid)) {
                                    sourceName = `${mdv.itemGroups[itemGroupOid].name}.${parentItemDef.name}.${sourceName}`;
                                }
                            } else {
                                const itemGroupOid = itemDef.sources && itemDef.sources.itemGroups && itemDef.sources.itemGroups[0];
                                commentData.parentItemOid = itemGroupOid;
                                if (itemGroupOid && mdv.itemGroups.hasOwnProperty(itemGroupOid)) {
                                    sourceName = `${mdv.itemGroups[itemGroupOid].name}.${sourceName}`;
                                }
                            }
                        }
                    }
                }
            }
            commentData.sourceName = sourceName;
            results.push(commentData);
        });

        return results;
    }

    openComments = (reviewCommentId) => () => {
        this.props.openModal({
            type: 'REVIEW_COMMENT',
            props: { sources: { reviewComments: [reviewCommentId] } },
        });
    }

    goToSource = (panelId, parentItemOid) => () => {
        const tabNames = this.props.tabs.tabNames;
        if (['standards', 'itemGroups', 'codeLists', 'resultDisplays'].includes(panelId)) {
            let updateObj = {
                selectedTab: tabNames.indexOf(panelLabels[panelId]),
                currentScrollPosition: window.scrollY,
            };
            this.props.changeTab(updateObj);
        } else if (['analysisResults', 'itemDefs'].includes(panelId)) {
            let updateObj = {
                tabIndex: tabNames.indexOf(panelLabels[panelId]),
                groupOid: parentItemOid,
                scrollPosition: window.scrollY,
            };
            this.props.selectGroup(updateObj);
        }
    }

    toggleResolve = (oid) => () => {
        this.props.toggleResolveComment({
            oid: oid,
            author: this.props.author,
        });
    }

    getTable = (data, panelId) => {
        const { classes } = this.props;
        return (
            <Table className={classes.table}>
                <colgroup>
                    <col style={{ width: '15%' }}/>
                    <col style={{ width: '15%' }}/>
                    <col style={{ width: '55%' }}/>
                    <col style={{ width: '20%' }}/>
                </colgroup>
                <TableBody>
                    { data.map(row =>
                        <TableRow key={row.id} className={row.resolved ? classes.resolved : undefined}>
                            <CustomTableCell>
                                {row.sourceName}
                            </CustomTableCell>
                            <CustomTableCell>
                                {row.author}
                            </CustomTableCell>
                            <CustomTableCell>
                                <div className='htmlContent' dangerouslySetInnerHTML={{ __html: row.text }}/>
                            </CustomTableCell>
                            <CustomTableCell>
                                <Tooltip title="Open Comment" placement="bottom-end" enterDelay={700}>
                                    <IconButton onClick={this.openComments(row.id)} className={classes.icon}>
                                        <CommentIcon/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Go to source" placement="bottom-end" enterDelay={700}>
                                    <IconButton onClick={this.goToSource(panelId, row.parentItemOid)} className={classes.icon}>
                                        <GoToSourceIcon/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={row.resolved ? 'Unresolve' : 'Resolve'} placement="bottom-end" enterDelay={700}>
                                    <IconButton onClick={this.toggleResolve(row.id)} className={classes.icon}>
                                        {row.resolved ? <FaTimes/> : <FaCheck/>}
                                    </IconButton>
                                </Tooltip>
                            </CustomTableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        );
    }

    getPanelStats = (data) => {
        let result = { count: 0, resolvedCount: 0 };
        result.count = Object.keys(data).length;
        result.resolvedCount = Object.values(data).filter(comment => (comment.resolved)).length;
        return result;
    }

    render () {
        const { classes, reviewComments, mdv, showResolved } = this.props;
        return (
            <div className={classes.root}>
                <Grid container spacing={8}>
                    <Grid item xs={6}>
                        <Typography variant="h4" color='textSecondary' inline>
                            Review Comments
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            variant='contained'
                            color='default'
                            className={classes.button}
                            onClick={ this.toggleShowResolved }
                        >
                            {`${showResolved ? 'Hide' : 'Show'} resolved`}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        { panels.map(panelId => {
                            let data = this.getReviewCommentData(reviewComments, panelId, showResolved, mdv);
                            let panelStats = this.getPanelStats(data);
                            return (
                                <ExpansionPanel
                                    key={panelId}
                                    expanded={this.props.panelStatus[panelId] === true && panelStats.count > 0}
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
                                        {this.getTable(data, panelId)}
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
    author: PropTypes.string.isRequired,
    openModal: PropTypes.func.isRequired,
    selectGroup: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
    toggleResolveComment: PropTypes.func.isRequired,
    toggleReviewCommentPanel: PropTypes.func.isRequired,
    toggleReviewCommentShowResolved: PropTypes.func.isRequired,
};
ConnectedReviewCommentTab.displayName = 'ReviewCommentTab';

const ReviewCommentTab = connect(mapStateToProps, mapDispatchToProps)(ConnectedReviewCommentTab);
export default withStyles(styles)(ReviewCommentTab);
