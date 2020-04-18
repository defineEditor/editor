/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2020 Dmitry Kolosov                                                *
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
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import VariableTabFilter from 'utils/variableTabFilter.js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const getStyles = makeStyles(theme => ({
    dialog: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        top: '10%',
        transform: 'translate(0%, calc(-10%+0.5px))',
        overflowX: 'none',
        maxHeight: '90%',
        maxWidth: '90%',
        width: 800,
        overflowY: 'auto'
    },
}));

const types = ['datasets', 'variables', 'codeLists', 'codedValues'];
const typeLabels = ['datasets', 'variables', 'codelists', 'coded values'];
const attributes = {
    datasets: ['name', 'label'],
    variables: ['dataset', 'name', 'label'],
    codeLists: ['name', 'type'],
    codedValues: ['codelist', 'codedValue'],
};

const varDefault = {
    isEnabled: false,
    applyToVlm: true,
    conditions: [{ field: 'dataset', comparator: 'IN', selectedValues: [], regexIsValid: true }],
    connectors: [],
};

const clDefault = {
    isEnabled: false,
    applyToVlm: true,
    conditions: [{ field: 'codelist', comparator: 'IN', selectedValues: [], regexIsValid: true }],
    connectors: [],
};

const LoadFromDefine = (props) => {
    let classes = getStyles();

    const [filters, setFilters] = useState({
        datasets: varDefault,
        variables: varDefault,
        codeLists: clDefault,
        codedValues: clDefault,
    });

    const [type, setType] = useState('datasets');
    const [showFilter, setShowFilter] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState({
        datasets: [],
        variables: [],
        codeLists: [],
        codedValues: [],
    });

    const handleClose = () => {
        props.onClose();
    };

    const handleAttributeChange = (type) => (event, options) => {
        setSelectedAttributes({ ...selectedAttributes, [type]: options });
    };

    const openFilter = (type) => {
        setType(type);
        setShowFilter(true);
    };

    const onFilterUpdate = (filter) => {
        setFilters({ ...filters, [type]: filter });
        setShowFilter(false);
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            handleClose();
        }
    };

    return (
        <React.Fragment>
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                PaperProps={{ className: classes.dialog }}
                onKeyDown={onKeyDown}
                tabIndex='0'
            >
                <DialogTitle>
                    Choose items and attributes
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <Grid container spacing={2} alignItems='flex-start'>
                        { types.map(curType => (
                            <Grid item key={curType} xs={12}>
                                <Grid container wrap='nowrap' justify='space-between'>
                                    <Grid item>
                                        <Button
                                            color='default'
                                            variant='contained'
                                            onClick={() => openFilter(curType)}
                                            className={classes.button}
                                        >
                                            0 {typeLabels[types.indexOf(curType)]}
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Autocomplete
                                            clearOnEscape={false}
                                            multiple
                                            onChange={handleAttributeChange(curType)}
                                            value={selectedAttributes[curType]}
                                            disableCloseOnSelect
                                            filterSelectedOptions
                                            options={attributes[curType]}
                                            renderInput={params => (
                                                <TextField
                                                    {...params}
                                                    label='Attributes'
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        )) }
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose} color="primary">
                        Load
                    </Button>
                    <Button onClick={props.onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            { showFilter &&
                <VariableTabFilter
                    filter={filters[type]}
                    onClose={ () => { setShowFilter(false); } }
                    onUpdate={onFilterUpdate}
                />
            }
        </React.Fragment>
    );
};

export default LoadFromDefine;
