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
import { withStyles } from '@material-ui/core/styles';
import { remote } from 'electron';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import ClearIcon from '@material-ui/icons/Clear';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'throttle-debounce';

const styles = theme => ({
    button: {
        marginLeft: theme.spacing.unit * 2,
    },
    root: {
        top: 'calc(100vh - 65px)',
        position: 'fixed',
        border: '1px solid #CCCCCC',
        width: 'calc(100% - 20px)',
        height: '56px',
        backgroundImage: 'radial-gradient(#FFFFFF,#DDDDDD)',
        borderRadius: '25px',
        marginLeft : '10px',
        marginRight : '10px',
    },
    grid: {
        height: '56px',
    },
    textField: {
        width: 200,
        marginBottom: theme.spacing.unit,
        marginLeft: theme.spacing.unit * 3,
    },
    count: {
        color: '#AAAAAA',
        marginLeft: theme.spacing.unit * 2,
    },
});

class FindInPage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            search: '',
            currentNum: 0,
            totalFound: 0,
        };
        this.searchInputRef = React.createRef();
        this.page = remote.getCurrentWindow().webContents;
        this.findInPageDebounced = debounce(300, this.findInPage);
    }

    onFoundInPage = (event, result) => {
        this.searchInputRef.current.focus();
        if (result.matches > 1) {
            // The input field text is always found
            // TODO exclude input text from the found results
            this.setState({ currentNum: result.activeMatchOrdinal - 1, totalFound: result.matches - 1 });
        }
    }

    findInPage = (text, options) => {
        if (text !== '') {
            this.page.findInPage(text, options);
        }
    }

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
        this.page.webContents.on('found-in-page', this.onFoundInPage);
        this.searchInputRef.current.focus();
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
        this.page.webContents.stopFindInPage('clearSelection');
        this.page.webContents.removeListener('found-in-page', this.onFoundInPage);
    }

    onKeyDown = (event)  => {
        if (event.keyCode === 27) {
            this.props.onToggleFindInPage();
        } else if (event.keyCode === 13) {
            this.findInPageDebounced(this.state.search, {findNext: true});
        }
    }

    handleChange = (event) => {
        this.findInPageDebounced(event.target.value);
        if (event.target.value === '') {
            // Disabled clearSelection as otherwise TextField looses focus;
            //this.page.webContents.stopFindInPage('clearSelection');
            this.setState({search: event.target.value, totalFound: 0, currentNum: 0});
        } else {
            this.setState({search: event.target.value});
        }
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Grid container wrap='nowrap' alignItems='center' justify='space-between' className={classes.grid}>
                    <Grid item xs={11}>
                        <TextField
                            label="Find in page"
                            id="standard"
                            autoFocus
                            inputRef={this.searchInputRef}
                            value={this.state.search}
                            onChange={this.handleChange}
                            className={classes.textField}
                        />
                        { this.state.totalFound > 0 &&
                                <span className={classes.count}>
                                    { this.state.totalFound + (this.state.totalFound !== 1 ? ' matches' : ' match')}
                                </span>
                        }
                    </Grid>
                    <Grid item>
                        <IconButton
                            color="secondary"
                            onClick={this.props.onToggleFindInPage}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

FindInPage.propTypes = {
    classes            : PropTypes.object.isRequired,
    onToggleFindInPage : PropTypes.func.isRequired,
};

export default withStyles(styles)(FindInPage);

