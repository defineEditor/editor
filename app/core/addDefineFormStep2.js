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
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import getSelectionList from 'utils/getSelectionList.js';
import getEmptyDefineXml from 'utils/getEmptyDefineXml.js';

const styles = theme => ({
    root: {
        width: '90%'
    },
    textField: {
        width: 200,
        marginBottom: theme.spacing.unit
    },
    button: {
        marginRight: theme.spacing.unit
    },
    studySelector: {
        marginLeft: theme.spacing.unit * 2,
        minWidth: '100px',
    },
    defineSelector: {
        minWidth: '100px',
        marginLeft: theme.spacing.unit * 4,
    },
});

class AddDefineFormStep2 extends React.Component {
    constructor (props) {
        super(props);

        // Attribute for new study
        let standard = '';
        let defineData;
        let defineVersion = '2.0.0';

        if (this.props.defineData !== null) {
            defineData = this.props.defineData;
            defineVersion = defineData.study.metaDataVersion.defineVersion;
            let standards = defineData.study.metaDataVersion.standards;
            Object.keys(standards).forEach(standardOid => {
                if (standards[standardOid].isDefault === 'Yes') {
                    standard = standards[standardOid].name;
                }
            });
        }

        // Attributes for copied study
        let studyList = {};
        props.studies.allIds.forEach(studyId => { studyList[studyId] = props.studies.byId[studyId].name; });
        let studyId = props.studies.allIds[0];
        let defineList = {};
        props.studies.byId[studyId].defineIds.forEach(defineId => { defineList[defineId] = props.defines.byId[defineId].name; });
        let defineId = '';

        this.state = {
            defineVersion,
            standard,
            defineData,
            studyId,
            defineId,
            studyList,
            defineList,
        };
    }

    handleChange = name => event => {
        if (name === 'study') {
            let newStudyId = event.target.value;

            if (newStudyId === this.state.studyId) {
                return;
            }

            let defineList = {};
            this.props.studies.byId[newStudyId].defineIds.forEach(defineId => { defineList[defineId] = this.props.defines.byId[defineId].name; });
            this.setState({
                studyId: newStudyId,
                defineList,
                defineId: '',
                sourceOdm: {},
            });
        } else if (name === 'define') {
            let newDefineId = event.target.value;

            if (newDefineId === this.state.defineId) {
                return;
            }
            this.setState({ defineId: newDefineId, sourceOdm: {} }, () => { ipcRenderer.send('loadDefineObject', newDefineId, 'import'); });
        } else if (
            name === 'defineVersion' &&
            !this.props.standardNames[event.target.value].includes(this.state.standard)
        ) {
            this.setState({
                [name]: event.target.value,
                standard: ''
            });
        } else {
            this.setState({ [name]: event.target.value });
        }
    };

    handleNext = event => {
        if (this.props.defineCreationMethod === 'new') {
            // Create blank Define-XML
            let defineData = getEmptyDefineXml({
                study: this.props.study,
                standard: this.state.standard,
                defineVersion: this.state.defineVersion,
                settings: this.props.settings,
                controlledTerminology: this.props.controlledTerminology,
            });
            this.props.onNext({ defineData });
        } else if (this.props.defineCreationMethod === 'copy') {
            ipcRenderer.once('loadDefineObjectForImport', this.loadDefineData);
            ipcRenderer.send('loadDefineObject', this.state.defineId, 'import');
        }
    };

    loadDefineData = (event, data, id) => {
        if (id === 'import' && data.hasOwnProperty('odm')) {
            this.props.onNext({ defineData: data.odm, name: this.props.defines.byId[this.state.defineId].name });
        }
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container direction="column" spacing={8} className={classes.root}>
                <Grid item>
                    { this.props.defineCreationMethod === 'new' && (
                        <Grid container spacing={16} className={classes.root}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Standard"
                                    id="standard"
                                    value={this.state.standard}
                                    onChange={this.handleChange('standard')}
                                    className={classes.textField}
                                    select
                                >
                                    {getSelectionList(
                                        this.props.standardNames[this.state.defineVersion]
                                    )}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Define Version"
                                    disabled={true}
                                    value={this.state.defineVersion}
                                    id="version"
                                    select
                                    onChange={this.handleChange('defineVersion')}
                                    className={classes.textField}
                                >
                                    {getSelectionList(['2.0.0', '2.1.0'])}
                                </TextField>
                            </Grid>
                        </Grid>
                    )}
                    { this.props.defineCreationMethod === 'copy' && (
                        <Grid container spacing={16} className={classes.root}>
                            <Grid item>
                                <TextField
                                    label='Study'
                                    value={this.state.studyId}
                                    onChange={this.handleChange('study')}
                                    className={classes.studySelector}
                                    select
                                >
                                    {getSelectionList(this.state.studyList)}
                                </TextField>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label='Define'
                                    value={this.state.defineId}
                                    onChange={this.handleChange('define')}
                                    className={classes.defineSelector}
                                    select
                                >
                                    {getSelectionList(this.state.defineList)}
                                </TextField>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
                <Grid item>
                    <Button
                        color="primary"
                        onClick={this.props.onCancel}
                        className={classes.button}
                    >
                        Cancel
                    </Button>
                    <Button onClick={this.props.onBack} className={classes.button}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={(this.state.standard === '' && this.props.defineCreationMethod === 'new') ||
                                (this.state.defineId === '' && this.props.defineCreationMethod === 'copy')
                        }
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

AddDefineFormStep2.propTypes = {
    classes: PropTypes.object.isRequired,
    study: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    defineCreationMethod: PropTypes.string.isRequired,
    defineData: PropTypes.object,
    onNext: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default withStyles(styles)(AddDefineFormStep2);
