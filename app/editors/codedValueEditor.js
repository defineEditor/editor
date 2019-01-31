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
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import ReactSelectEditor from 'editors/reactSelectEditor.js';
import getCodeListData from 'utils/getCodeListData.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';

const mapStateToProps = state => {
    return {
        enableSelectForStdCodedValues : state.present.settings.editor.enableSelectForStdCodedValues,
    };
};

class ConnectedCodedValueEditor extends React.Component {
    render () {
        let stdCodeList = this.props.row.stdCodeList;
        let codeList = this.props.row.codeList;
        if (stdCodeList!== undefined && this.props.enableSelectForStdCodedValues) {
            let stdCodeListData = getCodeListData(stdCodeList).codeListTable;
            let existingValues = getCodedValuesAsArray(codeList);
            let options = stdCodeListData
                .filter( item => (!existingValues.includes(item.value) || item.value === this.props.defaultValue))
                .map( item => ({
                    value : item.value,
                    label : item.value + ' (' + item.decode + ')',
                }));
            // If current value is not from the standard codelist, still include it
            if (!getCodedValuesAsArray(stdCodeList).includes(this.props.defaultValue)) {
                options.push({ value: this.props.defaultValue, label: this.props.defaultValue });
            }
            return (
                <ReactSelectEditor
                    handleChange={ this.props.onUpdate }
                    value={this.props.defaultValue}
                    options={options}
                    extensible={stdCodeList.codeListExtensible === 'Yes'}
                />
            );
        } else {
            let options = {
                checkForSpecialChars : { type: 'Error' },
                lengthLimit          : { type: 'Error', maxLength: 200 },
            };
            return (<SimpleInputEditor onUpdate={ this.props.onUpdate } {...this.props} options={options}/>);
        }
    }
}

ConnectedCodedValueEditor.propTypes = {
    defaultValue                  : PropTypes.string.isRequired,
    row                           : PropTypes.object.isRequired,
    enableSelectForStdCodedValues : PropTypes.bool,
    onUpdate                      : PropTypes.func
};

const CodedValueEditor = connect(mapStateToProps)(ConnectedCodedValueEditor);
export default CodedValueEditor;
