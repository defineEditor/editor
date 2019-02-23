/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
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
import { updateStudyOrder } from 'actions/index.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateStudyOrder: (studyOrder) => dispatch(updateStudyOrder({ studyOrder })),
    };
};

const mapStateToProps = state => {
    return {
        studies: state.present.studies,
    };
};

class StudyOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateStudyOrder(items.map(item => (item.oid)));
    }

    render () {
        let items = [];

        this.props.studies.allIds.forEach(studyId => {
            items.push({ oid: studyId, name: this.props.studies.byId[studyId].name });
        });

        return (
            <GeneralOrderEditor title='Study Order' items={items} onSave={this.onSave} iconClass={this.props.iconClass}/>
        );
    }
}

StudyOrderEditorConnected.propTypes = {
    studies: PropTypes.object.isRequired,
    iconClass: PropTypes.string,
    reviewMode: PropTypes.bool,
};

const StudyOrderEditor = connect(mapStateToProps, mapDispatchToProps)(StudyOrderEditorConnected);
export default StudyOrderEditor;
