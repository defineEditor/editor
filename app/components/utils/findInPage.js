/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
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
import { ipcRenderer } from 'electron';
import { MuiThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { IconButton, Tooltip, Grid, Divider, InputBase } from '@material-ui/core';
import {
    KeyboardArrowDown as PreviousIcon,
    KeyboardArrowUp as NextIcon,
    TextFormat as MatchCaseIcon,
    Clear as ClearIcon
} from '@material-ui/icons';

const baseTheme = createMuiTheme();

const getStyles = makeStyles(theme => ({
    button: {
        marginLeft: theme.spacing(2),
    },
    grid: {
        height: '50px',
        position: 'fixed',
        border: '2px solid #CCCCCC',
        width: '480px',
        backgroundImage: 'radial-gradient(#FFFFFF,#DDDDDD)',
        borderRadius: '15px',
    },
    input: {
        marginLeft: theme.spacing(1),
        width: 200,
    },
    count: {
        width: 50,
        textAlign: 'center',
        color: '#AAAAAA',
        fontFamily: 'monospace',
        fontSize: 'large',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
}));

const FindInPage = (props) => {
    const classes = getStyles();
    const [result, setResult] = useState({});
    const [text, setText] = useState('');
    const [options, setOptions] = useState({
        matchCase: false,
    });

    const onKeyDown = (event, result) => {
        if (event.keyCode === 27) {
            ipcRenderer.send('closeFindInPage');
        } else if (event.keyCode === 13 && text !== '') {
            if (result === undefined || result.matches === undefined) {
                ipcRenderer.send('findInPageNext', { text, options: { ...options } });
            } else {
                ipcRenderer.send('findInPageNext', { text, options: { ...options, findNext: true } });
            }
        } else if (event.keyCode === 13 && text === '') {
            setResult({});
        }
    };

    const goTo = (forward) => () => {
        if (text !== '') {
            ipcRenderer.send('findInPageNext', { text, options: { ...options, forward } });
        }
    };

    const handleOption = (option) => (event) => {
        setOptions({ ...options, [option]: !options[option] });
    };

    useEffect(() => {
        const onFoundInPage = (event, result) => {
            setResult(result);
        };

        ipcRenderer.on('foundInPage', onFoundInPage);

        return function cleanup () {
            ipcRenderer.removeListener('foundInPage', onFoundInPage);
        };
    });

    const close = () => {
        ipcRenderer.send('closeFindInPage');
    };

    const handleChange = (event) => {
        if (result.matches !== undefined) {
            setResult({});
        }
        setText(event.target.value);
    };

    return (
        <MuiThemeProvider theme={baseTheme}>
            <Grid container alignItems='center' className={classes.grid}>
                <InputBase
                    placeholder='Search'
                    autoFocus
                    onKeyDown={onKeyDown}
                    onChange={handleChange}
                    className={classes.input}
                    inputProps={{ spellCheck: 'false' }}
                />
                <Divider orientation='vertical' flexItem />
                <Grid className={classes.count}>
                    { result.matches > 0 &&
                        result.activeMatchOrdinal + '/' + result.matches
                    }
                </Grid>
                <Divider orientation='vertical' flexItem />
                <Tooltip title='Match Case' placement='right' enterDelay={500}>
                    <IconButton
                        color={options.matchCase ? 'primary' : 'default'}
                        onClick={handleOption('matchCase')}
                    >
                        <MatchCaseIcon />
                    </IconButton>
                </Tooltip>
                <Divider orientation='vertical' flexItem />
                <IconButton
                    color="default"
                    onClick={goTo(true)}
                >
                    <PreviousIcon />
                </IconButton>
                <IconButton
                    color="default"
                    onClick={goTo(false)}
                >
                    <NextIcon />
                </IconButton>
                <IconButton
                    color="default"
                    onClick={close}
                >
                    <ClearIcon />
                </IconButton>
            </Grid>
        </MuiThemeProvider>
    );
};

export default FindInPage;
