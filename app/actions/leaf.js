import {
    UPD_LEAFS,
    UPD_LEAFORDER,
} from "constants/action-types";

// Documents
export const updateLeafs = (updateObj) => (
    {
        type: UPD_LEAFS,
        updateObj,
    }
);

export const updateLeafOrder = (leafOrder) => (
    {
        type: UPD_LEAFORDER,
        leafOrder,
    }
);
