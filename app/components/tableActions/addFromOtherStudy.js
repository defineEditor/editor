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
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import getSelectionList from 'utils/getSelectionList.js';
import AddDatasetFromDefine from 'components/tableActions/addDatasetFromDefine.js';
import AddVariableFromDefine from 'components/tableActions/addVariableFromDefine.js';
import AddResultDisplayFromDefine from 'components/tableActions/addResultDisplayFromDefine.js';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
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

// Redux functions
const mapStateToProps = (state, props) => {
    return {
        studies: state.present.studies,
        defines: state.present.defines,
    };
};

class addFromOtherStudyConnected extends React.Component {
    constructor (props) {
        super(props);

        let studyList = {};
        props.studies.allIds.forEach(studyId => { studyList[studyId] = props.studies.byId[studyId].name; });
        let studyId = props.studies.allIds[0];
        let defineList = {};
        props.studies.byId[studyId].defineIds.forEach(defineId => { defineList[defineId] = props.defines.byId[defineId].name; });
        let defineId = '';
        let sourceOdm = {};
        this.state = {
            studyId,
            defineId,
            studyList,
            defineList,
            sourceOdm,
        };
    }

    componentDidMount () {
        ipcRenderer.on('loadDefineObjectForImport', this.loadOdm);
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('loadDefineObjectForImport', this.loadOdm);
    }

    loadOdm= (event, data, id) => {
        if (id === 'import' && data.hasOwnProperty('odm')) {
            this.setState({ sourceOdm: data.odm });
        }
    }

    handleChange = (name) => (event) => {
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
        }
    };

    render () {
        const { classes } = this.props;
        const sourceExists = Object.keys(this.state.sourceOdm).length > 0;
        return (
            <Grid container spacing={0} className={classes.root}>
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
                { sourceExists && this.props.type === 'variable' &&
                        <Grid item xs={12}>
                            <AddVariableFromDefine
                                sourceMdv={this.state.sourceOdm.study.metaDataVersion}
                                sourceDefineId={this.state.sourceOdm.defineId}
                                itemGroupOid={this.props.itemGroupOid}
                                position={this.props.position}
                                onClose={this.props.onClose}
                            />
                        </Grid>
                }
                { sourceExists && this.props.type === 'dataset' &&
                        <Grid item xs={12}>
                            <AddDatasetFromDefine
                                sourceMdv={this.state.sourceOdm.study.metaDataVersion}
                                sourceDefineId={this.state.sourceOdm.defineId}
                                position={this.props.position}
                                onClose={this.props.onClose}
                            />
                        </Grid>
                }
                { sourceExists && this.props.type === 'resultDisplay' &&
                        <Grid item xs={12}>
                            <AddResultDisplayFromDefine
                                sourceMdv={this.state.sourceOdm.study.metaDataVersion}
                                sourceDefineId={this.state.sourceOdm.defineId}
                                position={this.props.position}
                                onClose={this.props.onClose}
                            />
                        </Grid>
                }
            </Grid>
        );
    }
}

addFromOtherStudyConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    studies: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string,
    position: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

const AddFromOtherStudy = connect(mapStateToProps)(
    addFromOtherStudyConnected
);
export default withStyles(styles)(AddFromOtherStudy);
