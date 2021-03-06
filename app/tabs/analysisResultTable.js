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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Prism from 'prismjs';
import path from 'path';
import store from 'store/index.js';
import { ipcRenderer } from 'electron';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import CommentIcon from '@material-ui/icons/Comment';
import ArchiveIcon from '@material-ui/icons/Archive';
import Fab from '@material-ui/core/Fab';
import grey from '@material-ui/core/colors/grey';
import { withStyles } from '@material-ui/core/styles';
import OpenDrawer from '@material-ui/icons/VerticalSplit';
import AnalysisResultOrderEditor from 'components/orderEditors/analysisResultOrderEditor.js';
import AnalysisResultTile from 'components/utils/analysisResultTile.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import {
    addAnalysisResult,
    openModal,
} from 'actions/index.js';

const styles = theme => ({
    buttonGroup: {
        marginLeft: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(1),
    },
    chip: {
        verticalAlign: 'top',
        marginLeft: theme.spacing(1),
    },
    drawerButton: {
        marginLeft: theme.spacing(2),
    },
    commentIcon: {
        transform: 'translate(0, -5%)',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addAnalysisResult: (updateObj) => dispatch(addAnalysisResult(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        resultDisplays: state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplays,
        tabSettings: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab],
        reviewMode: state.present.ui.main.reviewMode,
        leafs: state.present.odm.study.metaDataVersion.leafs,
    };
};

const openPdf = (event) => {
    event.preventDefault();
    const state = store.getState();
    const pathToDefine = state.present.defines.byId[state.present.odm.defineId].pathToFile || '';
    const pdfViewer = state.present.settings.general.pdfViewer;
    ipcRenderer.send('openDocument', path.dirname(pathToDefine), event.target.attributes[0].value, { pdfViewer });
};

class ConnectedAnalysisResultTable extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            resultDisplayOid: this.props.resultDisplayOid,
            setScrollY: false,
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        let stateUpdate = {};
        // Store previous groupOid in state so it can be compared with when props change
        if (nextProps.resultDisplayOid !== prevState.resultDisplayOid) {
            stateUpdate.resultDisplayOid = nextProps.resultDisplayOid;
            stateUpdate.setScrollY = true;
            return ({ ...stateUpdate });
        } else {
            return null;
        }
    }

    setScroll () {
        // Restore previous tab scroll position for a specific dataset
        let tabSettings = this.props.tabSettings;
        if (tabSettings.scrollPosition[this.props.resultDisplayOid] !== undefined) {
            window.scrollTo(0, tabSettings.scrollPosition[this.props.resultDisplayOid]);
        } else {
            window.scrollTo(0, 0);
        }
    }

    componentDidUpdate () {
        if (this.state.setScrollY) {
            this.setScroll();
            this.setState({ setScrollY: false });
        }
    }

    componentDidMount () {
        this.setScroll();
        window.addEventListener('keydown', this.onKeyDown);
        Prism.highlightAll();
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (!this.props.reviewMode && event.ctrlKey && (event.keyCode === 78)) {
            this.addAnalysisResult();
        }
    }

    addAnalysisResult = (event) => {
        this.props.addAnalysisResult({ resultDisplayOid: this.props.resultDisplayOid });
    }

    openComments = () => {
        this.props.openModal({
            type: 'REVIEW_COMMENT',
            props: { sources: { 'resultDisplays': [this.props.resultDisplayOid] } }
        });
    };

    openImportMetadata = () => {
        this.props.openModal({
            type: 'IMPORT_METADATA',
            props: { tab: 'analysisResults' }
        });
    };

    render () {
        const { classes } = this.props;
        const resultDisplay = this.props.resultDisplays[this.props.resultDisplayOid];
        let resultDisplayTitle;
        if (resultDisplay.documents.length > 0) {
            // Add a link to the first document
            let doc = resultDisplay.documents[0];
            let leafs = this.props.leafs;
            let linkText = resultDisplay.name + ' ' + getDescription(resultDisplay);
            if (doc.pdfPageRefs.length === 0) {
                resultDisplayTitle = (<a href={leafs[doc.leafId].href} key={doc.leafId} onClick={openPdf}>{linkText}</a>);
            } else {
                let pdfPageRef = doc.pdfPageRefs[0];
                let firstLink;
                if (pdfPageRef.pageRefs !== undefined) {
                    // Keep the first link only
                    firstLink = pdfPageRef.pageRefs.split(' ')[0];
                } else if (pdfPageRef.firstPage !== undefined) {
                    firstLink = pdfPageRef.firstPage;
                }
                if (pdfPageRef.type === 'NamedDestination') {
                    resultDisplayTitle = (<a href={leafs[doc.leafId].href + '#' + firstLink} key={firstLink} onClick={openPdf}>{linkText}</a>);
                } else if (pdfPageRef.type === 'PhysicalRef') {
                    resultDisplayTitle = (<a href={leafs[doc.leafId].href + '#page=' + firstLink} key={firstLink} onClick={openPdf}>{linkText}</a>);
                }
            }
        } else {
            resultDisplayTitle = resultDisplay.name + ' ' + getDescription(resultDisplay);
        }

        let commentPresent = resultDisplay.reviewCommentOids !== undefined && resultDisplay.reviewCommentOids.length > 0;

        return (
            <React.Fragment>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Grid container alignItems='center' justify='flex-start' wrap='nowrap'>
                            <Grid>
                                <h3 style={{ marginTop: '20px', marginBottom: '10px', color: grey[600] }}>
                                    {resultDisplayTitle}
                                </h3>
                            </Grid>
                            <Grid>
                                <Fab
                                    size='small'
                                    color='default'
                                    onClick={this.props.openDrawer}
                                    className={this.props.classes.drawerButton}
                                >
                                    <OpenDrawer/>
                                </Fab>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2} alignItems='center'>
                            <Grid item>
                                <Button
                                    color='default'
                                    variant='contained'
                                    onClick={this.addAnalysisResult}
                                    className={classes.button}
                                    disabled={this.props.reviewMode}
                                >
                                    Add Analysis Result
                                </Button>
                            </Grid>
                            <Grid item>
                                <AnalysisResultOrderEditor resultDisplayOid={this.props.resultDisplayOid}/>
                            </Grid>
                            <Grid item>
                                <Tooltip title={'Review Comment'} placement='bottom' enterDelay={700}>
                                    <Fab
                                        size='small'
                                        color={ commentPresent ? 'primary' : 'default' }
                                        onClick={this.openComments}
                                        className={classes.commentIcon}
                                    >
                                        <CommentIcon/>
                                    </Fab>
                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <Tooltip title={'Import Metadata'} placement='bottom' enterDelay={700}>
                                    <Fab
                                        size='small'
                                        color='default'
                                        onClick={this.openImportMetadata}
                                        className={this.props.classes.fabIcon}
                                    >
                                        <ArchiveIcon/>
                                    </Fab>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        {resultDisplay.analysisResultOrder.map((analysisResultOid, index) => (
                            <AnalysisResultTile key={index} analysisResultOid={analysisResultOid} resultDisplayOid={this.props.resultDisplayOid}/>
                        ))}
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}

ConnectedAnalysisResultTable.propTypes = {
    resultDisplays: PropTypes.object.isRequired,
    resultDisplayOid: PropTypes.string.isRequired,
    leafs: PropTypes.object.isRequired,
    reviewMode: PropTypes.bool,
    openModal: PropTypes.func.isRequired,
};
ConnectedAnalysisResultTable.displayName = 'AnalysisResultTable';

const AnalysisResultTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedAnalysisResultTable);
export default withStyles(styles)(AnalysisResultTable);
