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

import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import Loading from 'components/utils/loading.js';
import SearchInTable from 'components/utils/searchInTable.js';
import GeneralTable from 'components/utils/generalTable.js';
import { getGeneralTableDataFromCodeList } from 'utils/codeListUtils.js';
import { dummyRequest } from 'utils/cdiscLibraryUtils.js';
import { getDecode } from 'utils/defineStructureUtils.js';
import {
    closeModal,
    selectGroup,
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
}));

const getSearchStyles = makeStyles(theme => ({
    searchField: {
        marginTop: '0',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
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

const loadFromStdCodeList = (codeLists, codeListOid) => {
    let codeList = codeLists[codeListOid];
    let codeListType = codeList.codeListType;
    let data = [];
    let header = [];

    let codeListTitle;
    if (codeList.alias !== undefined) {
        codeListTitle = codeList.name + ' (' + codeList.alias.name + ')';
    } else {
        codeListTitle = codeList.name;
    }

    if (codeList) {
        header = [
            { id: 'conceptId', label: 'oid', hidden: true, key: true },
            { id: 'submissionValue', label: 'Coded Value' },
            { id: 'preferredTerm', label: 'Preferred Term' },
            { id: 'definition', label: 'Definition', style: { maxWidth: 500 } },
            { id: 'joinedSynonyms', label: 'Synonyms' },
            { id: 'conceptId', label: 'C-Code', style: { minWidth: 90 } },
        ];
        data = codeList.itemOrder.map((itemOid, index) => {
            let item = codeList.codeListItems[itemOid];
            let conceptId;
            if (item.alias.name !== undefined) {
                conceptId = item.alias.name;
            }
            let joinedSynonyms;
            if (item.synonyms && Array.isArray(item.synonyms)) {
                joinedSynonyms = item.synonyms.join(', ');
            }
            return ({
                submissionValue: item.codedValue,
                definition: item.definition,
                preferredTerm: getDecode(item),
                joinedSynonyms,
                conceptId,
            });
        });
    }

    return {
        codeListTitle,
        codeListType,
        data,
        header,
    };
};

const ModalCodeListTable = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();
    let searchClasses = getSearchStyles();
    let odm = useSelector(state => state.present.odm);
    let stdCodeLists = useSelector(state => state.present.stdCodeLists);
    const [tableData, setTableData] = useState({});
    const [currentData, setCurrentData] = useState();
    const [retry, setRetry] = useState(0);

    let cl = useContext(CdiscLibraryContext).cdiscLibrary;

    useEffect(() => {
        const loadFromCdiscLibrary = async (itemInfo) => {
            let data, header, codeListTitle;
            let product = await cl.getFullProduct(itemInfo.productId);
            let itemGroup = await product.getItemGroup(itemInfo.itemGroupName);
            let item = Object.values(itemGroup.getItems()).filter(item => item.name === itemInfo.itemName)[0];
            let codeList = await item.getCodeList();

            header = [
                { id: 'conceptId', label: 'oid', hidden: true, key: true },
                { id: 'submissionValue', label: 'Coded Value' },
                { id: 'preferredTerm', label: 'Preferred Term' },
                { id: 'definition', label: 'Definition', style: { maxWidth: 500 } },
                { id: 'joinedSynonyms', label: 'Synonyms' },
                { id: 'conceptId', label: 'C-Code', style: { minWidth: 90 } },
            ];

            let packageId = codeList.href.replace(/\/mdr\/ct\/packages\/(.*?)\/.*/, '$1');
            let ctInfo = await cl.getFullProduct(packageId, true);

            data = codeList.getFormattedTerms();
            data = data.map(row => {
                if (row.synonyms && Array.isArray(row.synonyms)) {
                    return { ...row, joinedSynonyms: row.synonyms.join(', ') };
                } else {
                    return row;
                }
            });

            codeListTitle = `${codeList.name} (${codeList.conceptId}) ${ctInfo.model} ${ctInfo.version}`;

            setTableData({
                codeListTitle,
                codeListType: 'decoded',
                data,
                header,
            });
        };

        if (props.itemInfo) {
            // Need to load codelist from the CDISC Library
            loadFromCdiscLibrary(props.itemInfo);
        } else {
            let codeLists;
            if (props.stdCodeListOid) {
                let stdCodeList = stdCodeLists[props.stdCodeListOid];
                codeLists = stdCodeList.codeLists;
                setTableData(loadFromStdCodeList(codeLists, props.codeListOid));
            } else {
                codeLists = odm.study.metaDataVersion.codeLists;
                let defineVersion = odm.study.metaDataVersion.defineVersion;
                setTableData(getGeneralTableDataFromCodeList(codeLists[props.codeListOid], defineVersion));
            }
        }
    }, [props, odm, stdCodeLists, cl, retry]);

    useEffect(() => {
        setCurrentData(tableData.data);
    }, [tableData]);

    // As bug workaround, send a dummy request in 2 seconds if the object did not load
    useEffect(() => {
        let timer;
        if (process.platform === 'linux') {
            timer = setTimeout(() => {
                if (tableData.data === undefined) {
                    dummyRequest(cl);
                }
            }, 2000);
        }

        return () => {
            if (process.platform === 'linux') {
                clearTimeout(timer);
            }
        };
    }, [tableData, cl]);

    let { codeListTitle, codeListType, data, header } = tableData;

    if (props.stdCodeListOid) {
        let stdCodeList = stdCodeLists[props.stdCodeListOid];
        codeListTitle += ` ${stdCodeList.type} ${stdCodeList.version}`;
    }

    const onClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            onClose();
        }
    };

    let codedValuesTabIndex = useSelector(state => state.present.ui.tabs.tabNames.indexOf('Coded Values'));
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
                <Grid container justify='space-between' alignItems='center'>
                    <Grid item>
                        {codeListTitle}
                    </Grid>
                    <Grid item>
                        <SearchInTable
                            data={data}
                            header={header}
                            onDataUpdate={setCurrentData}
                            classes={searchClasses}
                            variant='filled'
                        />
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent className={classes.content}>
                { currentData !== undefined ? (
                    <GeneralTable
                        data={currentData}
                        header={header}
                        pagination
                        disableToolbar
                        initialRowsPerPage={250}
                        rowsPerPageOptions={[100, 250, 500]}
                    />
                ) : (
                    props.itemInfo !== undefined && <Loading onRetry={() => { setRetry(retry + 1); }} />
                )}
            </DialogContent>
            <DialogActions>
                { codeListType !== 'external' && props.stdCodeListOid === undefined && props.itemInfo === undefined && (
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
    codeListOid: PropTypes.string,
    type: PropTypes.string.isRequired,
    stdCodeListOid: PropTypes.string,
};

export default ModalCodeListTable;
