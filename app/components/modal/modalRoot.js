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
import { useSelector } from 'react-redux';
import ModalDeleteStudy from 'components/modal/modalDeleteStudy.js';
import ModalDeleteDefine from 'components/modal/modalDeleteDefine.js';
import ModalDeleteCodeLists from 'components/modal/modalDeleteCodeLists.js';
import ModalChangeDefine from 'components/modal/modalChangeDefine.js';
import ModalQuitApplication from 'components/modal/modalQuitApplication.js';
import ModalInitialMessage from 'components/modal/modalInitialMessage.js';
import ModalPopulateStdCodeLists from 'components/modal/modalPopulateStdCodeLists.js';
import ModalLinkCodeList from 'components/modal/modalLinkCodeList.js';
import ModalLinkCodeLists from 'components/modal/modalLinkCodeLists.js';
import ModalBugReport from 'components/modal/modalBugReport.js';
import ModalSaveSettings from 'components/modal/modalSaveSettings.js';
import ModalGeneral from 'components/modal/modalGeneral.js';
import ModalReviewComment from 'components/modal/modalReviewComment.js';
import ModalConfirmChange from 'components/modal/modalConfirmChange.js';
import ModalCleanCdiscLibraryCache from 'components/modal/modalCleanCdiscLibraryCache.js';
import ModalUpdateApplication from 'components/modal/modalUpdateApplication.js';
import ModalCodeListTable from 'components/modal/modalCodeListTable.js';

const MODAL_COMPONENTS = {
    'DELETE_STUDY': ModalDeleteStudy,
    'DELETE_DEFINE': ModalDeleteDefine,
    'DELETE_CODELISTS': ModalDeleteCodeLists,
    'CHANGE_DEFINE': ModalChangeDefine,
    'INITIAL_MESSAGE': ModalInitialMessage,
    'POPULATE_STD_CODELISTS': ModalPopulateStdCodeLists,
    'SAVE_SETTINGS': ModalSaveSettings,
    'LINK_CODELIST': ModalLinkCodeList,
    'LINK_CODELISTS': ModalLinkCodeLists,
    'BUG_REPORT': ModalBugReport,
    'REVIEW_COMMENT': ModalReviewComment,
    'QUIT': ModalQuitApplication,
    'GENERAL': ModalGeneral,
    'CONFIRM_CHANGE': ModalConfirmChange,
    'CLEAN_CDISC_LIBRARY_CACHE': ModalCleanCdiscLibraryCache,
    'UPDATE_APPLICATION': ModalUpdateApplication,
    'CODELIST_TABLE': ModalCodeListTable,
};

const ModalRoot = () => {
    let modal = useSelector(state => state.present.ui.modal);
    if (modal.type.length === 0) {
        return null;
    }

    let result = [];
    modal.type.forEach(modalType => {
        const Modal = MODAL_COMPONENTS[modalType];
        result.push(<Modal key={modalType} type={modalType} { ...modal.props[modalType] } />);
    });
    return result;
};

export default ModalRoot;
