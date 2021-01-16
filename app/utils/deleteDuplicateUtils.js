/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2021 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

const deleteDuplicateOids = (state, action, attributeName) => {
    const duplicates = action.updateObj.duplicates;
    if (Object.keys(duplicates).length > 0) {
        let newState = { ...state };
        let atLeastOneChanged = false;
        // Name an object for ID renaming: { oldId: newId }
        let renamedIds = {};
        Object.keys(duplicates).forEach(newId => {
            let duplicateIds = duplicates[newId];
            duplicateIds.forEach(oldId => {
                renamedIds[oldId] = newId;
            });
        });
        const allRemovedCommentIds = Object.keys(renamedIds);

        Object.keys(newState).forEach(id => {
            let item = newState[id];
            if (item[attributeName] !== undefined && allRemovedCommentIds.includes(item[attributeName])) {
                newState[id] = { ...newState[id], [attributeName]: renamedIds[item[attributeName]] };
                atLeastOneChanged = true;
            }
        });

        if (atLeastOneChanged) {
            return newState;
        } else {
            return state;
        }
    } else {
        return state;
    }
};

export const deleteDuplicateAnalysisDatasetsComments = (state, action) => {
    return deleteDuplicateOids(state, action, 'analysisDatasetsCommentOid');
};

export const deleteDuplicateMethods = (state, action) => {
    let newState = { ...state };
    let atLeastOneChanged = false;
    Object.keys(state).forEach(itemGroupOid => {
        const itemGroup = state[itemGroupOid];
        const newItemRefs = deleteDuplicateOids(itemGroup.itemRefs, action, 'methodOid');
        // Shallow compare is intentional
        if (itemGroup.itemRefs !== newItemRefs) {
            newState[itemGroupOid] = { ...newState[itemGroupOid], itemRefs: newItemRefs };
            atLeastOneChanged = true;
        }
    });
    if (atLeastOneChanged) {
        return newState;
    } else {
        return state;
    }
};

export const deleteDuplicateComments = (state, action) => {
    return deleteDuplicateOids(state, action, 'commentOid');
};
