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
import csv2json from 'csvtojson';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import LoadFromXpt from 'components/utils/loadFromXpt.js';
import {
    closeModal,
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
    content: {
        padding: 0,
    },
    mainContent: {
        padding: '8px 24px',
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
    if (['comma', 'tab'].includes(layout)) {
        const delimiter = layout === 'comma' ? ',' : '\t';
        const jsonData = await csv2json({ delimiter }).fromString(data);
        if (newLayout === 'table') {
            return jsonData;
        } else {
            const newDelimiter = newLayout === 'comma' ? ',' : '\t';
            return json2csv(jsonData, newDelimiter);
        }
    }
};

const ModalImportMetadata = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();

    const [data, setData] = useState([]);
    const [showXptLoad, setShowXptLoad] = useState(false);

    const handleClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const handleChange = (event) => {
        setData(event.target.value);
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            handleClose();
        }
    };

    const importMetadata = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const handleXptFinish = (varData, datasetData) => {
        setData(varData);
        setShowXptLoad(false);
    };

    const [layout, setLayout] = useState('tab');
    const handleLayout = async (event) => {
        let newLayout = event.target.value;
        setLayout(newLayout);
        setData(await convertLayout(data, layout, newLayout));
    };

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
                            <Button
                                variant='contained'
                                onClick={() => { setShowXptLoad(true); }}
                                color='default'
                            >
                                Load from XPT
                            </Button>
                            <Select
                                value={layout}
                                onChange={handleLayout}
                            >
                                <MenuItem value={'comma'}>Comma</MenuItem>
                                <MenuItem value={'tab'}>Tab</MenuItem>
                                <MenuItem value={'table'}>Table</MenuItem>
                            </Select>
                        </Toolbar>
                    </AppBar>
                    <Grid container alignItems='flex-start' className={classes.mainContent}>
                        <Grid item xs={12}>
                            <TextField
                                multiline
                                fullWidth
                                value={data}
                                placeholder={'dataset,variable,length,...\nADSL,AVAL,20,...\nADSL,AVAL.AST,8,...'}
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
                    <Button onClick={importMetadata} color="primary" disabled={data.length <= 1}>
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
