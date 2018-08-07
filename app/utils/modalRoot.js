import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ModalDeleteStudy from 'utils/modalDeleteStudy.js';
import ModalDeleteDefine from 'utils/modalDeleteDefine.js';
import ModalChangeDefine from 'utils/modalChangeDefine.js';

const mapStateToProps = state => {
    return {
        modal: state.ui.modal,
    };
};

const MODAL_COMPONENTS = {
    'DELETE_STUDY': ModalDeleteStudy,
    'DELETE_DEFINE': ModalDeleteDefine,
    'CHANGE_DEFINE': ModalChangeDefine,
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
