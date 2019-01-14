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
import ModalDeleteStudy from 'utils/modalDeleteStudy.js';
import ModalDeleteDefine from 'utils/modalDeleteDefine.js';
import ModalChangeDefine from 'utils/modalChangeDefine.js';
import ModalQuitApplication from 'utils/modalQuitApplication.js';
import ModalInitialMessage from 'utils/modalInitialMessage.js';
import ModalBugReport from 'utils/modalBugReport.js';

const mapStateToProps = state => {
    return {
        modal: state.present.ui.modal,
    };
};

const MODAL_COMPONENTS = {
    'DELETE_STUDY': ModalDeleteStudy,
    'DELETE_DEFINE': ModalDeleteDefine,
    'CHANGE_DEFINE': ModalChangeDefine,
    'INITIAL_MESSAGE': ModalInitialMessage,
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
