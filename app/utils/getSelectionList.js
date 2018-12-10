/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import MenuItem from '@material-ui/core/MenuItem';

function getSelectionList (rawList, optional, disabledItems) {
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
        console.error('GetSelectionList: Blank value list provided for the ItemSelect element');
        return [];
    } else {
        let elementIsObject = false;
        if  ( typeof list[0] === 'object') {
            elementIsObject = true;
        }
        if (optional === true) {
            selectionList.push(<MenuItem key='0' value=''></MenuItem>);
        }
        if (disabledItems === undefined) {
            list.forEach( (value, index) => {
                if (elementIsObject) {
                    selectionList.push(<MenuItem key={index+1} value={Object.keys(value)[0]}>{value[Object.keys(value)[0]]}</MenuItem>);
                } else {
                    selectionList.push(<MenuItem key={index+1} value={value}>{value}</MenuItem>);
                }
            });
        } else {
            list.forEach( (value, index) => {
                if (elementIsObject) {
                    let id = Object.keys(value)[0];
                    if (disabledItems.includes(id)) {
                        selectionList.push(<MenuItem key={index+1} value={id} disabled={true}>{value[id]}</MenuItem>);
                    } else {
                        selectionList.push(<MenuItem key={index+1} value={id}>{value[id]}</MenuItem>);
                    }
                } else {
                    if (disabledItems.includes(value)) {
                        selectionList.push(<MenuItem key={index+1} value={value} disabled={true}>{value}</MenuItem>);
                    } else {
                        selectionList.push(<MenuItem key={index+1} value={value}>{value}</MenuItem>);
                    }
                }
            });
        }
    }
    return selectionList;
}

export default getSelectionList;
