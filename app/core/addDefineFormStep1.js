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
import { withStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Typography from '@material-ui/core/Typography';
import path from 'path';
import parseDefine from 'parsers/parseDefine.js';
import checkDefineXml from 'utils/checkDefineXml.js';
import removeTrailingSpaces from 'utils/removeTrailingSpaces.js';
import recreateDefine from 'utils/recreateDefine.js';

const styles = theme => ({
    button: {
        marginRight: theme.spacing(1),
    },
    formControl: {
        margin: theme.spacing(3),
    },
    group: {
        margin: `${theme.spacing(1)}px 0`,
    },
});

class AddDefineFormStep1 extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            defineCreationMethod: this.props.defineCreationMethod,
            defineData: this.props.defineData,
            pathToDefineXml: this.props.pathToDefineXml,
            parsingErrors: [],
        };
    }

    componentDidMount () {
        ipcRenderer.on('define', this.loadDefine);
        ipcRenderer.on('defineReadError', this.updateError);
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('define', this.loadDefine);
        ipcRenderer.removeListener('defineReadError', this.updateError);
    }

    updateError = (event, errorText) => {
        if (errorText !== undefined && typeof errorText === 'string') {
            this.setState({ parsingErrors: [errorText] });
        }
    }

    loadDefine = (event, data, pathToDefineXml) => {
        this.props.updateMainUi({ pathToLastFile: path.dirname(pathToDefineXml) });
        try {
            let defineData;
            if (pathToDefineXml.endsWith('nogz')) {
                defineData = recreateDefine(data.odm);
            } else {
                // XML file
                defineData = parseDefine(data);
            }
            let checkResult = checkDefineXml(defineData);
            if (this.props.removeTrailingSpaces === true) {
                removeTrailingSpaces(defineData);
            }
            if (checkResult.length === 0) {
                this.setState({ defineData, pathToDefineXml, parsingErrors: [] });
            } else {
                this.setState({ parsingErrors: checkResult });
                throw new Error(checkResult);
            }
        } catch (error) {
            if (this.state.parsingErrors.length === 0) {
                this.setState({ parsingErrors: [error.message] });
            }
            throw new Error('Could not process the Define-XML file. Verify a valid Define-XML file is selected. ' + error.message);
        }
    }

    handleChange = event => {
        this.setState({ defineCreationMethod: event.target.value });
    };

    handleNext = event => {
        this.props.onNext(this.state);
    }

    openDefineXml = () => {
        // Reset errors
        this.setState({ parsingErrors: [], defineData: null });
        ipcRenderer.send('openDefineXml', this.props.pathToLastFile);
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container direction='column' spacing={1}>
                <Grid item>
                    <FormControl component="fieldset" required className={classes.formControl}>
                        <RadioGroup
                            aria-label="DefineXMLSelect"
                            name="defineXmlSelect"
                            className={classes.group}
                            value={this.state.defineCreationMethod}
                            onChange={this.handleChange}
                        >
                            <FormControlLabel value="new" control={<Radio color='primary'/>} label="Create a new Define-XML document"/>
                            <FormControlLabel value="copy" control={<Radio color='primary'/>} label="Copy Define-XML from another study"/>
                            <FormControlLabel value="import" control={<Radio color='primary'/>} label="Import an existing Define-XML file"/>
                        </RadioGroup>
                        { this.state.defineCreationMethod === 'import' && (
                            <React.Fragment>
                                <Grid container spacing={1} justify='flex-start' alignItems='center'>
                                    <Typography variant='body1' color='primary'>
                                        It is important to verify that the imported Define-XML file does not have any structural (technical) issues.
                                        Otherwise it might result in application issues and you might not be able to save the changes done in the editor.
                                    </Typography>
                                    <Grid item>
                                        { this.state.defineData === null ? (
                                            <Typography variant='body1'>
                                                Select Define-XML
                                            </Typography>
                                        ) : (
                                            <Typography variant="body1">
                                                Study: {this.state.defineData.study.globalVariables.studyName}
                                                &nbsp;
                                                Model: {this.state.defineData.study.metaDataVersion.model}
                                                &nbsp;&nbsp;
                                                {Object.keys(this.state.defineData.study.metaDataVersion.itemGroups).length} datasets
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            color='default'
                                            onClick={this.openDefineXml}
                                            className={classes.menuToggle}
                                        >
                                            <FolderOpen/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                { this.state.parsingErrors.length > 0 && (
                                    <Typography variant="caption" color='secondary'>
                                        Import Failed. Verify a valid Define-XML is imported.
                                        <br/>
                                        {this.state.parsingErrors.map((error, index) => (
                                            <div key={index}>
                                                {error}
                                                <br/>
                                            </div>
                                        ))}
                                    </Typography>

                                )}
                            </React.Fragment>
                        )}
                    </FormControl>
                </Grid>
                <Grid>
                    <Button
                        color="primary"
                        onClick={this.props.onCancel}
                        className={classes.button}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={true}
                        className={classes.button}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={this.state.defineCreationMethod === 'import' && this.state.defineData === null}
                        onClick={this.handleNext}
                        className={classes.button}
                    >
                        Next
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

AddDefineFormStep1.propTypes = {
    classes: PropTypes.object.isRequired,
    defineCreationMethod: PropTypes.string.isRequired,
    defineData: PropTypes.object,
    removeTrailingSpaces: PropTypes.bool,
    onNext: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    pathToLastFile: PropTypes.string,
    updateMainUi: PropTypes.func.isRequired,
};

export default withStyles(styles)(AddDefineFormStep1);
