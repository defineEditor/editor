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
import { ipcRenderer } from 'electron';
import { withStyles } from '@material-ui/core/styles';
import { sanitize } from 'dompurify';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import { FaArrowCircleRight as GoToSourceIcon, FaCheck, FaTimes } from 'react-icons/fa';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
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
    toggleReviewCommentPanels,
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
    searchInput: {
        paddingTop: '9px',
        paddingBottom: '9px',
    },
    searchLabel: {
        transform: 'translate(10px, 10px)',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        openModal: (updateObj) => dispatch(openModal(updateObj)),
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
        changeTab: (updateObj) => dispatch(changeTab(updateObj)),
        toggleResolveComment: (updateObj) => dispatch(toggleResolveComment(updateObj)),
        toggleReviewCommentPanels: (updateObj) => dispatch(toggleReviewCommentPanels(updateObj)),
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

        this.searchFieldRef = React.createRef();
        // Expanded is true unless all panels are expanded
        let expandedToggled = !panels.some(panelId => (props.panelStatus[panelId] === false));

        this.state = {
            expandedToggled,
            searchString: '',
        };
    }

    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
        setScrollPosition(this.props.tabs);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 70)) {
            this.searchFieldRef.current.focus();
        }
    }

    onSearchKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.setState({ searchString: event.target.value });
        }
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        // If all panels are got closed/opened change the expandedToggle status;
        let allAreClosed = !panels.reduce((accStatus, panelId) => (accStatus || Boolean(nextProps.panelStatus[panelId])), false);
        let allAreOpened = panels.reduce((accStatus, panelId) => (accStatus && Boolean(nextProps.panelStatus[panelId])), true);
        if ((prevState.expandedToggled === true && allAreOpened) ||
            (prevState.expandedToggled === false && allAreClosed)
        ) {
            return ({ expandedToggled: !prevState.expandedToggled });
        } else {
            return null;
        }
    }

    handleChange = (panelId) => () => {
        this.props.toggleReviewCommentPanels({ panelIds: [panelId] });
    }

    toggleShowResolved = () => {
        this.props.toggleReviewCommentShowResolved();
    }

    toggleExpand = () => {
        this.props.toggleReviewCommentPanels({ panelIds: panels, status: this.state.expandedToggled });
        this.setState({ expandedToggled: !this.state.expandedToggled });
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

    exportReviewComments = () => {
        // Prepare data for the export
        const { reviewComments, mdv } = this.props;
        let exportData = {};
        panels.forEach(panelId => {
            let data = this.getReviewCommentData(reviewComments, panelId, true, mdv, undefined, true);
            let panelStats = this.getPanelStats(data);
            exportData[panelId] = { data, panelStats };
        });
        ipcRenderer.send('exportReviewComments', exportData);
    }

    getReviewCommentData = (reviewComments, panelId, showResolved, mdv, searchString, extendedFormat) => {
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
            let commentData = {};
            if (extendedFormat) {
                commentData = { ...reviewComment };
            } else {
                commentData = {
                    id: id,
                    text: sanitize(reviewComment.text),
                    resolved: false,
                    author: reviewComment.author,
                };
            }
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
            let sourceParts = [];
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
                sourceParts.push(sourceName);
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
                            const resultDisplays = mdv.analysisResultDisplays.resultDisplays;
                            if (analysisResult.sources &&
                                analysisResult.sources.resultDisplays &&
                                analysisResult.sources.resultDisplays.length > 0 &&
                                resultDisplays.hasOwnProperty(analysisResult.sources.resultDisplays[0])
                            ) {
                                const resultDisplay = resultDisplays[analysisResult.sources.resultDisplays[0]];
                                commentData.parentItemOid = resultDisplay.oid;
                                if (resultDisplay) {
                                    sourceName = `${resultDisplay.name} ${sourceName}`;
                                    sourceParts = [resultDisplay.name, sourceName];
                                }
                            }
                        } else {
                            sourceName = mdv.analysisResultDisplays[sourceId][sourceValue].name;
                            sourceParts.push(sourceName);
                        }
                    }
                } else {
                    if (sourceId && mdv[sourceId] && mdv[sourceId].hasOwnProperty(sourceValue)) {
                        if (sourceId === 'itemDefs') {
                            const variableName = mdv[sourceId][sourceValue].name;
                            sourceName = '';
                            // Get the dataset name or the VLM name
                            const itemDef = mdv[sourceId][sourceValue];
                            if (itemDef.parentItemDefOid && mdv.itemDefs.hasOwnProperty(itemDef.parentItemDefOid)) {
                                // VLM
                                const parentItemDef = mdv.itemDefs[itemDef.parentItemDefOid];
                                const itemGroupOids = parentItemDef.sources && parentItemDef.sources.itemGroups && parentItemDef.sources.itemGroups;
                                itemGroupOids.forEach(itemGroupOid => {
                                    commentData.parentItemOid = itemGroupOid;
                                    if (itemGroupOid && mdv.itemGroups.hasOwnProperty(itemGroupOid)) {
                                        sourceName = `${sourceName} ${mdv.itemGroups[itemGroupOid].name}.${parentItemDef.name}.${variableName}`;
                                        sourceParts = sourceParts.concat([mdv.itemGroups[itemGroupOid].name, parentItemDef.name, variableName]);
                                    }
                                });
                            } else {
                                const itemGroupOids = itemDef.sources && itemDef.sources.itemGroups && itemDef.sources.itemGroups;
                                itemGroupOids.forEach(itemGroupOid => {
                                    commentData.parentItemOid = itemGroupOid;
                                    if (itemGroupOid && mdv.itemGroups.hasOwnProperty(itemGroupOid)) {
                                        sourceName = `${sourceName} ${mdv.itemGroups[itemGroupOid].name}.${variableName}`;
                                        sourceParts = sourceParts.concat([mdv.itemGroups[itemGroupOid].name, variableName, '']);
                                    }
                                });
                            }
                        } else {
                            sourceName = mdv[sourceId][sourceValue].name;
                            sourceParts.push(sourceName);
                        }
                    }
                }
            }
            commentData.sourceName = sourceName.trim();
            if (extendedFormat) {
                commentData.sourceParts = sourceParts;
            }
            if (searchString) {
                // If search string contains capital cases, use case-sensitive search
                const caseSensitiveSearch = /[A-Z]/.test(searchString);
                // Go through each text item and search for the corresponding text, exlude ID items
                const matched = Object.keys(commentData)
                    .filter(item => (!['id'].includes(item)))
                    .some(item => {
                        if (caseSensitiveSearch) {
                            return typeof commentData[item] === 'string' && commentData[item].includes(searchString);
                        } else {
                            return typeof commentData[item] === 'string' && commentData[item].toLowerCase().includes(searchString);
                        }
                    });
                if (!matched) {
                    return;
                }
            }
            results.push(commentData);
        });

        return results;
    };

    getPanelStats = (data) => {
        let result = { count: 0, resolvedCount: 0 };
        result.count = Object.keys(data).length;
        result.resolvedCount = Object.values(data).filter(comment => (comment.resolved)).length;
        return result;
    };

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

    render () {
        const { classes, reviewComments, mdv, showResolved } = this.props;
        return (
            <div className={classes.root}>
                <Grid container spacing={8} justify='space-between'>
                    <Grid item>
                        <Typography variant="h4" color='textSecondary' inline>
                            Review Comments
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Grid container spacing={16} justify='flex-end'>
                            <Grid item>
                                <TextField
                                    variant='outlined'
                                    label='Search'
                                    placeholder='Ctrl+F'
                                    inputRef={this.searchFieldRef}
                                    inputProps={{ className: classes.searchInput }}
                                    InputLabelProps={{ className: classes.searchLabel, shrink: true }}
                                    defaultValue={this.state.searchString}
                                    onKeyDown={this.onSearchKeyDown}
                                    onBlur={(event) => { this.setState({ searchString: event.target.value }); }}
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    variant='contained'
                                    onClick={ this.exportReviewComments }
                                >
                                    Export
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant='contained'
                                    color={showResolved ? 'default' : 'primary'}
                                    onClick={ this.toggleShowResolved }
                                >
                                    {`${showResolved ? 'Hide' : 'Show'} resolved`}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant='contained'
                                    color='default'
                                    onClick={this.toggleExpand}
                                >
                                    {`${this.state.expandedToggled ? 'Expand' : 'Collapse'} all`}
                                    {this.state.expandedToggled ? <ExpandMoreIcon style={{ marginLeft: '7px' }}/> : <ExpandLessIcon style={{ marginLeft: '7px' }}/>}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        { panels.map(panelId => {
                            let data = this.getReviewCommentData(reviewComments, panelId, showResolved, mdv, this.state.searchString);
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
    toggleReviewCommentPanels: PropTypes.func.isRequired,
    toggleReviewCommentShowResolved: PropTypes.func.isRequired,
};
ConnectedReviewCommentTab.displayName = 'ReviewCommentTab';

const ReviewCommentTab = connect(mapStateToProps, mapDispatchToProps)(ConnectedReviewCommentTab);
export default withStyles(styles)(ReviewCommentTab);
