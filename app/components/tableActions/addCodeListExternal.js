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
import AutocompleteSelectEditor from 'editors/autocompleteSelectEditor.js';
import { addCodeList, selectGroup } from 'actions/index.js';
import getSelectionList from 'utils/getSelectionList.js';
import CodedValueSelectorTable from 'components/utils/codedValueSelectorTable.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
    },
    table: {
        minWidth: 100
    },
    standardSelection: {
        minWidth: 100,
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(6),
    },
    codeListSelectionItem: {
        width: '100%',
    },
    codeListSelection: {
        marginTop: 0,
        minWidth: 150,
        maxWidth: 450,
    },
    studySelector: {
        minWidth: 120,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    defineSelector: {
        minWidth: 140,
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addCodeList: (updateObj) => dispatch(addCodeList(updateObj)),
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
    };
};

const mapStateToProps = (state, props) => {
    return {
        codeListOrder: state.present.odm.study.metaDataVersion.order.codeListOrder,
        stdCodeLists: state.present.stdCodeLists,
        standards: state.present.odm.study.metaDataVersion.standards,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        codedValuesTabIndex: state.present.ui.tabs.tabNames.indexOf('Coded Values'),
        openCodeListAfterAdd: state.present.settings.editor.openCodeListAfterAdd,
        studies: state.present.studies,
        defines: state.present.defines,
    };
};

const getCodeListList = (standard) => {
    let result = [{ value: null, label: '' }];
    if (standard !== undefined) {
        Object.keys(standard.codeLists).forEach(codeListOid => {
            let item = {
                value: codeListOid,
                label: standard.codeLists[codeListOid].name,
            };
            result.push(item);
        });
    }
    return result;
};

class ConnectedAddCodeListFromCT extends React.Component {
    constructor (props) {
        super(props);

        let codeListOid = null;

        // CT attributes
        let standardList = {};

        let standardOid;
        let codeListList = [];
        if (props.type === 'CT') {
            Object.keys(props.standards).forEach(standardOid => {
                if (props.stdCodeLists.hasOwnProperty(standardOid) && props.standards[standardOid].type === 'CT') {
                    standardList[standardOid] = props.stdCodeLists[standardOid].description;
                }
            });
            if (Object.keys(standardList).length > 0) {
                standardOid = Object.keys(standardList)[0];
                codeListList = getCodeListList(props.stdCodeLists[standardOid]);
            }
        }

        // Define attributes
        let studyList = {};
        let studyId;
        let defineList = {};
        let defineId = '';
        let sourceOdm = {};
        if (props.type === 'Define') {
            studyId = props.studies.allIds[0];
            props.studies.allIds.forEach(studyId => { studyList[studyId] = props.studies.byId[studyId].name; });
            props.studies.byId[studyId].defineIds.forEach(defineId => { defineList[defineId] = props.defines.byId[defineId].name; });
        }

        this.state = {
            studyId,
            defineId,
            studyList,
            defineList,
            sourceOdm,
            standardOid,
            codeListOid,
            standardList,
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

    handleCTChange = (name) => (updateObj, option) => {
        if (name === 'standard') {
            let standardOid = updateObj.target.value;
            let standard = this.props.stdCodeLists[standardOid];
            let codeListList = getCodeListList(standard);
            this.setState({ standardOid, codeListList, codeListOid: null });
        } else if (name === 'codeList' && option !== null) {
            this.setState({ codeListOid: option.value });
        }
    }

    handleDefineChange = (name) => (updateObj, option) => {
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
            this.setState({ codeListOid: option.value });
        }
    }

    handleAddCodeList = (selectedCodes) => {
        let codeList;
        if (this.props.type === 'CT') {
            codeList = clone(this.props.stdCodeLists[this.state.standardOid].codeLists[this.state.codeListOid]);
        } else if (this.props.type === 'Define') {
            codeList = clone(this.state.sourceOdm.study.metaDataVersion.codeLists[this.state.codeListOid]);
        }

        // Check if the OID is unique
        if (this.props.codeListOrder.includes(codeList.oid)) {
            codeList.oid = getOid('CodeList', this.props.codeListOrder);
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

        if (this.props.type === 'CT') {
            // Connect to the standard;
            codeList.standardOid = this.state.standardOid;
        } else if (this.props.type === 'Define') {
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
        }

        this.props.addCodeList(codeList);
        if (this.props.openCodeListAfterAdd) {
            let groupData = {
                tabIndex: this.props.codedValuesTabIndex,
                groupOid: this.state.codeListOid,
                scrollPosition: {},
            };
            this.props.selectGroup(groupData);
        }
        this.props.onClose();
    };

    CodeListSelector = () => {
        const { classes, type } = this.props;
        let value = { value: null, label: '' };
        let codeList;
        if (type === 'CT') {
            if (this.state.codeListOid !== null) {
                let standard = this.props.stdCodeLists[this.state.standardOid];
                codeList = standard.codeLists[this.state.codeListOid];
            }
        } else if (type === 'Define') {
            if (this.state.codeListOid !== null) {
                codeList = this.state.sourceOdm.study.metaDataVersion.codeLists[this.state.codeListOid];
            }
        }
        if (this.state.codeListOid !== null) {
            value = { value: this.state.codeListOid, label: codeList.name };
        }
        if (type === 'CT') {
            return (
                <Grid container spacing={1} justify='flex-start' className={classes.root} wrap='nowrap'>
                    <Grid item>
                        <TextField
                            label='Standard'
                            value={this.state.standardOid}
                            onChange={this.handleCTChange('standard')}
                            className={classes.standardSelection}
                            select
                        >
                            {getSelectionList(this.state.standardList)}
                        </TextField>
                    </Grid>
                    <Grid item className={classes.codeListSelectionItem}>
                        <AutocompleteSelectEditor
                            key={this.state.standardOid}
                            onChange={this.handleCTChange('codeList')}
                            value={value}
                            label='Codelist'
                            options={this.state.codeListList}
                            textFieldClassName={classes.codeListSelection}
                        />
                    </Grid>
                </Grid>
            );
        } else if (type === 'Define') {
            return (
                <Grid container spacing={1} justify='flex-start' className={classes.root} wrap='nowrap'>
                    <Grid item>
                        <TextField
                            label='Study'
                            value={this.state.studyId}
                            onChange={this.handleDefineChange('study')}
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
                            onChange={this.handleDefineChange('define')}
                            className={classes.defineSelector}
                            select
                        >
                            {getSelectionList(this.state.defineList)}
                        </TextField>
                    </Grid>
                    <Grid item className={classes.codeListSelectionItem}>
                        <AutocompleteSelectEditor
                            key={this.state.defineId}
                            onChange={this.handleDefineChange('codeList')}
                            value={value}
                            label='Codelist'
                            options={this.state.codeListList}
                            textFieldClassName={classes.codeListSelection}
                        />
                    </Grid>
                </Grid>
            );
        }
    }

    render () {
        const { defineVersion, type } = this.props;
        let codeList;
        if (type === 'CT') {
            if (this.state.codeListOid !== null) {
                let standard = this.props.stdCodeLists[this.state.standardOid];
                codeList = standard.codeLists[this.state.codeListOid];
            }
        } else if (type === 'Define') {
            if (this.state.codeListOid !== null) {
                codeList = this.state.sourceOdm.study.metaDataVersion.codeLists[this.state.codeListOid];
            }
        }

        return (
            <CodedValueSelectorTable
                key={this.state.codeListOid}
                onAdd={this.handleAddCodeList}
                addLabel='Add Codelist'
                sourceCodeList={codeList}
                defineVersion={defineVersion}
                codeListSelector={this.CodeListSelector}
                onClose={this.props.onClose}
            />
        );
    }
}

ConnectedAddCodeListFromCT.propTypes = {
    classes: PropTypes.object.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
    codeListOrder: PropTypes.array.isRequired,
    standards: PropTypes.object.isRequired,
    studies: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    addCodeList: PropTypes.func.isRequired,
    selectGroup: PropTypes.func.isRequired,
    codedValuesTabIndex: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    openCodeListAfterAdd: PropTypes.bool.isRequired,
};

const AddCodeListFromCT = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedAddCodeListFromCT
);
export default withStyles(styles)(AddCodeListFromCT);
