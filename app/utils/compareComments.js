import deepEqual from 'fast-deep-equal';

function compareComments(comment1, comment2) {
    // In Define 2.0/2.1 there are no special comment attributes, nontheless a dummy compare is performed in case there are
    // additional attributes added
    let differenceInAttributes = Object.keys(comment1).some( prop => {
        return (typeof prop !== 'object' && comment1[prop] !== comment2[prop] && prop !== 'oid' );
    });
    if (differenceInAttributes) {
        return false;
    }

    let differenceInObject =
        !deepEqual(comment1.descriptions, comment2.descriptions)
        || !deepEqual(comment1.documents, comment2.documents)
    ;


    if (differenceInObject) {
        return false;
    }

    return true;
}

export default compareComments;
