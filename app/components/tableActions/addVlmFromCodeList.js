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

import React, { useState } from 'react';
/*
import store from 'store/index.js';
import { withStyles } from '@material-ui/core/styles';
import CodedValueSelectorTable from 'components/utils/codedValueSelectorTable.js';
import getSelectionList from 'utils/getSelectionList.js';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
*/
import Dialog from '@material-ui/core/Dialog';
/*
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

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
        width: '50%',
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

    const handleChange = () => (updateObj) => {
        setCodeListOid(updateObj.target.value);
    };

    // retrieve codelists for dropdown list into an object
    let codeLists = { ...store.getState().present.odm.study.metaDataVersion.codeLists };
    let codeListList = Object.keys(codeLists)
        .filter(codeList => codeLists[codeList].codeListType === 'decoded')
        .reduce((object, key) => { object[key] = codeLists[key].name; return object; }, {});

    // create state variable for selected codeListOid
    const [codeListOid, setCodeListOid] = useState('test');

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
                Add Value Level Metadata from a Codelist
            </DialogTitle>
            <DialogContent>
                <TextField
                    label='Codelist'
                    disabled={Object.keys(codeListList).length === 0}
                    value={codeListOid}
                    onChange={handleChange()}
                    className={classes.selectionField}
                    select={Object.keys(codeListList).length > 0}
                >
                    { Object.keys(codeListList).length > 0 && getSelectionList(codeListList)}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={props.onCancel}
                    color='primary'
                    disabled={true}
                >
                    Add VLM
                </Button>
                <Button onClick={props.onCancel} color='primary'>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const AddVlmFromCodeList = withStyles(styles)(ConnectedAddVlmFromCodeList);

export default AddVlmFromCodeList;
*/

// copy of the hooks introduction example: to delete
function AddVlmFromCodeList () {
    // Declare a new state variable, which we'll call "count"
    const [count, setCount] = useState(0);

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open
            fullWidth
            maxWidth={false}
            tabIndex='0'
        >
            <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>
                    Click me
                </button>
            </div>
        </Dialog>
    );
}
export default AddVlmFromCodeList;
