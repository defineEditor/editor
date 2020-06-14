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

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { shell } from 'electron';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import ReactMarkdown from 'react-markdown';
import { closeModal } from 'actions/index.js';

const useModalStyles = makeStyles(theme => ({
    dialog: {
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        top: '10%',
        width: '55%',
        overflowX: 'auto',
        maxHeight: '85%',
        overflowY: 'auto',
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

const ModalHelp = (props) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({ content: '', reactMarkdownOptions: {} });

    const classes = useModalStyles();

    const onClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const onClick = (event) => {
        if (event.target.tagName === 'A' || event.target.href) {
            event.preventDefault();
            shell.openExternal(event.target.href);
        }
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            event.stopPropagation();
            onClose();
        }
    };

    useEffect(() => {
        const getHelp = async () => {
            let allHelp = await import('constants/help.js');
            setData(allHelp[props.id]);
            setOpen(true);
        };

        getHelp();
    }, [props.id]);

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            aria-labelledby="modal-dialog-title"
            aria-describedby="modal-dialog-description"
            open={open}
            fullWidth
            maxWidth={false}
            PaperProps={{ className: classes.dialog }}
            onKeyDown={onKeyDown}
            onClick={onClick}
            tabIndex='0'
        >
            <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                {data.title}
            </DialogTitle>
            <DialogContent>
                <ReactMarkdown source={data.content} escapeHtml={false} {...data.reactMarkdownOptions}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ModalHelp.propTypes = {
    id: PropTypes.string.isRequired,
};

export default ModalHelp;
