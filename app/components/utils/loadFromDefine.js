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
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import ItemFilter from 'components/utils/itemFilter.js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import getItemsFromFilter from 'utils/getItemsFromFilter.js';

const getStyles = makeStyles(theme => ({
    dialog: {
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
    title: {
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1.25rem',
        lineHeight: '1.6',
        letterSpacing: '0.0075em',
    },
}));

const types = ['dataset', 'variable', 'codeList', 'codedValue'];
const typeLabels = ['datasets', 'variables', 'codelists', 'coded values'];
const attributes = {
    dataset: ['dataset', 'label', 'class'],
    variable: ['dataset', 'name', 'label'],
    codeList: ['name', 'type'],
    codedValue: ['codelist', 'codedValue'],
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
    conditions: [{ field: 'codeList', comparator: 'IN', selectedValues: [], regexIsValid: true }],
    connectors: [],
};

const LoadFromDefine = (props) => {
    let classes = getStyles();
    const mdv = useSelector(state => state.present.odm.study.metaDataVersion);
    const defineVersion = mdv.defineVersion;

    const [filters, setFilters] = useState({
        dataset: varDefault,
        variable: varDefault,
        codeList: clDefault,
        codedValue: clDefault,
    });

    const [type, setType] = useState('dataset');
    const [showFilter, setShowFilter] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState({
        dataset: [],
        variable: [],
        codeList: [],
        codedValue: [],
    });

    const [selectedItems, setSelectedItems] = useState({
        dataset: [],
        variable: [],
        codeList: [],
        codedValue: [],
    });

    const [selectedItemNum, setSelectedItemNum] = useState({
        dataset: 0,
        variable: 0,
        codeList: 0,
        codedValue: 0,
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
        setFilters({ ...filters, [filter.type]: filter });
        let items = getItemsFromFilter(filter, mdv, defineVersion);
        if (filter.type === 'codedValue') {
            let codedValueNum = Object.values(mdv.codeLists)
                .filter(codeList => items.includes(codeList.oid) && codeList.itemOrder)
                .map(codeList => codeList.itemOrder.length)
                .reduce((i, j) => (i + j), 0)
            ;
            codedValueNum = codedValueNum || 0;
            setSelectedItemNum({ ...selectedItemNum, [filter.type]: codedValueNum });
        } else {
            setSelectedItemNum({ ...selectedItemNum, [filter.type]: items.length });
        }
        setSelectedItems({ ...selectedItems, [filter.type]: items });
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
                <DialogTitle className={classes.title} disableTypography>
                    Choose items and attributes
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <Grid container spacing={2} alignItems='flex-start'>
                        { types.map(curType => (
                            <Grid item key={curType} xs={12}>
                                <Grid container wrap='nowrap' justify='space-between'>
                                    <Grid item>
                                        <Button
                                            color={selectedItemNum[curType] > 0 ? 'primary' : 'default'}
                                            variant='contained'
                                            onClick={() => openFilter(curType)}
                                            className={classes.button}
                                        >
                                            {`${selectedItemNum[curType]} ${typeLabels[types.indexOf(curType)]}`}
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
                <ItemFilter
                    type={type}
                    filter={filters[type]}
                    onClose={ () => { setShowFilter(false); } }
                    onUpdate={onFilterUpdate}
                />
            }
        </React.Fragment>
    );
};

export default LoadFromDefine;
