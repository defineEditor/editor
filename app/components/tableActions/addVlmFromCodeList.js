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
import store from 'store/index.js';
import { withStyles } from '@material-ui/core/styles';
import CodedValueSelectorTable from 'components/utils/codedValueSelectorTable.js';
import getSelectionList from 'utils/getSelectionList.js';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import InternalHelp from 'components/utils/internalHelp.js';
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
    dialog: {
        position: 'absolute',
        top: '10%',
        maxHeight: '80%',
        width: '80%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    title: {
        marginTop: theme.spacing.unit,
        paddingBottom: 0,
    },
});

function ConnectedAddVlmFromCodeList (props) {
    const { classes } = props;

    // create state variables for selected codeListOid to take selectedCodes from
    const [codeListOid, setCodeListOid] = useState(undefined);
    const [selectedCodes, setSelectedCodes] = useState([]);

    // retrieve data from state
    let codeLists = { ...store.getState().present.odm.study.metaDataVersion.codeLists };
    let defineVersion = store.getState().present.odm.study.metaDataVersion.defineVersion;

    // create object for dropdown list
    let codeListList = Object.keys(codeLists)
        .filter(codeList => codeLists[codeList].codeListType === 'decoded')
        .reduce((object, key) => { object[key] = codeLists[key].name; return object; }, {});

    useEffect(() => {
        if (selectedCodes.length !== 0) {
            let valueLists = store.getState().present.odm.study.metaDataVersion.valueLists;
            let itemDefs = store.getState().present.odm.study.metaDataVersion.itemDefs;
            let whereClauses = store.getState().present.odm.study.metaDataVersion.whereClauses;

            // create an object with all VLM attributes
            let updateObj = selectedCodes.reduce((object, key) => {
                object['itemDefOids'].push(getOid('ItemDef', undefined, Object.keys(itemDefs).concat(object['itemDefOids'])));
                object['whereClauseOids'].push(getOid('WhereClause', undefined, Object.keys(whereClauses).concat(object['whereClauseOids'])));
                return object;
            }, { sourceOid: undefined, valueListOid: undefined, itemDefOids: [], whereClauseOids: [] });
            updateObj['valueListOid'] = getOid('ValueList', undefined, Object.keys(valueLists));
            updateObj['sourceOid'] = props.currentItemOid;

            store.dispatch(addValueListFromCodelist(updateObj));
            props.onCancel();
        }
    }, [selectedCodes]);

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
                        Create Value Level Metadata from a Codelist
                        <InternalHelp data={ CODELIST_TO_VLM } />
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
                <Grid container spacing={8} className={classes.root}>
                    <Grid item>
                        <TextField
                            label='Codelist'
                            disabled={Object.keys(codeListList).length === 0}
                            value={codeListOid || ' '}
                            onChange={(updateObj) => setCodeListOid(updateObj.target.value)}
                            className={classes.selectionField}
                            select={Object.keys(codeListList).length > 0}
                        >
                            { Object.keys(codeListList).length > 0 && getSelectionList(codeListList)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        { codeListOid !== undefined &&
                                <CodedValueSelectorTable
                                    key={codeListOid}
                                    onAdd={(selectedCodes) => { setSelectedCodes(selectedCodes); } }
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

const AddVlmFromCodeList = withStyles(styles)(ConnectedAddVlmFromCodeList);

export default AddVlmFromCodeList;
