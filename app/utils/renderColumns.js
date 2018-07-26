import React from 'react';
import {TableHeaderColumn} from 'react-bootstrap-table';

// Transform columns object to Bootstrap-react-table column headers;
function renderColumns (columns) {
    let result = [];
    Object.keys(columns).forEach( id => {
        let colProps = { dataField: id };
        let text = null;
        Object.keys(columns[id]).forEach((key) => {
            if (key !== 'text') {
                colProps[key] = columns[id][key];
            } else {
                text = columns[id].text;
            }
        });
        result.push(<TableHeaderColumn key={text} {...colProps}>{text}</TableHeaderColumn>);
    });
    return result;
}

export default renderColumns;
