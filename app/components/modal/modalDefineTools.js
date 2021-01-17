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

import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import OpenInBrowser from '@material-ui/icons/OpenInBrowser';
import LeakRemove from '@material-ui/icons/LeakRemove';
import { getUpdatedDefineBeforeSave } from 'utils/getUpdatedDefineBeforeSave.js';
import {
    closeModal,
    openModal,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    dialog: {
        position: 'absolute',
        top: '15%',
        maxWidth: 700,
        height: '60%',
        width: '35%',
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
}));

const ModalDefineTools = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();
    let odm = useSelector(state => state.present.odm);

    const onClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const openWithStylesheet = (event) => {
        const updatedOdm = getUpdatedDefineBeforeSave(odm);
        ipcRenderer.send('openWithStylesheet', updatedOdm.odm);
        onClose();
    };

    const openRemoveDuplicate = (event, type) => {
        dispatch(openModal({ type: 'REMOVE_DUPLICATES', props: { itemType: type } }));
        onClose();
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            onClose();
        }
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
                Tools
            </DialogTitle>
            <DialogContent className={classes.content}>
                <List className={classes.list}>
                    <ListItem button key='stylesheetview' onClick={openWithStylesheet}>
                        <ListItemIcon>
                            <OpenInBrowser/>
                        </ListItemIcon>
                        <ListItemText primary='View with stylesheet' secondary='Render current Define-XML in a browser using a default stylesheet.'/>
                    </ListItem>
                    <ListItem button key='removeDuplicateComments' onClick={(event) => { openRemoveDuplicate(event, 'Comment'); }}>
                        <ListItemIcon>
                            <LeakRemove/>
                        </ListItemIcon>
                        <ListItemText primary='Remove Duplicate Comments' secondary='In Define-XML multiple items can reference the same comment. This functionality will find all repeating comments and unite them into one.'/>
                    </ListItem>
                    <ListItem button key='removeDuplicateMethods' onClick={(event) => { openRemoveDuplicate(event, 'Method'); }}>
                        <ListItemIcon>
                            <LeakRemove/>
                        </ListItemIcon>
                        <ListItemText primary='Remove Duplicate Methods' secondary='In Define-XML multiple variables can reference the same method. This functionality will find all repeating methods and unite them into one.'/>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ModalDefineTools.propTypes = {
    type: PropTypes.string.isRequired,
};

export default ModalDefineTools;
