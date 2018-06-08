import {
    UI_CHANGETAB,
    UI_TOGGLEROWSELECT,
    UI_SETVLMSTATE,
    UI_SELECTDATASET,
    UI_SELECTCOLUMNS,
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

export const selectDataset = (updateObj) => (
    {
        type: UI_SELECTDATASET,
        updateObj,
    }
);

export const selectColumns = (updateObj) => (
    {
        type: UI_SELECTCOLUMNS,
        updateObj,
    }
);
