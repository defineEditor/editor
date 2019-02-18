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
import { connect } from 'react-redux';
import ModalDeleteStudy from 'components/modal/modalDeleteStudy.js';
import ModalDeleteDefine from 'components/modal/modalDeleteDefine.js';
import ModalDeleteCodeLists from 'components/modal/modalDeleteCodeLists.js';
import ModalChangeDefine from 'components/modal/modalChangeDefine.js';
import ModalQuitApplication from 'components/modal/modalQuitApplication.js';
import ModalInitialMessage from 'components/modal/modalInitialMessage.js';
import ModalPopulateStdCodeLists from 'components/modal/modalPopulateStdCodeLists.js';
import ModalLinkCodeLists from 'components/modal/modalLinkCodeLists.js';
import ModalBugReport from 'components/modal/modalBugReport.js';
import ModalSaveSettings from 'components/modal/modalSaveSettings.js';

const mapStateToProps = state => {
    return {
        modal: state.present.ui.modal,
    };
};

const MODAL_COMPONENTS = {
    'DELETE_STUDY': ModalDeleteStudy,
    'DELETE_DEFINE': ModalDeleteDefine,
    'DELETE_CODELISTS': ModalDeleteCodeLists,
    'CHANGE_DEFINE': ModalChangeDefine,
    'INITIAL_MESSAGE': ModalInitialMessage,
    'POPULATE_STD_CODELISTS': ModalPopulateStdCodeLists,
    'SAVE_SETTINGS': ModalSaveSettings,
    'LINK_CODELISTS': ModalLinkCodeLists,
    'BUG_REPORT': ModalBugReport,
    'QUIT': ModalQuitApplication,
};

class ConnectedModalRoot extends React.Component {

    render() {
        if (!this.props.modal.type) {
            return null;
        }

        const Modal = MODAL_COMPONENTS[this.props.modal.type];
        return <Modal {...this.props.modal.props} />;
    }
}

ConnectedModalRoot.propTypes = {
    modal: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ConnectedModalRoot);
