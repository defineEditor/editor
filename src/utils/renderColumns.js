import React from 'react';
import {TableHeaderColumn} from 'react-bootstrap-table';

// Transform columns object to Bootstrap-react-table column headers;
function renderColumns (columns) {
    let result = [];
    columns.forEach((column) => {
        let colProps = {};
        let text = null;
        Object.keys(column).forEach((key) => {
            if (key !== 'text') {
                colProps[key] = column[key];
            } else {
                text = column.text;
            }
        });
        result.push(<TableHeaderColumn key={text} {...colProps}>{text}</TableHeaderColumn>);
    });
    return result;
}

export default renderColumns;
