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

import React from 'react';
import PropTypes from 'prop-types';
import path from 'path';
import { withStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FolderOpen from '@material-ui/icons/FolderOpen';
import EditingControlIcons from 'editors/editingControlIcons.js';

const styles = theme => ({
    root: {
        padding: 16,
        marginTop: theme.spacing.unit * 3,
        width: '100%',
        outline: 'none',
    },
    inputField: {
    },
});

class OtherAttributesEditor extends React.Component {
    constructor (props) {
        super(props);

        const { otherAttrs } = this.props;
        this.state = {
            ...otherAttrs,
        };
    }

    componentDidMount () {
        ipcRenderer.on('selectedFolder', this.setPathToFile);
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('selectedFolder', this.setPathToFile);
    }

    setPathToFile = (event, pathToFolder, title) => {
        if (pathToFolder !== undefined) {
            let fileName = 'define.xml';
            // Extract filename if it existed
            if (this.state.pathToFile) {
                fileName = path.basename(this.state.pathToFile);
            }
            this.setState({ pathToFile: path.join(pathToFolder, fileName) });
        }
    };

    selectPathToFile = () => {
        ipcRenderer.send('selectFolder', 'Select Path To Define-XML file', this.props.otherAttrs.pathToFile);
    };

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    }

    save = () => {
        this.props.onSave(this.state);
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render () {
        const { classes } = this.props;
        return (
            <Paper className={classes.root} elevation={4} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Typography variant="headline" component="h3">
                    Other Attributes
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel}/>
                </Typography>
                <Typography variant="caption">
                    Those attributes are not part of the Define-XML standard and are not saved in a Define-XML file.
                </Typography>
                <List>
                    <ListItem dense>
                        <TextField
                            label='Define-XML Name'
                            value={this.state.name}
                            autoFocus
                            fullWidth
                            onChange={this.handleChange('name')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem dense>
                        <TextField
                            label='Define-XML Location'
                            value={this.state.pathToFile}
                            fullWidth
                            onChange={this.handleChange('pathToFile')}
                            className={classes.inputField}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton
                                            color="default"
                                            onClick={this.selectPathToFile}
                                        >
                                            <FolderOpen />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </ListItem>
                </List>
            </Paper>
        );
    }
}

OtherAttributesEditor.propTypes = {
    otherAttrs: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onHelp: PropTypes.func,
    onComment: PropTypes.func,
};

export default withStyles(styles)(OtherAttributesEditor);
