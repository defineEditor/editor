/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2021 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import clone from 'clone';
import { ipcRenderer } from 'electron';
import { makeStyles, withStyles, lighten } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import getItemsFromFilter from 'utils/getItemsFromFilter.js';
import getItemNamesFromOid from 'utils/getItemNamesFromOid.js';
import StudySearchResultsTable from 'components/utils/studySearchResultsTable.js';
import recreateDefine from 'utils/recreateDefine.js';
import {
    openModal,
    openSnackbar,
    closeModal,
    updateSearchInfo,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    dialog: {
        position: 'absolute',
        top: '5%',
        maxWidth: 1000,
        height: '90%',
        width: '95%',
        overflowX: 'auto',
        overflowY: 'auto',
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        display: 'flex',
    },
    title: {
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1.25rem',
        lineHeight: '1.6',
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        letterSpacing: '0.0075em',
    },
    content: {
        display: 'flex',
    },
    list: {
        width: '100%',
    },
    centerTitle: {
        textAlign: 'center',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    mainGrid: {
        height: 'fit-content',
    },
}));

const types = ['study', 'define', 'dataset', 'variable', 'codeList', 'codedValue', 'resultDisplay', 'analysisResult'];

const getFullStack = (studies, selectedItems) => {
    let result = [];
    studies.allIds
        .filter(studyId => {
            if (Array.isArray(selectedItems.study)) {
                // If study filter is used
                if (selectedItems.study.includes(studyId)) {
                    return true;
                }
            } else {
                // No filter
                return true;
            }
        })
        .forEach(studyId => {
            studies.byId[studyId].defineIds
                .filter(studyId => {
                    if (Array.isArray(selectedItems.define)) {
                        // If define filter is used
                        if (selectedItems.define.includes(studyId)) {
                            return true;
                        }
                    } else {
                        // No filter
                        return true;
                    }
                })
                .forEach(defineId => {
                    result.push(defineId);
                });
        });
    return result;
    // return result.slice(1, 4);
};

const UpdatedLinearProgress = withStyles({
    root: {
        height: 25,
        backgroundColor: lighten('#3f51b5', 0.5),
        borderRadius: 5,
    },
    bar: {
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
})(LinearProgress);

const ModalSearchStudies = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();
    let filters = useSelector(state => state.present.ui.studies.filters);
    let studies = useSelector(state => state.present.studies);
    let defines = useSelector(state => state.present.defines);
    let searchInfo = useSelector(state => state.present.sessionData.searchInfo);
    let searchStack = useRef([]);
    let searchResults = useRef({});
    let totalDefines = useRef(0);
    const [status, setStatus] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [matchedStudies, setMatchedStudies] = useState({ studies: [], defines: {} });

    const handleSearch = (event, data) => {
        let result = {};
        // When Define-XML was generated using a previous version of VDE it needs to be created to avoid errors during the search
        const appVersion = process.argv.filter(arg => arg.startsWith('--vdeVersion')).map(arg => arg.replace(/.*:\s*(.*)/, '$1'))[0];
        const appMode = process.argv.filter(arg => arg.startsWith('--vdeMode')).map(arg => arg.replace(/.*:\s*(.*)/, '$1'))[0];
        if (
            data.info === undefined ||
            (data.info !== undefined && (data.info.appVersion !== appVersion || appMode === 'DEV'))
        ) {
            data.odm = recreateDefine(data.odm);
        }
        if (data.odm && data.odm.study && data.odm.study.metaDataVersion) {
            try {
                const mdv = data.odm.study.metaDataVersion;
                Object.values(filters).filter(filter => filter.isEnabled && !['study', 'define'].includes(filter.type)).forEach(filter => {
                    let items = getItemsFromFilter(filter, mdv, mdv.defineVersion);
                    if (items.length > 0) {
                        result[filter.type] = getItemNamesFromOid(filter.type, items, mdv);
                    }
                });
                if (Object.keys(result).length > 0) {
                    searchResults.current[data.odm.defineId] = result;
                }
            } catch (error) {
                dispatch(openSnackbar({ type: 'error', message: 'Error when searching in ' + defines.byId[data.odm.defineId].name }));
            }
        }
        searchNext();
    };

    const searchNext = () => {
        if (searchStack.current.length === 0) {
            // Search has ended;
            setProgressValue(0);
            setStatus(false);
            return;
        }
        let defineId = searchStack.current.shift();
        setProgressValue((totalDefines.current - Object.keys(searchStack.current).length) / totalDefines.current * 100);
        ipcRenderer.once('loadDefineObjectForSearch', handleSearch);
        ipcRenderer.send('loadDefineObject', defineId, 'search');
    };

    const onClose = (event, selectedItem) => {
        dispatch(updateSearchInfo({
            matchedStudies,
            selectedItem
        }));
        dispatch(closeModal({ type: props.type }));
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            onClose();
        }
    };

    const openFilter = (type) => {
        dispatch(openModal({
            type: 'FILTER',
            props: {
                source: 'studies',
                filterType: type,
            }
        }));
    };

    const onSearch = () => {
        setStatus(true);
        searchResults.current = {};
        setMatchedStudies({ studies: [], defines: {} });
        let selectedItems = {};
        if (filters.study.isEnabled === true) {
            selectedItems.study = getItemsFromFilter(filters.study, undefined, undefined, studies, defines);
        }
        if (filters.define.isEnabled === true) {
            selectedItems.define = getItemsFromFilter(filters.define, undefined, undefined, studies, defines);
        }
        searchStack.current = getFullStack(studies, selectedItems);
        totalDefines.current = Object.keys(searchStack.current).length;
        searchNext();
    };

    const clearResult = () => {
        searchResults.current = {};
        searchStack = [];
        totalDefines = 0;
        setMatchedStudies({ studies: [], defines: {} });
    };

    useEffect(() => {
        if (status === false) {
            // Format data
            const results = clone(searchResults.current);
            const matchedDefines = Object.keys(results);
            const newMatchedStudies = [];
            // Get study and define names
            // Get connection between defines and studies
            studies.allIds.forEach(studyId => {
                let matchedStudyDefines = [];
                studies.byId[studyId].defineIds.forEach(defineId => {
                    if (matchedDefines.includes(defineId)) {
                        matchedStudyDefines.push({ id: defineId, name: defines.byId[defineId].name });
                    }
                });
                if (matchedStudyDefines.length > 0) {
                    newMatchedStudies.push({ id: studyId, name: studies.byId[studyId].name, defines: matchedStudyDefines });
                }
            });
            setMatchedStudies({ studies: newMatchedStudies, defines: results });
        }
    }, [status, defines, studies]);

    useEffect(() => {
        // Check if search results are present in session data
        if (searchInfo && searchInfo.matchedStudies) {
            // In case some studies or defines were removed, reset these results
            let isStudyMissing = searchInfo.matchedStudies.studies.some(study => !studies.allIds.includes(study.id));
            let isDefineMissing = Object.keys(searchInfo.matchedStudies.defines).some(defineId => !defines.allIds.includes(defineId));
            if (isStudyMissing || isDefineMissing) {
                // Reset search info
                dispatch(updateSearchInfo({}));
            } else {
                setMatchedStudies(searchInfo.matchedStudies);
            }
        }
    }, [studies, defines, dispatch, searchInfo]);

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open
            PaperProps={{ className: classes.dialog }}
            onKeyDown={onKeyDown}
            tabIndex='0'
        >
            <DialogTitle className={classes.title} disableTypography>
                Search Studies
            </DialogTitle>
            <DialogContent className={classes.content}>
                <Grid container alignItems='flex-start' className={classes.mainGrid}>
                    <Grid item xs={12}>
                        <Typography variant="h4" className={classes.centerTitle}>
                            Filters
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container justify='space-around'>
                            { types.map(curType => (
                                <Grid item key={curType}>
                                    <Button
                                        color={filters[curType].isEnabled ? 'primary' : 'default'}
                                        variant='contained'
                                        onClick={() => openFilter(curType)}
                                        className={classes.button}
                                    >
                                        {curType}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        {status && (
                            <React.Fragment>
                                <Typography variant="h4" className={classes.centerTitle}>
                                    Searching
                                </Typography>
                                <Box display="flex" alignItems="center">
                                    <Box width="100%" mr={1}>
                                        <UpdatedLinearProgress key='progressBar' variant='determinate' value={progressValue} className={classes.progressBar}/>
                                    </Box>
                                    <Box minWidth={35}>
                                        <Typography variant="body2" color="textSecondary">
                                            {`${Math.round(progressValue)}%`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </React.Fragment>
                        )}
                        {!status && (
                            matchedStudies.studies.length > 0 ? (
                                <React.Fragment>
                                    <Typography variant="h5" className={classes.centerTitle}>
                                        Found matches in {matchedStudies.studies.length} studies
                                    </Typography>
                                    <StudySearchResultsTable
                                        matchedStudies={matchedStudies}
                                        handleClose={onClose}
                                        handleClear={clearResult}
                                    />
                                </React.Fragment>
                            ) : (
                                <Typography variant="h5" className={classes.centerTitle}>
                                    No results found
                                </Typography>
                            )
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onSearch} disabled={!Object.values(filters).some(filter => filter.isEnabled === true)} color="primary">
                    Search
                </Button>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ModalSearchStudies.propTypes = {
    type: PropTypes.string.isRequired,
};

export default ModalSearchStudies;
