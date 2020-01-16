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
import { ipcRenderer, shell } from 'electron';
import { sanitize } from 'dompurify';
import PropTypes from 'prop-types';
import { withStyles, makeStyles, lighten } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { closeModal } from 'actions/index.js';

const useModalStyles = makeStyles(theme => ({
    dialog: {
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        top: '40%',
        transform: 'translate(0%, calc(-50%+0.5px))',
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

const UpdatedLinearProgress = withStyles({
    root: {
        height: 10,
        backgroundColor: lighten('#3f51b5', 0.5),
        borderRadius: 30,
    },
    bar: {
        borderRadius: 30,
        backgroundColor: '#3f51b5',
    },
})(LinearProgress);

const openLink = (event) => {
    event.preventDefault();
    shell.openExternal(event.target.href);
};

const ModalUpdateApplication = (props) => {
    let releaseNotes = sanitize(props.releaseNotes);
    releaseNotes = releaseNotes.replace(/<a.*?>/g, '');
    releaseNotes = releaseNotes.replace(/<\/a.*?>/g, '');
    let version = props.version;
    version = version.replace('-current', '');
    const releaseNotesLink = 'http://defineeditor.com/releases/#version-' + version;

    const [downloadPct, setDownloadPct] = useState(null);

    useEffect(() => {
        const handleDownloadProgressUpdate = (event, progress) => {
            setDownloadPct(progress.percent);
        };

        ipcRenderer.on('updateDownloadProgress', handleDownloadProgressUpdate);
        // Specify how to clean up after this effect:
        return function cleanup () {
            ipcRenderer.removeListener('updateDownloadProgress', handleDownloadProgressUpdate);
        };
    }, []);

    const dispatch = useDispatch();

    const onClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const onUpdate = () => {
        setDownloadPct(0);
        ipcRenderer.send('downloadUpdate');
    };

    const onOpenLink = () => {
        shell.openExternal('http://defineeditor.com/downloads');
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            onClose();
        }
    };

    const classes = useModalStyles();

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            aria-labelledby="modal-dialog-title"
            aria-describedby="modal-dialog-description"
            open
            PaperProps={{ className: classes.dialog }}
            onKeyDown={onKeyDown}
            tabIndex='0'
        >
            <DialogTitle id="modal-dialog-title" className={classes.title} disableTypography>
                Visual Define-XML Editor v{version}
            </DialogTitle>
            <DialogContent>
                <div>
                    <a onClick={openLink} href={releaseNotesLink}>
                        Release notes
                    </a>
                </div>
                <div className='htmlContent' dangerouslySetInnerHTML={{ __html: releaseNotes }}/>
                <div>
                    Save all changes to your Define-XML before performing the update.
                </div>
                {downloadPct <= 1 && downloadPct !== null && <UpdatedLinearProgress/>}
                {downloadPct > 1 && <UpdatedLinearProgress variant='determinate' value={downloadPct} />}
            </DialogContent>
            <DialogActions>
                <Button onClick={onOpenLink} color="primary">
                    Open Downloads
                </Button>
                { process && process.platform === 'linux' && (
                    <Button onClick={onUpdate} color="primary" disabled={downloadPct !== null}>
                        Update
                    </Button>
                )}
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ModalUpdateApplication.propTypes = {
    releaseNotes: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
};

export default ModalUpdateApplication;
