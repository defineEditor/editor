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

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import getItemsFromFilter from 'utils/getItemsFromFilter.js';
import {
    openModal,
    closeModal,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    dialog: {
        position: 'absolute',
        top: '5%',
        maxWidth: 1500,
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
        padding: 0,
        display: 'flex',
    },
    list: {
        width: '100%',
    },
    filterTitle: {
        textAlign: 'center',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    mainGrid: {
        height: 'fit-content',
    },
}));

const types = ['dataset', 'variable', 'codeList', 'codedValue', 'resultDisplay', 'analysisResult'];

const getFullStack = (studies) => {
    let result = [];
    studies.allIds.forEach(studyId => {
        studies.byId[studyId].defineIds.forEach(defineId => {
            result.push(defineId);
        });
    });
    return result.slice(1, 6);
};

const ModalSearchStudies = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();
    let filters = useSelector(state => state.present.ui.studies.filters);
    let studies = useSelector(state => state.present.studies);
    let searchStack = useRef([]);
    let searchResults = useRef({});
    const [status, setStatus] = useState(false);

    const handleSearch = (event, data) => {
        let result = {};
        if (data.odm && data.odm.study && data.odm.study.metaDataVersion) {
            Object.values(filters).filter(filter => filter.isEnabled).forEach(filter => {
                let items = getItemsFromFilter(filter, data.odm.study.metaDataVersion, data.odm.study.metaDataVersion.defineVersion);
                if (items.length > 0) {
                    result[filter.type] = items;
                    console.log(items);
                }
            });
            searchResults.current[data.odm.defineId] = result;
        }
        searchNext();
    };

    const searchNext = () => {
        if (searchStack.current.length === 0) {
            // Search has ended;
            setStatus(false);
            return;
        }
        let defineId = searchStack.current.shift();
        ipcRenderer.once('loadDefineObjectForSearch', handleSearch);
        ipcRenderer.send('loadDefineObject', defineId, 'search');
    };

    const onClose = () => {
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
        searchStack.current = getFullStack(studies);
        searchNext();
    };

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
                        <Typography variant="h4" className={classes.filterTitle}>
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
                        <Typography variant="h4" className={classes.filterTitle}>
                            {status ? 'Searching' : 'Finished Search'}
                        </Typography>
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
