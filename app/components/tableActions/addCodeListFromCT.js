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
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    standardSelection: {
        minWidth: 100,
        marginRight: theme.spacing(6),
    },
    codeListSelection: {
        marginTop: 0,
        minWidth: 150,
        maxWidth: 450,
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
    };
};

const getCodeListList = (standard) => {
    let result = [];
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

        let standardList = {};
        Object.keys(props.standards).forEach(standardOid => {
            if (props.stdCodeLists.hasOwnProperty(standardOid) && props.standards[standardOid].type === 'CT') {
                standardList[standardOid] = props.stdCodeLists[standardOid].description;
            }
        });

        let standardOid;
        let codeListList = [];
        if (Object.keys(standardList).length > 0) {
            standardOid = Object.keys(standardList)[0];
            codeListList = getCodeListList(props.stdCodeLists[standardOid]);
        }

        let codeListOid = null;

        this.state = {
            standardOid,
            codeListOid,
            standardList,
            codeListList,
        };
    }

    handleChange = (name) => (updateObj, option) => {
        if (name === 'standard') {
            let standardOid = updateObj.target.value;
            let standard = this.props.stdCodeLists[standardOid];
            let codeListList = getCodeListList(standard);
            this.setState({ standardOid, codeListList, codeListOid: null });
        } else if (name === 'codeList' && option !== null) {
            this.setState({ codeListOid: option.value });
        }
    }

    handleAddCodeList = (selectedCodes) => {
        let codeList = clone(this.props.stdCodeLists[this.state.standardOid].codeLists[this.state.codeListOid]);
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

        // Connect to the standard;
        codeList.standardOid = this.state.standardOid;

        this.props.addCodeList(codeList);
        this.props.onClose();
    };

    handleAddAndOpen = (selectedCodes) => {
        this.handleAddCodeList(selectedCodes);
        let groupData = {
            tabIndex: this.props.codedValuesTabIndex,
            groupOid: this.state.codeListOid,
            scrollPosition: {},
        };
        this.props.selectGroup(groupData);
    }

    render () {
        const { defineVersion, classes } = this.props;
        let codeList;
        if (this.state.codeListOid !== null) {
            let standard = this.props.stdCodeLists[this.state.standardOid];
            codeList = standard.codeLists[this.state.codeListOid];
        }

        let defaultCodeList = { name: '', label: '' };

        return (
            <Grid container spacing={1} justify='flex-start' className={classes.root}>
                <Grid item>
                    <TextField
                        label='Standard'
                        value={this.state.standardOid}
                        onChange={this.handleChange('standard')}
                        className={classes.standardSelection}
                        select
                    >
                        {getSelectionList(this.state.standardList)}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    {(this.state.codeListList.length === 0) ? (
                        <div>The standard does not have any codelits.</div>
                    ) : (
                        <AutocompleteSelectEditor
                            key={this.state.standardOid}
                            onChange={this.handleChange('codeList')}
                            defaultValue={defaultCodeList}
                            label='Add Codelist'
                            options={this.state.codeListList}
                            textFieldClassName={classes.codeListSelection}
                        />
                    )}
                </Grid>
                <Grid item xs={12}>
                    { codeList !== undefined &&
                            <CodedValueSelectorTable
                                key={this.state.codeListOid}
                                onAdd={this.handleAddCodeList}
                                onAddAndOpen={this.handleAddAndOpen}
                                addLabel='Add Codelist'
                                openLabel='Add and Open'
                                sourceCodeList={codeList}
                                defineVersion={defineVersion}
                            />
                    }
                </Grid>
            </Grid>
        );
    }
}

ConnectedAddCodeListFromCT.propTypes = {
    classes: PropTypes.object.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
    codeListOrder: PropTypes.array.isRequired,
    standards: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    addCodeList: PropTypes.func.isRequired,
    selectGroup: PropTypes.func.isRequired,
    codedValuesTabIndex: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
};

const AddCodeListFromCT = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedAddCodeListFromCT
);
export default withStyles(styles)(AddCodeListFromCT);
