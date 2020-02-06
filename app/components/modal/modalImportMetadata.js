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

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { clipboard } from 'electron';
import csv2json from 'csvtojson';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { FaRegCopy as CopyIcon, FaRegClipboard as PasteIcon } from 'react-icons/fa';
import LoadFromXpt from 'components/utils/loadFromXpt.js';
import {
    closeModal,
    openSnackbar,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    dialog: {
        position: 'absolute',
        top: '5%',
        maxWidth: 10000,
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
        letterSpacing: '0.0075em',
    },
    formatLabel: {
        display: 'none',
        marginLeft: theme.spacing(1),
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    loadLabel: {
        display: 'none',
        marginLeft: theme.spacing(4),
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    content: {
        padding: 0,
    },
    mainContent: {
        padding: '8px 24px',
    },
    layoutSelect: {
        marginLeft: theme.spacing(1),
        width: 80,
    },
    button: {
        marginLeft: theme.spacing(1),
    },
    clipboardIcon: {
        color: '#E0E0E0',
        marginLeft: theme.spacing(1),
    },
    grow: {
        flexGrow: 1,
    },
    color: {
        color: '#E0E0E0',
    },
    select: {
        marginTop: 2,
        fontSize: 20,
    },
}));

const json2csv = (json, delimiter) => {
    let attrs = Object.keys(json[0]);
    let result = [attrs.join(delimiter)];
    json.forEach(obs => {
        // Escape values with delimiters
        result.push(Object.values(obs)
            .map(value => {
                if (value.includes(delimiter)) {
                    return '"' + value.replace('"', '""') + '"';
                } else {
                    return value;
                }
            })
            .join(delimiter)
        );
    });
    return result.join('\n');
};

const convertLayout = async (data, layout, newLayout) => {
    try {
        if (['csv', 'excel'].includes(layout)) {
            const delimiter = layout === 'csv' ? ',' : '\t';
            const jsonData = await csv2json({ delimiter }).fromString(data);
            if (newLayout === 'table') {
                return jsonData;
            } else {
                const newDelimiter = newLayout === 'csv' ? ',' : '\t';
                return json2csv(jsonData, newDelimiter);
            }
        } else if (layout === 'table') {
            const newDelimiter = newLayout === 'csv' ? ',' : '\t';
            return json2csv(data, newDelimiter);
        }
    } catch (error) {
        return false;
    }
};

const ModalImportMetadata = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();

    const [varData, setVarData] = useState('');
    const [dsData, setDsData] = useState('');
    const [codedValueData, setCodedValueData] = useState('');
    const [showXptLoad, setShowXptLoad] = useState(false);

    const handleClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const handleChange = (event) => {
        setVarData(event.target.value);
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            handleClose();
        }
    };

    const importMetadata = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const handleXptFinish = async (varData, dsData, codedValueData) => {
        setShowXptLoad(false);
        if (layout !== 'csv') {
            setVarData(await convertLayout(varData, 'csv', layout));
            setDsData(await convertLayout(dsData, 'csv', layout));
            setCodedValueData(await convertLayout(codedValueData, 'csv', layout));
        } else {
            setVarData(varData);
            setDsData(dsData);
            setCodedValueData(codedValueData);
        }
    };

    const copyToClipboard = () => {
        if (layout === 'table') {
            clipboard.writeText(JSON.toString(varData));
        } else {
            clipboard.writeText(varData);
        }
    };

    const pasteFromClipboard = () => {
        // Remove all blank lines
        if (layout !== 'table') {
            let data = clipboard.readText();
            let delimiter = layout === 'csv' ? ',' : '\t';
            // Get number of attributes
            let attNum = (data.slice(0, data.indexOf('\n')).match(new RegExp(delimiter, 'g')) || []).length;
            data = data.replace(new RegExp(`^${delimiter}{${attNum}}$`, 'gm'), '');
            // Remove newlines at the end
            data = data.replace(/\n*$/, '');
            setVarData(data);
        } else {
            setVarData(clipboard.readText());
        }
    };

    const [layout, setLayout] = useState('excel');
    const handleLayout = async (event) => {
        let data = [dsData, varData, codedValueData];
        let convertedData = [];
        let conversionFailed = false;
        let newLayout = event.target.value;
        for (let index = 0; index < data.length; index++) {
            let currentData = data[index];
            if (
                (typeof currentData === 'string' && currentData.length > 0) ||
                (typeof currentData === 'object' && Object.keys(currentData).length > 0)
            ) {
                // Data is not blank
                let newData = await convertLayout(varData, layout, newLayout);
                if (newData === false) {
                    conversionFailed = true;
                } else {
                    convertedData.push(newData);
                }
            } else {
                // Data is blank
                convertedData.push(newLayout === 'table' ? [] : '');
            }
        }
        // Check if any of the data tabs failed during conversion
        if (conversionFailed) {
            dispatch(
                openSnackbar({
                    type: 'error',
                    message: 'Invalid data',
                })
            );
        } else {
            let setters = [setDsData, setVarData, setCodedValueData];
            convertedData.forEach((convData, index) => {
                setters[index](convData);
            });
            setLayout(newLayout);
        }
    };

    let placeholder = 'dataset,variable,length,...\nADSL,AVAL,20,...\nADSL,AVAL.AST,8,...';
    if (layout !== 'csv') {
        placeholder = placeholder.replace(/,/g, '\t');
    }

    return (
        <React.Fragment>
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                PaperProps={{ className: classes.dialog }}
                onKeyDown={onKeyDown}
                tabIndex='0'
            >
                <DialogTitle className={classes.title} disableTypography>
                    Import Metadata
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <AppBar position="static">
                        <Toolbar variant="dense">
                            <Typography className={classes.formatLabel} variant="h6" noWrap>
                                Format:
                            </Typography>
                            <TextField
                                value={layout}
                                onChange={handleLayout}
                                className={classes.layoutSelect}
                                select
                                margin='dense'
                                InputProps={{
                                    disableUnderline: true,
                                }}
                                SelectProps={{
                                    className: classes.select,
                                    classes: {
                                        icon: classes.color,
                                        select: classes.color,
                                        root: classes.color,
                                    },
                                }}
                            >
                                <MenuItem key='csv' value={'csv'}>CSV</MenuItem>
                                <MenuItem key='excel' value={'excel'}>Excel</MenuItem>
                                <MenuItem key='table' value={'table'}>Table</MenuItem>
                            </TextField>
                            <Typography className={classes.loadLabel} variant="h6" noWrap>
                                Load From:
                            </Typography>
                            <Button
                                variant='contained'
                                onClick={() => { setShowXptLoad(true); }}
                                color='default'
                                className={classes.button}
                            >
                                XPT
                            </Button>
                            <div className={classes.grow} />
                            <Tooltip
                                title='Copy to clipboard'
                                placement='bottom'
                                enterDelay={700}
                            >
                                <IconButton
                                    onClick={copyToClipboard}
                                    className={classes.clipboardIcon}
                                >
                                    <CopyIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title='Paste from clipboard'
                                placement='bottom'
                                enterDelay={700}
                            >
                                <IconButton
                                    onClick={pasteFromClipboard}
                                    className={classes.clipboardIcon}
                                >
                                    <PasteIcon/>
                                </IconButton>
                            </Tooltip>
                        </Toolbar>
                    </AppBar>
                    <Grid container alignItems='flex-start' className={classes.mainContent}>
                        <Grid item xs={12}>
                            <TextField
                                multiline
                                fullWidth
                                value={varData}
                                placeholder={placeholder}
                                onChange={handleChange}
                                InputProps={{
                                    disableUnderline: true,
                                    classes: {
                                        root: classes.textFieldRoot,
                                        input: classes.textFieldInput,
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={importMetadata} color="primary">
                        Import
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            { showXptLoad &&
                    <LoadFromXpt onClose={() => { setShowXptLoad(false); }} onFinish={handleXptFinish}/>
            }
        </React.Fragment>
    );
};

export default ModalImportMetadata;
