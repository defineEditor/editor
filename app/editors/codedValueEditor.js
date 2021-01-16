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
import { useSelector } from 'react-redux';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import AutocompleteSelectEditor from 'editors/autocompleteSelectEditor.js';
import getCodeListData from 'utils/getCodeListData.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';

const CodedValueEditor = (props) => {
    const enableSelectForStdCodedValues = useSelector(state => state.present.settings.editor.enableSelectForStdCodedValues);
    const allowNonExtCodeListExtension = useSelector(state => state.present.settings.editor.allowNonExtCodeListExtension);
    let stdCodeList = props.row.stdCodeList;
    let codeList = props.row.codeList;
    let defaultCodedValue;
    if (props.defaultValue) {
        defaultCodedValue = {
            value: props.defaultValue,
            label: props.defaultValue,
        };
    }
    if (stdCodeList !== undefined && enableSelectForStdCodedValues) {
        let stdCodeListData = getCodeListData(stdCodeList).codeListTable;
        let existingValues = getCodedValuesAsArray(codeList);
        let options = stdCodeListData
            .filter(item => (!existingValues.includes(item.value) || item.value === props.defaultValue))
            .map(item => ({
                value: item.value,
                label: item.value + ' (' + item.decode + ')',
            }));
        const handleUpdate = (event, option) => {
            if (typeof option === 'object' && option !== null) {
                // Value from the options
                props.onUpdate(option.value);
            } else if (typeof option === 'string') {
                // New value
                props.onUpdate(option);
            }
        };
        return (
            <AutocompleteSelectEditor
                onChange={ handleUpdate }
                defaultValue={defaultCodedValue}
                options={options}
                autoFocus={true}
                freeSolo={stdCodeList.codeListExtensible === 'Yes' || allowNonExtCodeListExtension}
                disableClearable
            />
        );
    } else {
        let options = {
            checkForSpecialChars: { type: 'Error' },
            lengthLimit: { type: 'Error', maxLength: 200 },
        };
        return (<SimpleInputEditor onUpdate={ props.onUpdate } {...props} options={options}/>);
    }
};

CodedValueEditor.propTypes = {
    defaultValue: PropTypes.string.isRequired,
    row: PropTypes.object.isRequired,
    enableSelectForStdCodedValues: PropTypes.bool,
    allowNonExtCodeListExtension: PropTypes.bool,
    onUpdate: PropTypes.func
};

export default CodedValueEditor;
