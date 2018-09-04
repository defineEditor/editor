import deepEqual from 'fast-deep-equal';

function compareMethods(method1, method2) {
    let differenceInAttributes = Object.keys(method1).some( prop => {
        return (typeof prop !== 'object' && method1[prop] !== method2[prop] && prop !== 'oid' && prop !== 'autoMethodName');
    });
    if (differenceInAttributes) {
        return false;
    }

    let differenceInObject =
        !deepEqual(method1.descriptions, method2.descriptions)
        || !deepEqual(method1.formalExpression, method2.formalExpression)
        || !deepEqual(method1.documents, method2.documents)
    ;


    if (differenceInObject) {
        return false;
    }

    return true;
}

export default compareMethods;
