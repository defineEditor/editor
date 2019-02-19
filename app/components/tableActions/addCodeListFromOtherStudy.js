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
import { withStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import Grid from '@material-ui/core/Grid';
import clone from 'clone';
import TextField from '@material-ui/core/TextField';
import { addCodeList } from 'actions/index.js';
import getSelectionList from 'utils/getSelectionList.js';
import CodedValueSelectorTable from 'components/utils/codedValueSelectorTable.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    studySelector: {
        minWidth: 120,
        marginRight: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    defineSelector: {
        minWidth: 140,
        marginRight: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    selectionField: {
        minWidth: 150,
        marginRight: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addCodeList: (updateObj) => dispatch(addCodeList(updateObj))
    };
};

const mapStateToProps = (state, props) => {
    return {
        studies: state.present.studies,
        defines: state.present.defines,
        standards: state.present.odm.study.metaDataVersion.standards,
        codeListOrder: state.present.odm.study.metaDataVersion.order.codeListOrder,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
    };
};

const getCodeListList = (mdv) => {
    let result = {};
    if (mdv !== undefined) {
        Object.keys(mdv.codeLists).forEach(codeListOid => {
            if (['decoded', 'enumerated'].includes(mdv.codeLists[codeListOid].codeListType)) {
                result[codeListOid] = mdv.codeLists[codeListOid].name;
            }
        });
    }
    return result;
};

class ConnectedAddCodeListFromOtherStudy extends React.Component {
    constructor (props) {
        super(props);

        let studyList = {};
        props.studies.allIds.forEach(studyId => { studyList[studyId] = props.studies.byId[studyId].name; });
        let studyId = props.studies.allIds[0];
        let defineList = {};
        props.studies.byId[studyId].defineIds.forEach(defineId => { defineList[defineId] = props.defines.byId[defineId].name; });
        let defineId = '';
        let sourceOdm = {};

        let codeListList = {};

        let codeListOid = null;

        this.state = {
            studyId,
            defineId,
            studyList,
            defineList,
            sourceOdm,
            codeListOid,
            codeListList,
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
            let codeListList = getCodeListList(data.odm.study.metaDataVersion);
            this.setState({ sourceOdm: data.odm, codeListList });
        }
    }

    handleChange = (name) => (updateObj) => {
        if (name === 'study') {
            let newStudyId = updateObj.target.value;

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
                codeListOid: null,
                codeListList: {},
            });
        } else if (name === 'define') {
            let newDefineId = updateObj.target.value;

            if (newDefineId === this.state.defineId) {
                return;
            }
            this.setState({
                defineId: newDefineId,
                sourceOdm: {},
                codeListOid: null,
                codeListList: {},
            }, () => { ipcRenderer.send('loadDefineObject', newDefineId, 'import'); });
        } else if (name === 'codeList') {
            this.setState({ codeListOid: updateObj.target.value, selectedCodes: [] });
        }
    }

    handleAddCodeList = (selectedCodes) => {
        let codeList = clone(this.state.sourceOdm.study.metaDataVersion.codeLists[this.state.codeListOid]);
        // Check if the OID is unique
        if (this.props.codeListOrder.includes(codeList.oid)) {
            codeList.oid = getOid('CodeList', undefined, this.props.codeListOrder);
        }

        // Keep only selected codes;
        let items;
        if (codeList.codeListType === 'decoded') {
            items = codeList.codeListItems;
        } else if (codeList.codeListType === 'enumerated') {
            items = codeList.enumeratedItems;
        }

        if (items !== undefined) {
            Object.keys(items).forEach(codeOid => {
                if (!selectedCodes.includes(codeOid)) {
                    delete items[codeOid];
                    codeList.itemOrder.splice(codeList.itemOrder.indexOf(codeOid), 1);
                }
            });
        }
        // Remove study-specific values;
        codeList.linkedCodeListOid = undefined;
        // Sources are properly set by the CodeList class constructor
        codeList.sources = undefined;

        // Connect to the standard;
        // CT Oids are taken from the Original CDISC file, so it is safe to rely on it
        if (codeList.standardOid !== undefined) {
            if (!Object.keys(this.props.standards).includes(codeList.standardOid)) {
                codeList.standardOid = undefined;
                codeList.alias = undefined;
                codeList.cdiscSubmissionValue = undefined;
            }
        } else {
            codeList.alias = undefined;
            codeList.cdiscSubmissionValue = undefined;
        }

        this.props.addCodeList(codeList);
        this.props.onClose();
    };

    render () {
        const { defineVersion, classes } = this.props;
        let codeList;
        if (this.state.codeListOid !== null) {
            codeList = this.state.sourceOdm.study.metaDataVersion.codeLists[this.state.codeListOid];
        }

        return (
            <Grid container spacing={8} className={classes.root}>
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
                <Grid item>
                    <TextField
                        label='Codelist'
                        disabled={this.state.defineId === ''}
                        value={this.state.codeListOid || ''}
                        onChange={this.handleChange('codeList')}
                        className={classes.selectionField}
                        select={Object.keys(this.state.codeListList).length > 0}
                    >
                        { Object.keys(this.state.codeListList).length > 0 && getSelectionList(this.state.codeListList)}
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    { codeList !== undefined &&
                            <CodedValueSelectorTable
                                key={this.state.codeListOid}
                                onAdd={this.handleAddCodeList}
                                addLabel='Add Codelist'
                                sourceCodeList={codeList}
                                defineVersion={defineVersion}
                            />
                    }
                </Grid>
            </Grid>
        );
    }
}

ConnectedAddCodeListFromOtherStudy.propTypes = {
    classes: PropTypes.object.isRequired,
    codeListOrder: PropTypes.array.isRequired,
    studies: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    standards: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    addCodeList: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

const AddCodeListFromOtherStudy = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedAddCodeListFromOtherStudy
);
export default withStyles(styles)(AddCodeListFromOtherStudy);
