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
import { useSelector, useDispatch } from 'react-redux';
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
import { getDescription, getWhereClauseAsText } from 'utils/defineStructureUtils.js';
import { openSnackbar } from 'actions/index.js';

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
    if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
        return '"' + value.replace(/"/g, '""') + '"';
    } else {
        return value;
    }
};

const types = ['dataset', 'variable', 'codeList', 'codedValue'];
const typeLabels = ['datasets', 'variables', 'codelists', 'coded values'];
const attributes = {
    dataset: ['label', 'class', 'domain', 'domainDescription', 'sasDatasetName',
        'repeating', 'isReferenceData', 'hasNoData', 'purpose', 'structure', 'comment', 'note', 'fileName', 'fileTitle'
    ],
    variable: ['label', 'whereClause', 'dataType', 'length', 'fractionDigits', 'sasFieldName', 'codeList',
        'displayFormat', 'role', 'mandatory', 'comment', 'method', 'methodName', 'note', 'lengthAsData', 'lengthAsCodeList', 'originType', 'originDescription', 'crfPages'
    ],
    codeList: ['type', 'dataType', 'formatName'],
    codedValue: ['decode', 'rank'],
};

const LoadFromDefine = (props) => {
    let classes = getStyles();
    const dispatch = useDispatch();
    const mdv = useSelector(state => state.present.odm.study.metaDataVersion);
    const defineVersion = mdv.defineVersion;

    const { filters, setFilters, selectedAttributes, setSelectedAttributes,
        selectedItems, setSelectedItems, selectedItemNum, setSelectedItemNum
    } = props.selection;

    const [type, setType] = useState('dataset');
    const [showFilter, setShowFilter] = useState(false);

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
        try {
            let varData = '';
            let dsData = '';
            let codeListData = '';
            let codedValueData = '';
            // Datasets
            if (selectedItems['dataset'].length > 0) {
                let rawValues = [];
                // Rename some of the attributes
                let selectedAttrs = selectedAttributes['dataset'].map(attr => {
                    if (attr === 'sasDatasetName') {
                        return 'datasetName';
                    } else {
                        return attr;
                    }
                });
                let allAttrs = ['dataset'].concat(selectedAttributes['dataset']);
                mdv.order.itemGroupOrder
                    .filter(igOid => selectedItems['dataset'].includes(igOid))
                    .forEach(igOid => {
                        let dataset = mdv.itemGroups[igOid];
                        let item = {};
                        item.dataset = dataset.name;
                        Object.keys(dataset).forEach(rowAttr => {
                            if (selectedAttrs.includes(rowAttr)) {
                                if (rowAttr === 'datasetName') {
                                    item.sasDatasetName = dataset.datasetName;
                                } else {
                                    item[rowAttr] = dataset[rowAttr];
                                }
                            }
                        });
                        if (selectedAttrs.includes('domainDescription') && dataset.alias !== undefined) {
                            item.domainDescription = dataset.alias.name;
                        }
                        if (selectedAttrs.includes('label')) {
                            item.label = getDescription(dataset);
                        }
                        if (selectedAttrs.includes('class') && dataset.datasetClass !== undefined) {
                            item.class = dataset.datasetClass.name;
                        }
                        if (selectedAttrs.includes('fileName') && dataset.leaf !== undefined) {
                            item.fileName = dataset.leaf.href;
                        }
                        if (selectedAttrs.includes('fileTitle') && dataset.leaf !== undefined) {
                            item.fileTitle = dataset.leaf.title;
                        }
                        if (selectedAttrs.includes('comment') && dataset.commentOid !== undefined && mdv.comments[dataset.commentOid] !== undefined) {
                            let comment = mdv.comments[dataset.commentOid];
                            item.comment = getDescription(comment);
                        }
                        let finalItem = {};
                        allAttrs.forEach(attr => {
                            finalItem[attr] = item[attr];
                        });
                        rawValues.push(finalItem);
                    });
                let attrs = [];
                rawValues.forEach(item => {
                    attrs.push(Object.values(item).map(item => escapeValue(item)).join(','));
                });
                if (attrs.length > 0) {
                    attrs.unshift(Object.keys(rawValues[0]).join(','));
                    dsData = attrs.join('\n');
                }
            }
            // Variables
            if (selectedItems['variable'].length > 0) {
                let rawValues = [];
                // Rename some of the attributes
                let selectedAttrs = selectedAttributes['variable'].map(attr => {
                    if (attr === 'sasFieldName') {
                        return 'fieldName';
                    } else {
                        return attr;
                    }
                });
                let allAttrs = ['dataset', 'variable'].concat(selectedAttributes['variable']);
                // Get all datasets
                let allSelectedItemGroups = selectedItems['variable'].map(item => item.itemGroupOid);
                allSelectedItemGroups.filter((igOid, index) => allSelectedItemGroups.indexOf(igOid) === index);
                mdv.order.itemGroupOrder
                    .filter(igOid => allSelectedItemGroups.includes(igOid))
                    .forEach(igOid => {
                        let dataset = mdv.itemGroups[igOid];
                        let datasetItems = selectedItems['variable'].filter(item => (item.itemGroupOid === igOid));
                        datasetItems.forEach(datasetItem => {
                            const { itemDefOid, valueListOid } = datasetItem;
                            let itemDef = mdv.itemDefs[itemDefOid];
                            let valueList;
                            let isVlm = false;
                            if (valueListOid !== undefined) {
                                valueList = mdv.valueLists[valueListOid];
                                isVlm = true;
                            }
                            let itemRef;
                            if (isVlm) {
                                itemRef = Object.values(valueList.itemRefs).filter(itemRef => itemRef.itemOid === itemDefOid)[0];
                            } else {
                                itemRef = Object.values(dataset.itemRefs).filter(itemRef => itemRef.itemOid === itemDefOid)[0];
                            }

                            if (itemRef === undefined) {
                                console.log();
                            }
                            let item = {};
                            item.dataset = dataset.name;
                            if (isVlm && mdv.itemDefs[itemDef.parentItemDefOid] !== undefined) {
                                let parentItemDef = mdv.itemDefs[itemDef.parentItemDefOid];
                                item.variable = parentItemDef.name + '.' + itemDef.name;
                            } else {
                                item.variable = itemDef.name;
                            }
                            Object.keys(itemDef).forEach(rowAttr => {
                                if (selectedAttrs.includes(rowAttr)) {
                                    if (rowAttr === 'fieldName') {
                                        item.sasFieldName = itemDef.fieldName;
                                    } else {
                                        item[rowAttr] = itemDef[rowAttr];
                                    }
                                }
                            });
                            if (selectedAttrs.includes('label')) {
                                item.label = getDescription(itemDef);
                            }
                            if (selectedAttrs.includes('whereClause') && isVlm &&
                                itemRef.whereClauseOid !== undefined && mdv.whereClauses[itemRef.whereClauseOid] !== undefined
                            ) {
                                item.whereClause = getWhereClauseAsText(mdv.whereClauses[itemRef.whereClauseOid], mdv);
                            }
                            if (selectedAttrs.includes('mandatory')) {
                                item.mandatory = itemRef.mandatory;
                            }
                            if (selectedAttrs.includes('role')) {
                                item.role = itemRef.role;
                            }
                            if (selectedAttrs.includes('codeList') && itemDef.codeListOid !== undefined) {
                                item.codeList = mdv.codeLists[itemDef.codeListOid].name;
                            }
                            if (selectedAttrs.includes('originType') && itemDef.origins.length > 0) {
                                item.originType = itemDef.origins[0].type;
                            }
                            if (selectedAttrs.includes('originDescription') && itemDef.origins.length > 0) {
                                item.originDescription = getDescription(itemDef.origins[0]);
                            }
                            if (selectedAttrs.includes('crfPages') &&
                                itemDef.origins.length > 0 &&
                                itemDef.origins[0].documents &&
                                itemDef.origins[0].documents.length > 0
                            ) {
                                let document = itemDef.origins[0].documents[0];
                                // Check if the leaf is AnnotatedCRF
                                if (mdv.leafs[document.leafId] && mdv.leafs[document.leafId].type === 'annotatedCrf') {
                                    if (document.pdfPageRefs.length > 0) {
                                        let pdfPageRef = document.pdfPageRefs[0];
                                        if (pdfPageRef.pageRefs !== undefined) {
                                            item.crfPages = pdfPageRef.pageRefs;
                                        } else if (pdfPageRef.firstPage !== undefined && pdfPageRef.lastPage !== undefined) {
                                            item.crfPages = `${pdfPageRef.firstPage}-${pdfPageRef.lastPage}`;
                                        }
                                    }
                                }
                            }
                            if (selectedAttrs.includes('comment') && itemDef.commentOid !== undefined && mdv.comments[itemDef.commentOid] !== undefined) {
                                let comment = mdv.comments[itemDef.commentOid];
                                item.comment = getDescription(comment);
                            }
                            if (
                                (selectedAttrs.includes('method') || selectedAttrs.includes('methodName')) &&
                                itemRef.methodOid !== undefined && mdv.methods[itemRef.methodOid] !== undefined
                            ) {
                                let method = mdv.methods[itemRef.methodOid];
                                if (selectedAttrs.includes('method')) {
                                    item.method = getDescription(method);
                                }
                                if (selectedAttrs.includes('methodName')) {
                                    item.methodName = method.name;
                                }
                            }
                            let finalItem = {};
                            allAttrs.forEach(attr => {
                                finalItem[attr] = item[attr];
                            });
                            rawValues.push(finalItem);
                        });
                    });
                let attrs = [];
                rawValues.forEach(item => {
                    attrs.push(Object.values(item).map(item => escapeValue(item)).join(','));
                });
                if (attrs.length > 0) {
                    attrs.unshift(Object.keys(rawValues[0]).join(','));
                    varData = attrs.join('\n');
                }
            }
            // Codelist
            if (selectedItems['codeList'].length > 0) {
                let rawValues = [];
                // Rename some of the attributes
                let selectedAttrs = selectedAttributes['codeList'].map(attr => {
                    if (attr === 'type') {
                        return 'codeListType';
                    } else {
                        return attr;
                    }
                });
                let allAttrs = ['codeList'].concat(selectedAttributes['codeList']);
                mdv.order.codeListOrder
                    .filter(codeListOid => selectedItems['codeList'].includes(codeListOid))
                    .forEach(codeListOid => {
                        let codeList = mdv.codeLists[codeListOid];
                        let item = {};
                        item.codeList = codeList.name;
                        Object.keys(codeList).forEach(rowAttr => {
                            if (selectedAttrs.includes(rowAttr)) {
                                if (rowAttr === 'codeListType') {
                                    item.type = codeList[rowAttr];
                                } else {
                                    item[rowAttr] = codeList[rowAttr];
                                }
                            }
                        });
                        let finalItem = {};
                        allAttrs.forEach(attr => {
                            finalItem[attr] = item[attr];
                        });
                        rawValues.push(finalItem);
                    });
                let attrs = [];
                rawValues.forEach(item => {
                    attrs.push(Object.values(item).map(item => escapeValue(item)).join(','));
                });
                if (attrs.length > 0) {
                    attrs.unshift(Object.keys(rawValues[0]).join(','));
                    codeListData = attrs.join('\n');
                }
            }
            // Coded Values
            if (selectedItems['codedValue'].length > 0) {
                let rawValues = [];
                let selectedAttrs = selectedAttributes['codedValue'];
                let allAttrs = ['codeList', 'codedValue'].concat(selectedAttributes['codedValue']);
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
                                    if (selectedAttrs.includes(rowAttr)) {
                                        item[rowAttr] = row[rowAttr];
                                    }
                                });
                                let finalItem = {};
                                allAttrs.forEach(attr => {
                                    finalItem[attr] = item[attr];
                                });
                                rawValues.push(finalItem);
                            });
                        }
                    });
                let attrs = [];
                rawValues.forEach(item => {
                    attrs.push(Object.values(item).map(item => escapeValue(item)).join(','));
                });
                if (attrs.length > 0) {
                    attrs.unshift(Object.keys(rawValues[0]).join(','));
                    codedValueData = attrs.join('\n');
                }
            }
            props.onFinish(varData, dsData, codeListData, codedValueData);
            handleClose();
        } catch (error) {
            dispatch(
                openSnackbar({
                    type: 'error',
                    message: 'Error loading the data',
                })
            );
        }
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
                    allowReset
                />
            }
        </React.Fragment>
    );
};

export default LoadFromDefine;
