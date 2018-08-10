function getCtPublishingSet( id ) {
    let publishingSet;
    let ctModel = id.replace(/^.*?\.(.*)\..*$/, '$1');
    if (['ADaM', 'SDTM', 'CDASH', 'SEND'].includes(ctModel)) {
        publishingSet = ctModel;
    } else if (['QS-FT', 'QS', 'COA', 'QRS'].includes(ctModel)) {
        publishingSet = 'SDTM';
    }
    return publishingSet;
}

export default getCtPublishingSet;
