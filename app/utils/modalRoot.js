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
