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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
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
    },
    mainGrid: {
        height: 'fit-content',
    },
}));

const types = ['dataset', 'variable', 'codeList', 'codedValue', 'resultDisplay', 'analysisResult'];

const ModalSearchStudies = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();
    let filters = useSelector(state => state.present.ui.studies.filters);
    const [data, setData] = useState({});

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
        setData(data);
        onClose();
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
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onSearch} disabled={!Object.keys(filters).some(filter => filter.isEnabled === true)} color="primary">
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
