import {
    ADD_ITEMGROUP,
} from "constants/action-types";

const addItemGroup = (state, action) => {
    let newState = state.slice();
    newState.push([action.itemGroup.oid]);
    return newState;
};

const itemGroupOrder = (state = {}, action) => {
    switch (action.type) {
        case ADD_ITEMGROUP:
            return addItemGroup(state, action);
        default:
            return state;
    }
};

export default itemGroupOrder;
