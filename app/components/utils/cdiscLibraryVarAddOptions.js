/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

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
        width: '400px',
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
}));

const CdiscLibraryVarAddOptions = (props) => {
    const classes = getStyles();
    const [open, setOpen] = React.useState(false);
    const { copyCodelist, addOrigin, saveNote, addExisting } = props.options;

    const handleClick = (option) => (event) => {
        // Get the next dataType in the list
        props.toggleOption(option);
    };

    const handleOpen = event => {
        setOpen(true);
    };

    const handleClose = event => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button
                size='medium'
                variant='contained'
                key='optButton'
                color='default'
                onClick={handleOpen}
            >
                Options
            </Button>
            <Dialog
                open={open}
                PaperProps={{ className: classes.dialog }}
                onClose={handleClose}
            >
                <DialogTitle className={classes.title} disableTypography>
                    Options
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormGroup>
                                    <FormControlLabel
                                        key='codeList'
                                        control={
                                            <Switch
                                                checked={addExisting}
                                                onChange={handleClick('addExisting')}
                                                value={addExisting}
                                                color='primary'
                                            />
                                        }
                                        label='Allow to add existing variables'
                                    />
                                    <FormControlLabel
                                        key='codeList'
                                        control={
                                            <Switch
                                                checked={copyCodelist}
                                                onChange={handleClick('copyCodelist')}
                                                value={copyCodelist}
                                                color='primary'
                                            />
                                        }
                                        label='Add codelists'
                                    />
                                    <FormControlLabel
                                        key='origin'
                                        control={
                                            <Switch
                                                checked={addOrigin}
                                                onChange={handleClick('addOrigin')}
                                                value={addOrigin}
                                                color='primary'
                                            />
                                        }
                                        label='Add predeccessor origin'
                                    />
                                    <FormControlLabel
                                        key='comment'
                                        control={
                                            <Switch
                                                checked={saveNote}
                                                onChange={handleClick('saveNote')}
                                                value={saveNote}
                                                color='primary'
                                            />
                                        }
                                        label='Save CDISC description as programming note'
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};

CdiscLibraryVarAddOptions.propTypes = {
    options: PropTypes.object.isRequired,
    toggleOption: PropTypes.func.isRequired,
};

export default CdiscLibraryVarAddOptions;
