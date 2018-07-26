function getModelFromStandard (standardName) {
    if (/adam/i.test(standardName)) {
        return 'ADaM';
    } else if (/sdtm/i.test(standardName)) {
        return 'SDTM';
    } else if (/send/i.test(standardName)) {
        return 'SEND';
    }
}

export default getModelFromStandard;
