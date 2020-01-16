/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
import store from 'store/index.js';
import clone from 'clone';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ClearIcon from '@material-ui/icons/Clear';
import DoneAll from '@material-ui/icons/DoneAll';
import InternalHelp from 'components/utils/internalHelp.js';
import CodedValueSelectorTable from 'components/utils/codedValueSelectorTable.js';
import getSelectionList from 'utils/getSelectionList.js';
import getOid from 'utils/getOid.js';
import { CODELIST_TO_VLM } from 'constants/help.js';
import {
    addValueListFromCodelist,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    variableField: {
        minWidth: 150,
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    attributeField: {
        minWidth: 150,
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    dialog: {
        position: 'absolute',
        top: '10%',
        maxHeight: '80%',
        width: '80%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    title: {
        marginTop: theme.spacing(1),
        paddingBottom: 0,
    },
});

const attrList = {
    'dataType': 'Data Type',
    'codeListOid': 'Codelist',
    'fractionDigits': 'Fraction Digits',
    'origins': 'Origin',
    'length': 'Length',
    'mandatory': 'Mandatory',
    'lengthAsCodeList': 'Codelist Length Flag',
    'displayFormat': 'Display Format',
    'role': 'Role',
};

function AddVlmFromCodeList (props) {
    const storeState = store.getState();

    const onAddVlm = (selectedCodes) => {
        // sort selected codes as per order in the codelist
        selectedCodes.sort((first, second) => {
            return codeLists[codeListOid].itemOrder.indexOf(first) - codeLists[codeListOid].itemOrder.indexOf(second);
        });

        let valueLists = storeState.present.odm.study.metaDataVersion.valueLists;
        let itemDefs = storeState.present.odm.study.metaDataVersion.itemDefs;
        let whereClauses = storeState.present.odm.study.metaDataVersion.whereClauses;
        let lang = storeState.present.odm.lang;

        // this variable show which property to look for inside a codelist
        let codeListItemsProperty = codeLists[codeListOid].codeListType === 'enumerated' ? 'enumeratedItems' : 'codeListItems';

        // create an object with all VLM attributes
        // when decoded codelist, also add labels
        let updateObjLabels = codeLists[codeListOid].codeListType === 'decoded' ? selectedCodes.reduce((object, value, key) => {
            object.labels.push(codeLists[codeListOid].codeListItems[value].decodes[0].value);
            return object;
        }, { labels: [] }) : {};
        // and all other attributes
        let updateObj = selectedCodes.reduce((object, value, key) => {
            object.names.push(codeLists[codeListOid][codeListItemsProperty][value].codedValue);
            object.itemDefOids.push(getOid('ItemDef', Object.keys(itemDefs).concat(object['itemDefOids'])));
            object.whereClauseOids.push(getOid('WhereClause', Object.keys(whereClauses).concat(object['whereClauseOids'])));
            return object;
        }, { ...updateObjLabels, sourceOid: undefined, valueListOid: undefined, itemDefOids: [], whereClauseOids: [], names: [] });
        updateObj.valueListOid = getOid('ValueList', Object.keys(valueLists));
        updateObj.sourceOid = props.currentItemOid;
        updateObj.sourceGroupOid = props.currentGroupOid;
        updateObj.selectedOid = itemDefOid;
        updateObj.lang = lang;
        // If attributes were selected to be copied;
        updateObj.itemDefAttrs = {};
        updateObj.itemRefAttrs = {};

        if (copyAttributes && selectedAttributes.length > 0) {
            const sourceItemDef = itemDefs[props.currentItemOid];
            // Find corresponding ItemRef, as some attributes can be copied from it
            let sourceItemRef = {};
            const itemRefs = storeState.present.odm.study.metaDataVersion.itemGroups[props.currentGroupOid].itemRefs;
            Object.values(itemRefs).some(itemRef => {
                if (itemRef.itemOid === props.currentItemOid) {
                    sourceItemRef = itemRef;
                    return true;
                }
            });
            selectedAttributes.forEach(attr => {
                if (['dataType', 'codeListOid', 'fractionDigits', 'length', 'lengthAsCodeList', 'displayFormat'].includes(attr)) {
                    updateObj.itemDefAttrs[attr] = sourceItemDef[attr];
                } else if (['role', 'mandatory'].includes(attr)) {
                    updateObj.itemRefAttrs[attr] = sourceItemRef[attr];
                } else if (attr === 'origins') {
                    updateObj.itemDefAttrs[attr] = clone(sourceItemDef[attr]);
                }
            });
        }

        store.dispatch(addValueListFromCodelist(updateObj));
        props.onCancel();
    };

    const handleSelectAllClick = () => {
        if (selectedAttributes.length !== Object.keys(attrList).length) {
            setSelectedAttributes(Object.keys(attrList));
        } else {
            setSelectedAttributes([]);
        }
    };

    const { classes } = props;

    // create state variables for selected itemDefOid, codeListOid
    const [itemDefOid, setItemDefOid] = useState(undefined);
    const [codeListOid, setCodeListOid] = useState(undefined);
    const [copyAttributes, setCopyAttributes] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState([]);

    // retrieve data from state
    let codeLists = storeState.present.odm.study.metaDataVersion.codeLists;
    let itemDefs = storeState.present.odm.study.metaDataVersion.itemDefs;
    let defineVersion = storeState.present.odm.study.metaDataVersion.defineVersion;

    // create object for dropdown list: its properties are itemOid name and label concatenated
    // dropdown list is restricted to variables with either decoded or enumerated codelist
    let itemDefList = Object.keys(itemDefs)
        .filter(itemDef => itemDefs[itemDef].codeListOid !== undefined && itemDefs[itemDef].sources.itemGroups.includes(props.currentGroupOid) &&
            ['decoded', 'enumerated'].includes(codeLists[itemDefs[itemDef].codeListOid].codeListType))
        .reduce((object, value, key) => { object[value] = itemDefs[value].name + (itemDefs[value].descriptions[0].value && (' (' + itemDefs[value].descriptions[0].value + ')')); return object; }, {});

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open
            fullWidth
            maxWidth={false}
            PaperProps={{ className: classes.dialog }}
            tabIndex='0'
        >
            <DialogTitle id="alert-dialog-title" className={classes.title}>
                <Grid container spacing={0} justify='space-between' alignItems='center'>
                    <Grid item>
                        Create Value Level Metadata from Variable Values
                        <InternalHelp data={CODELIST_TO_VLM} />
                    </Grid>
                    <Grid item>
                        <IconButton
                            color="secondary"
                            onClick={props.onCancel}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={1} className={classes.root}>
                    <Grid item>
                        { Object.keys(itemDefList).length !== 0 && (
                            <Grid container spacing={1} alignItems='flex-end' wrap='nowrap'>
                                <Grid item>
                                    <TextField
                                        label='Variable'
                                        disabled={Object.keys(itemDefList).length === 0}
                                        value={itemDefOid || ' '}
                                        onChange={(updateObj) => { setItemDefOid(updateObj.target.value); setCodeListOid(itemDefs[updateObj.target.value].codeListOid); }}
                                        className={classes.variableField}
                                        select={Object.keys(itemDefList).length > 0}
                                    >
                                        {Object.keys(itemDefList).length > 0 && getSelectionList(itemDefList)}
                                    </TextField>
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={copyAttributes}
                                                onChange={() => { setCopyAttributes(!copyAttributes); }}
                                                color='primary'
                                                disabled={codeListOid === undefined}
                                                value='copyAttributes'
                                            />
                                        }
                                        label="Copy Attributes"
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label='Attributes'
                                        value={selectedAttributes}
                                        multiline
                                        select
                                        SelectProps={{ multiple: true }}
                                        disabled={!copyAttributes}
                                        onChange={(event) => { setSelectedAttributes(event.target.value); }}
                                        className={classes.attributeField}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton
                                                        color={selectedAttributes.length > 0 ? 'primary' : 'default'}
                                                        onClick={handleSelectAllClick}
                                                        disabled={!copyAttributes}
                                                    >
                                                        <DoneAll />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    >
                                        {getSelectionList(attrList)}
                                    </TextField>
                                </Grid>
                            </Grid>
                        )}
                        { Object.keys(itemDefList).length === 0 && (
                            <Typography variant="body2" gutterBottom align="left" color='error'>
                                This dataset contains no variables with attached decoded or enumerated codelist.
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        { codeListOid !== undefined &&
                                <CodedValueSelectorTable
                                    key={codeListOid}
                                    onAdd={onAddVlm}
                                    addLabel='Create VLM'
                                    sourceCodeList={codeLists[codeListOid]}
                                    defineVersion={defineVersion}
                                />
                        }
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}

export default withStyles(styles)(AddVlmFromCodeList);
