function sortCodeLists (codeLists) {
    const sortCLIds = (id1, id2) => {
        if (codeLists[id1].name > codeLists[id2].name) {
            return 1;
        } else if (codeLists[id1].name < codeLists[id2].name) {
            return -1;
        } else {
            return 0;
        }
    };
    return Object.keys(codeLists).sort(sortCLIds);
}

export default sortCodeLists;
