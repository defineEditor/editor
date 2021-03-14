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

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import clone from 'clone';
import CodedValueSelectorTable from 'components/utils/codedValueSelectorTable.js';
import { addCodedValues } from 'actions/index.js';

const getForcedClasses = makeStyles(theme => ({
    root: {
        display: 'flex',
        width: '100%',
        overflowX: 'auto'
    },
    codeListTable: {
    },
    tableBody: {
        width: '100%',
        height: '95%',
        display: 'flex',
    },
    table: {
        minWidth: 100
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing(1)
    },
    iconButton: {
        marginLeft: '0px',
        marginRight: '0px',
        marginBottom: '8px'
    },
    toolbar: {
        backgroundColor: theme.palette.primary.main,
        width: '100%',
        minHeight: 70,
    },
    selector: {
        width: '100%',
    },
    searchField: {
        marginTop: '0',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
    searchInput: {
        paddingTop: '9px',
        paddingBottom: '9px',
        color: '#FFFFFF',
    },
    searchLabel: {
        transform: 'translate(10px, 10px)',
        color: '#FFFFFF',
    },
    shrinkLabel: {
        color: '#FFFFFF',
    },
    focusedLabel: {
        color: '#FFFFFF',
    }
}));

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
}));

const CodedValueSelector = (props) => {
    const { sourceCodeList, codeList } = props;
    const defineVersion = useSelector(state => state.present.odm.study.metaDataVersion.defineVersion);
    const dispatch = useDispatch();
    const classes = getStyles();
    const handleAddCodedValues = (selected) => {
        // Get items which are copied from the standard
        let sourceItems;
        if (props.sourceCodeList.codeListType === 'decoded') {
            sourceItems = props.sourceCodeList.codeListItems;
        } else if (props.sourceCodeList.codeListType === 'enumerated') {
            sourceItems = props.sourceCodeList.enumeratedItems;
        }
        let items = [];
        selected.forEach(oid => {
            items.push(clone(sourceItems[oid]));
        });
        dispatch(addCodedValues(props.codeList.oid, {
            items,
            orderNumber: props.orderNumber
        }));
        props.onClose();
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            props.onClose();
        }
    };

    const Title = () => {
        return (
            <div className={classes.title}>
                Add Codes Values
            </div>
        );
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
            </DialogTitle>
            <DialogContent className={classes.content}>
                <CodedValueSelectorTable
                    onAdd={handleAddCodedValues}
                    onClose={props.onClose}
                    sourceCodeList={sourceCodeList}
                    defineVersion={defineVersion}
                    codeList={codeList}
                    codeListSelector={Title}
                    forcedClasses={getForcedClasses()}
                    searchVariant='filled'
                />
            </DialogContent>
        </Dialog>
    );
};

CodedValueSelector.propTypes = {
    classes: PropTypes.object.isRequired,
    sourceCodeList: PropTypes.object.isRequired,
    codeList: PropTypes.object.isRequired,
    orderNumber: PropTypes.number,
    onClose: PropTypes.func.isRequired
};

export default CodedValueSelector;
