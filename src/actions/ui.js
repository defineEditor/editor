import {
    UI_CHANGETAB,
    UI_TOGGLEROWSELECT,
    UI_SETVLMSTATE,
    UI_SELECTGROUP,
    UI_SELECTCOLUMNS,
    UI_TOGGLEMAINMENU,
    UI_SETCURRENTPAGE,
    UI_SETSTUDYORDERTYPE,
    UI_TOGGLEADDDEFINEFORM
} from "constants/action-types";


export const changeTab = (updateObj) => (
    {
        type: UI_CHANGETAB,
        updateObj,
    }
);

export const toggleRowSelect = (source) => (
    {
        type: UI_TOGGLEROWSELECT,
        source,
    }
);

export const setVlmState = (source, updateObj) => (
    {
        type: UI_SETVLMSTATE,
        source,
        updateObj,
    }
);

export const selectGroup = (updateObj) => (
    {
        type: UI_SELECTGROUP,
        updateObj,
    }
);

export const selectColumns = (updateObj) => (
    {
        type: UI_SELECTCOLUMNS,
        updateObj,
    }
);

export const toggleMainMenu = () => (
    {
        type: UI_TOGGLEMAINMENU,
    }
);

export const setCurrentPage = (updateObj) => (
    {
        type: UI_SETCURRENTPAGE,
        updateObj,
    }
);

export const setStudyOrderType = (updateObj) => (
    {
        type: UI_SETSTUDYORDERTYPE,
        updateObj,
    }
);

export const toggleAddDefineForm = (updateObj) => (
    {
        type: UI_TOGGLEADDDEFINEFORM,
        updateObj,
    }
);
