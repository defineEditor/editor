function getOid (type, suffix, existingOids = []) {
    let oid = '';
    let prefix = {
        MetaDataVersion : 'MDV.',
        Standard        : 'STD.',
        ValueList       : 'VL.',
        WhereClause     : 'WC.',
        ItemGroup       : 'IG.',
        Item            : 'IT.',
        CodeList        : 'CL.',
        Method          : 'MT.',
        Comment         : 'COM.',
        Leaf            : 'LF.',
        ItemRef         : 'NG.IR.',
        CodeListItem    : 'NG.CI.',
        Study           : 'NG.SDY.',
    };
    if (suffix !== undefined) {
        oid = prefix[type] + suffix;
    } else {
        // get UUID
        var d = new Date().getTime();
        oid = prefix[type] + 'xxxxxxxx-yxxx-4xxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
        });
    }
    // Check if the OID is not unique
    if (existingOids.includes(oid) && suffix === undefined) {
        return getOid(type, suffix, existingOids);
    } else if (existingOids.includes(oid) && suffix !== undefined) {
        throw 'getOid: OID already exists.';
    } else {
        return oid;
    }
}

export default getOid;
