function compareLeafs(leaf1, leaf2) {
    let differenceInAttributes = Object.keys(leaf1).some( prop => {
        return (
            typeof prop !== 'object' && leaf1[prop] !== leaf2[prop]
            &&
            !['id', 'baseFolder', 'href'].includes(prop)
        );
    });
    if (differenceInAttributes) {
        return false;
    }

    return true;
}

export default compareLeafs;
