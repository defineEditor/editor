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
import TextField from '@material-ui/core/TextField';
import ItemFilter from 'components/utils/itemFilter.js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DoneAll from '@material-ui/icons/DoneAll';
import InputAdornment from '@material-ui/core/InputAdornment';
import getItemsFromFilter from 'utils/getItemsFromFilter.js';
import getSelectionList from 'utils/getSelectionList.js';
import getCodeListData from 'utils/getCodeListData.js';

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
    attributeField: {
        marginRight: theme.spacing(4),
        marginLeft: theme.spacing(1),
        minWidth: 300,
        maxWidth: 500,
    },
}));

const escapeValue = (value) => {
    if (typeof value === 'string' && value.includes(',')) {
        value = '"' + value.replace('"', '""') + '"';
    } else {
        return value;
    }
};

const types = ['dataset', 'variable', 'codeList', 'codedValue'];
const typeLabels = ['datasets', 'variables', 'codelists', 'coded values'];
const attributes = {
    dataset: ['label', 'class', 'fileName', 'domain', 'datasetName', 'repeating', 'isReferenceData', 'purpose', 'structure', 'alias'],
    variable: ['label', 'dataType', 'length', 'fractionDigits', 'fieldName', 'displayFormat', 'note', 'lengthAsData', 'lengthAsCodeList', 'origin'],
    codeList: ['type', 'dataType', 'formatName'],
    codedValue: ['decode', 'rank'],
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

    const handleAttributeChange = (type) => (event) => {
        setSelectedAttributes({ ...selectedAttributes, [type]: event.target.value });
    };

    const handleSelectAllClick = (type) => (event) => {
        if (selectedAttributes[type].length !== attributes[type].length) {
            setSelectedAttributes({ ...selectedAttributes, [type]: attributes[type] });
        } else {
            setSelectedAttributes({ ...selectedAttributes, [type]: [] });
        }
    };

    const openFilter = (type) => {
        setType(type);
        setShowFilter(true);
    };

    const handleLoad = () => {
        let varData, dsData, codeListData, codedValueData;
        // Coded Values
        let rawCodedValues = [];
        mdv.order.codeListOrder
            .filter(codeListOid => selectedItems['codedValue'].includes(codeListOid))
            .forEach(codeListOid => {
                let codeList = mdv.codeLists[codeListOid];
                let data = getCodeListData(codeList, defineVersion);
                if (data !== undefined && data.codeListTable) {
                    data.codeListTable.forEach(row => {
                        let item = {};
                        item.codeList = codeList.name;
                        item.codedValue = row.value;
                        Object.keys(row).forEach(rowAttr => {
                            if (selectedAttributes['codedValue'].includes(rowAttr)) {
                                item[rowAttr] = row[rowAttr];
                            }
                        });
                        rawCodedValues.push(item);
                    });
                }
            });
        let codedValueAttrs = [];
        rawCodedValues.forEach(item => {
            codedValueAttrs.push(Object.values(item).map(item => escapeValue(item)).join(','));
        });
        if (codedValueAttrs.length > 0) {
            codedValueAttrs.unshift(Object.keys(rawCodedValues[0]).join(','));
            codedValueData = codedValueAttrs.join('\n');
        }
        props.onFinish(varData, dsData, codeListData, codedValueData);
        handleClose();
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
                                        <TextField
                                            label='Attributes'
                                            value={selectedAttributes[curType]}
                                            multiline
                                            select
                                            SelectProps={{ multiple: true }}
                                            onChange={handleAttributeChange(curType)}
                                            className={classes.attributeField}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconButton
                                                            color={selectedAttributes.length > 0 ? 'primary' : 'default'}
                                                            onClick={handleSelectAllClick(curType)}
                                                        >
                                                            <DoneAll />
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        >
                                            {getSelectionList(attributes[curType])}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )) }
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLoad} color="primary">
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
