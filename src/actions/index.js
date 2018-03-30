// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCT
} from "constants/action-types";

export const addOdm = odm => ({ type: ADD_ODM, odm: odm });
export const addStdControlledTerminology = codeListsOdm => (
    {
        type                  : ADD_STDCT,
        oid                   : codeListsOdm.study.oid,
        controlledTerminology : {
            codeLists   : codeListsOdm.study.metaDataVersion.codeLists,
            description : codeListsOdm.study.globalVariables.studyDescription,
        }
    }
);
