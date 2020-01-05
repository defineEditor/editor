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
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import getCodeListData from 'utils/getCodeListData.js';
import GeneralTable from 'components/utils/generalTable.js';
import {
    closeModal,
    selectGroup,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    dialog: {
        position: 'absolute',
        top: '5%',
        maxWidth: 1200,
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
        letterSpacing: '0.0075em',
    },
    content: {
        padding: 0,
        display: 'flex',
    }
}));

const ModalCodeListTable = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();
    let codeLists = useSelector(state => state.present.odm.study.metaDataVersion.codeLists);
    let defineVersion = useSelector(state => state.present.odm.study.metaDataVersion.defineVersion);
    let codedValuesTabIndex = useSelector(state => state.present.ui.tabs.tabNames.indexOf('Coded Values'));
    let codeList = codeLists[props.codeListOid];

    let data = [];
    let header = [];

    let codeListTable, codeListTitle, isDecoded, isRanked, isCcoded;
    if (codeList) {
        if (codeList.codeListType === 'external') {
            codeListTitle = codeList.name;
            header = [
                { id: 'dictionary', label: 'Dictionary', key: true },
                { id: 'version', label: 'Version' },
                { id: 'ref', label: 'Ref' },
                { id: 'Href', label: 'Href' },
            ];
            data.push(codeList.externalCodeList);
        } else {
            ({ codeListTable, codeListTitle, isDecoded, isRanked, isCcoded } = getCodeListData(codeList, defineVersion));
            data = codeListTable;

            header = [
                { id: 'oid', label: 'oid', hidden: true, key: true },
                { id: 'value', label: 'Coded Value' },
            ];

            if (isDecoded === true) {
                header.push({ id: 'decode', label: 'Decode' });
            }

            if (isCcoded === true) {
                header.push({ id: 'ccode', label: 'C-Code' });
            }

            if (isRanked === true) {
                header.push({ id: 'rank', label: 'Rank' });
            }
        }
    }

    const onClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            onClose();
        }
    };

    const goToCodeList = () => {
        let updateObj = {
            tabIndex: codedValuesTabIndex,
            groupOid: props.codeListOid,
            scrollPosition: {},
        };
        dispatch(selectGroup(updateObj));
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
                {codeListTitle}
            </DialogTitle>
            <DialogContent className={classes.content}>
                <GeneralTable
                    data={data}
                    header={header}
                    pagination
                    disableToolbar
                    rowsPerPageOptions={[25, 50, 100]}
                />
            </DialogContent>
            <DialogActions>
                { codeList.codeListType !== 'external' && (
                    <Button onClick={goToCodeList} color="primary">
                        Go To Codelist
                    </Button>
                )}
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ModalCodeListTable.propTypes = {
    codeListOid: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
};

export default ModalCodeListTable;
