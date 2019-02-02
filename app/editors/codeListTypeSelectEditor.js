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
//import PropTypes from 'prop-types';
//import TextField from '@material-ui/core/TextField';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        showWarning     : state.present.settings.editor.codeListTypeUpdateWarning,
    };
};

class ConnectedCodeListTypeSelectEditor extends React.Component {

    onCodeListTypeSelect = (newCodeListType) => {
        if (this.props.showWarning) {
            window.alert('test');
        } else {
            this.props.onUpdate(newCodeListType);
        }
    }

    render() {
        return(
            <SimpleSelectEditor
                onUpdate={this.onCodeListTypeSelect}
                autoFocus={this.props.autoFocus}
                options={this.props.options}
                defaultValue={this.props.defaultValue}
            />
        );
    }
}

const CodeListTypeSelectEditor = connect(mapStateToProps)(ConnectedCodeListTypeSelectEditor);
export default CodeListTypeSelectEditor;
