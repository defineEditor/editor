/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2020 Dmitry Kolosov                                                *
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
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TuneIcon from '@material-ui/icons/Tune';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
    updateMainUi,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    dialog: {
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        top: '10%',
        transform: 'translate(0%, calc(-10%+0.5px))',
        overflowX: 'auto',
        maxHeight: '85%',
        overflowY: 'auto',
        width: '500px',
    },
    title: {
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1.25rem',
        lineHeight: '1.6',
        letterSpacing: '0.0075em',
    },
    clipboardIcon: {
        color: '#E0E0E0',
        marginLeft: theme.spacing(1),
    },
}));

const ImportMetadataOptions = (props) => {
    const dispatch = useDispatch();
    const classes = getStyles();
    const [open, setOpen] = React.useState(false);
    const options = useSelector(state => state.present.ui.main.metadataImportOptions);
    const { ignoreBlanks, removeMissingCodedValues } = options;

    const toggleOption = (option) => (event) => {
        dispatch(updateMainUi({
            metadataImportOptions: {
                ...options,
                [option]: !options[option]
            }
        }));
    };

    const handleOpen = event => {
        setOpen(true);
    };

    const handleClose = event => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <IconButton
                onClick={handleOpen}
                className={classes.clipboardIcon}
            >
                <TuneIcon/>
            </IconButton>
            <Dialog
                open={open}
                PaperProps={{ className: classes.dialog }}
                onClose={handleClose}
            >
                <DialogTitle className={classes.title} disableTypography>
                    Metadata Import Options
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormGroup>
                                    <FormControlLabel
                                        key='existing'
                                        control={
                                            <Switch
                                                checked={ignoreBlanks}
                                                onChange={toggleOption('ignoreBlanks')}
                                                value={ignoreBlanks}
                                                color='primary'
                                            />
                                        }
                                        label='Ignore Blank Values'
                                    />
                                    <FormControlLabel
                                        key='codeList'
                                        control={
                                            <Switch
                                                checked={removeMissingCodedValues}
                                                onChange={toggleOption('removeMissingCodedValues')}
                                                value={removeMissingCodedValues}
                                                color='primary'
                                            />
                                        }
                                        label='Remove code values not in listed in the import'
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default ImportMetadataOptions;
