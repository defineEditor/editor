/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import AutocompleteSelectEditor from 'editors/autocompleteSelectEditor.js';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import GeneralTable from 'components/utils/generalTable.js';
import getMethodSourceLabels from 'utils/getMethodSourceLabels.js';
import getSourceLabels from 'utils/getSourceLabels.js';
import compareMethods from 'utils/compareMethods.js';
import compareComments from 'utils/compareComments.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import {
    closeModal,
    removeDuplicateComments,
    removeDuplicateMethods,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    dialog: {
        position: 'absolute',
        top: '5%',
        maxWidth: 1500,
        height: '90%',
        width: '95%',
        overflowX: 'auto',
        overflowY: 'auto',
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        display: 'flex',
    },
    title: {
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1.25rem',
        lineHeight: '1.6',
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        letterSpacing: '0.0075em',
    },
    content: {
        padding: 0,
        display: 'flex',
    },
    list: {
        width: '100%',
    },
}));

const getDuplicateComments = (mdv) => {
    const result = {};
    const allDuplicates = [];
    Object.keys(mdv.comments).forEach((commentOid1, index1) => {
        const comment1 = mdv.comments[commentOid1];
        Object.keys(mdv.comments).forEach((commentOid2, index2) => {
            if (index1 >= index2 || allDuplicates.includes(commentOid2)) {
                // Already compared
                return;
            }
            const comment2 = mdv.comments[commentOid2];
            if (compareComments(comment1, comment2)) {
                allDuplicates.push(commentOid2);
                if (result[commentOid1] === undefined) {
                    result[commentOid1] = [commentOid2];
                } else {
                    result[commentOid1].push(commentOid2);
                }
            }
        });
    });
    return result;
};

const getDuplicateMethods = (mdv) => {
    const result = {};
    const allDuplicates = [];
    Object.keys(mdv.methods).forEach((methodOid1, index1) => {
        const method1 = mdv.methods[methodOid1];
        Object.keys(mdv.methods).forEach((methodOid2, index2) => {
            if (index1 >= index2 || allDuplicates.includes(methodOid2)) {
                // Already compared
                return;
            }
            const method2 = mdv.methods[methodOid2];
            if (compareMethods(method1, method2, { ignoreName: true })) {
                allDuplicates.push(methodOid2);
                if (result[methodOid1] === undefined) {
                    result[methodOid1] = [methodOid2];
                } else {
                    result[methodOid1].push(methodOid2);
                }
            }
        });
    });
    return result;
};

const uniteSources = (sources1, sources2) => {
    let result;
    if (Array.isArray(sources1)) {
        result = sources1;
        sources2.forEach(item => {
            if (!result.includes(item)) {
                result.push(item);
            }
        });
    } else if (typeof sources1 === 'object') {
        result = { ...sources2, ...sources1 };
        Object.keys(sources1).forEach(prop => {
            if (sources2.hasOwnProperty(prop)) {
                result[prop] = uniteSources(sources1[prop], sources2[prop]);
            }
        });
    }
    return result;
};

const getTableData = (mdv, itemType, duplicates) => {
    let items;
    const data = [];
    let unitedSources = {};

    // Get table header;
    const header = [
        { id: 'id', label: 'oid', hidden: true, key: true },
        { id: 'text', label: 'Description' },
        { id: 'sources', label: 'Used By', style: { whiteSpace: 'pre-wrap' } },
        { id: 'numDuplicates', label: 'Number of Duplicates' },
    ];
    if (itemType === 'Comment') {
        items = mdv.comments;
    } else if (itemType === 'Method') {
        items = mdv.methods;
    }

    // Get table data;
    Object.keys(duplicates).forEach(id => {
        let item = items[id];
        // Get all sources
        let allIds = duplicates[id].concat([id]);
        unitedSources[id] = item.sources;

        allIds.forEach(subId => {
            let subItem = items[subId];
            unitedSources[id] = uniteSources(unitedSources[id], subItem.sources);
        });
        let sources;
        if (itemType === 'Method') {
            sources = getMethodSourceLabels(unitedSources[id], mdv).labelParts.join('\n');
            data.push({ id, name: item.name, text: getDescription(item), sources, numDuplicates: duplicates[id].length });
        } else if (itemType === 'Comment') {
            sources = getSourceLabels(unitedSources[id], mdv).labelParts.join('\n');
            data.push({ id, text: getDescription(item), sources, numDuplicates: duplicates[id].length });
        }
    });

    return { data, header, unitedSources };
};

const ModalRemoveDuplicates = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();
    let mdv = useSelector(state => state.present.odm.study.metaDataVersion);
    const [data, setData] = useState({});
    const [selected, setSelected] = useState([]);

    let dataLoaded = Boolean(data && data.mainData && data.mainData.data);

    useEffect(() => {
        let duplicates = {};
        let methodNames = {};
        if (props.itemType === 'Comment') {
            duplicates = getDuplicateComments(mdv);
        } else if (props.itemType === 'Method') {
            duplicates = getDuplicateMethods(mdv);
            // Get all method names for each unique method id
            Object.keys(duplicates).forEach(methodOid => {
                let allMethodIds = duplicates[methodOid].concat([methodOid]);
                let names = allMethodIds.map(id => mdv.methods[id].name);
                // Remove duplicate or blank rows
                names = names.filter((name, index) => {
                    return names.indexOf(name) === index && Boolean(name) !== false;
                });
                // Add a special value which will set method name automatically
                names.push('Set Method Name Automatically');
                methodNames[methodOid] = names;
            });
        }
        let mainData = getTableData(mdv, props.itemType, duplicates);
        setSelected(Object.keys(duplicates));
        setData({ duplicates, mainData, methodNames });
    }, [mdv, props.itemType]);

    const onClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            onClose();
        }
    };

    const handleNameUpdate = (id) => (event, value) => {
        let newTableData = data.mainData.data.slice();
        newTableData.forEach(row => {
            if (row.id === id) {
                row.name = value;
            }
        });
        let newData = { ...data, mainData: { ...data.mainData, data: newTableData } };
        setData(newData);
    };

    const methodNameEditor = (props) => {
        return (
            <AutocompleteSelectEditor
                onChange={handleNameUpdate(props.row.id)}
                value={props.row.name}
                autoSelect
                options={data.methodNames[props.row.id]}
                disableClearable
                margin='dense'
                freeSolo
                autoFocus
            />
        );
    };

    let updatedHeader;
    if (dataLoaded) {
        if (props.itemType === 'Method') {
            updatedHeader = data.mainData.header.slice();
            updatedHeader.unshift({ id: 'name', label: 'Name', style: { minWidth: '220px' }, formatter: methodNameEditor });
        } else {
            updatedHeader = data.mainData.header;
        }
    }

    const onUnite = () => {
        // Keep only selected ids
        let updateObj = {
            unitedSources: {},
            duplicates: {}
        };
        selected.forEach(id => {
            updateObj.unitedSources[id] = data.mainData.unitedSources[id];
            updateObj.duplicates[id] = data.duplicates[id];
        });
        if (props.itemType === 'Comment') {
            dispatch(removeDuplicateComments(updateObj));
        } else if (props.itemType === 'Method') {
            // Collect name of methods that have changed
            let changedNames = {};
            Object.keys(updateObj.duplicates).forEach(methodOid => {
                // Find name in table data
                let tableName;
                data.mainData.data.some(row => {
                    if (row.id === methodOid) {
                        tableName = row.name;
                        return true;
                    }
                });
                if (tableName === 'Set Method Name Automatically') {
                    changedNames[methodOid] = '';
                } else if (mdv.methods[methodOid].name !== tableName) {
                    changedNames[methodOid] = tableName;
                }
            });
            updateObj.changedNames = changedNames;
            dispatch(removeDuplicateMethods(updateObj));
        }
        onClose();
    };

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open
            PaperProps={{ className: classes.dialog }}
            onKeyDown={onKeyDown}
            tabIndex='0'
        >
            <DialogTitle className={classes.title} disableTypography>
                Remove Duplicate {props.itemType}s
            </DialogTitle>
            <DialogContent className={classes.content}>
                { dataLoaded && (
                    <GeneralTable
                        data={data.mainData.data}
                        header={updatedHeader}
                        selection={{ selected, setSelected }}
                        disableRowSelection
                        pagination
                        disableToolbar
                        initialRowsPerPage={50}
                        rowsPerPageOptions={[25, 50, 100]}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onUnite} disabled={selected.length === 0} color="primary">
                    Unite
                </Button>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ModalRemoveDuplicates.propTypes = {
    type: PropTypes.string.isRequired,
    itemType: PropTypes.string.isRequired,
};

export default ModalRemoveDuplicates;
