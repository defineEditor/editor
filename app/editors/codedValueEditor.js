import React from 'react';
import PropTypes from 'prop-types';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import ReactSelectEditor from 'editors/reactSelectEditor.js';
import getCodeListData from 'utils/getCodeListData.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';

class CodedValueEditor extends React.Component {

    render () {
        let stdCodeList = this.props.row.stdCodeList;
        let codeList = this.props.row.codeList;
        if (stdCodeList!== undefined) {
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

CodedValueEditor.propTypes = {
    defaultValue : PropTypes.string.isRequired,
    row          : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func
};

export default CodedValueEditor;
