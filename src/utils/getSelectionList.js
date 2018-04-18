import React from 'react';
import { MenuItem } from 'material-ui/Menu';

function getSelectionList (list, optional) {
    let selectionList = [];
    if (list.length < 1 && optional !== true) {
        throw Error('Blank value list provided for the ItemSelect element');
    } else {
        if (optional === true) {
            selectionList.push(<MenuItem key='0' value=""></MenuItem>);
        }
        list.forEach( (value, index) => {
            if (typeof value === 'object') {
                selectionList.push(<MenuItem key={index+1} value={Object.keys(value)[0]}>{value[Object.keys(value)[0]]}</MenuItem>);
            } else {
                selectionList.push(<MenuItem key={index+1} value={value}>{value}</MenuItem>);
            }
        });
    }
    return selectionList;
}

export default getSelectionList;
