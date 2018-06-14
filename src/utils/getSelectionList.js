import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';

function getSelectionList (rawList, optional) {
    let selectionList = [];
    // If list is an object. transform it to array
    let list = [];
    if (Object.prototype.toString.call(rawList) === '[object Object]') {
        Object.keys(rawList).forEach( property => {
            list.push({ [property]: rawList[property] });
        });
    } else if (Array.isArray(rawList)) {
        list = rawList;
    } else {
        throw Error('GetSelectionList: An array or object must be provided as an argument.');
    }
    if (list.length < 1 && optional !== true) {
        throw Error('GetSelectionList: Blank value list provided for the ItemSelect element');
    } else {
        if (optional === true) {
            selectionList.push(<MenuItem key='0' value=''></MenuItem>);
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
