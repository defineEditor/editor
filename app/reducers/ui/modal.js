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

import {
    UI_OPENMODAL,
    UI_CLOSEMODAL,
} from 'constants/action-types';
import { ui } from 'constants/initialValues.js';

const initialState = ui.modal;

const closeModal = (state, action) => {
    if (action.updateObj !== undefined && action.updateObj.type !== undefined) {
        let newState = { ...state };
        if (newState.props[action.updateObj.type] !== undefined) {
            let newProps = { ...newState.props };
            delete newProps[action.updateObj.type];
            newState = { ...newState, props: newProps };
        }
        if (newState.type.includes(action.updateObj.type)) {
            let newType = newState.type.slice();
            newType.splice(newType.indexOf(action.updateObj.type), 1);
            newState = { ...newState, type: newType };
        }
        return newState;
    } else {
        return initialState;
    }
};

const openModal = (state, action) => {
    let newType = state.type.slice();
    newType.push(action.updateObj.type);
    return {
        type: newType,
        props: { ...state.props, [action.updateObj.type]: action.updateObj.props },
    };
};

const modal = (state = initialState, action) => {
    switch (action.type) {
        case UI_OPENMODAL:
            return openModal(state, action);
        case UI_CLOSEMODAL:
            return closeModal(state, action);
        default:
            return state;
    }
};

export default modal;
