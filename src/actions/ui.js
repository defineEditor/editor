import {
    UI_CHANGETAB,
    UI_TOGGLEROWSELECT,
    UI_SETVLMSTATE,
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

export const setVlmState = (source, vlmState) => (
    {
        type: UI_SETVLMSTATE,
        vlmState,
    }
);
