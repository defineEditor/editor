'use strict';

function getOid (type) {
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
        Comment         : 'COM.'
    };
    // get UUID
    var d = new Date().getTime();
    oid = prefix[type] + 'xxxxxxxx-yxxx-4xxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return oid;
}

class Odm {
    constructor ({
        schemaLocation, odmVersion, fileType, fileOid, creationDateTime, asOfDateTime, originator, sourceSystem,
        sourceSystemVersion, context, study, xlink, def, xmlns, xsi
    } = {}) {
        this.schemaLocation = schemaLocation;
        this.odmVersion = odmVersion;
        this.fileType = fileType;
        this.fileOid = fileOid;
        this.creationDateTime = creationDateTime;
        this.asOfDateTime = asOfDateTime;
        this.originator = originator;
        this.sourceSystem = sourceSystem;
        this.sourceSystemVersion = sourceSystemVersion;
        this.context = context;
        this.study = study;
        this.xlink = xlink;
        this.def = def;
        this.xmlns = xmlns;
        this.xsi = xsi;
    }
}

class Study {
    constructor ({
        oid, metaDataVersion, globalVariables
    } = {}) {
        this.oid = oid;
        this.globalVariables = globalVariables;
        this.metaDataVersion = metaDataVersion;
    }
}

class GlobalVariables {
    constructor ({
        protocolName, studyName, studyDescription
    } = {}) {
        this.protocolName = protocolName;
        this.studyName = studyName;
        this.studyDescription = studyDescription;
    }
}

class MetaDataVersion {
    constructor ({
        oid, name, defineVersion, comment,
        standards, valueLists, whereClauses,
        itemGroups, itemDefs, codeLists, methods, comments, leafs,
        annotatedCrf = [],
        supplementalDoc = [],
        descriptions = []
    } = {}) {
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.descriptions = descriptions;
        this.defineVersion = defineVersion;
        this.comment = comment;
        this.standards = standards;
        this.annotatedCrf = annotatedCrf;
        this.supplementalDoc = supplementalDoc;
        this.valueLists = valueLists;
        this.whereClauses = whereClauses;
        this.itemGroups = itemGroups;
        this.itemDefs = itemDefs;
        this.codeLists = codeLists;
        this.methods = methods;
        this.comments = comments;
        this.leafs = leafs;
    }
    addStandard (standard) {
        this.standards.push(standard);
    }
    addItemGroup (itemGroup) {
        this.itemGroups[itemGroup.oid] = itemGroup;
    }
    addDescription (description) {
        this.descriptions.push(description);
    }
    getDescription (language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0];
        } else {
            return undefined;
        }
    }
}

class Standard {
    constructor ({
        oid, name, type, publishingSet, version, status, isDefault, comment
    } = {}) {
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.type = type;
        this.publishingSet = publishingSet;
        this.version = version;
        this.isDefault = isDefault;
        this.comment = comment;
    }
    toString () {
        return this.name + ',' + this.type;
    }
}

class ItemGroup {
    constructor ({
        oid, name, domain, datasetName, repeating, isReferenceData, purpose,
        structure, datasetClass, archiveLocation, comment, isNotStandard,
        standard, alias, leaf,
        descriptions = [],
        itemRefs = []
    } = {}) {
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.domain = domain;
        this.datasetName = datasetName;
        this.repeating = repeating;
        this.isReferenceData = isReferenceData;
        this.purpose = purpose;
        this.structure = structure;
        this.datasetClass = datasetClass;
        this.archiveLocation = archiveLocation;
        this.comment = comment;
        this.isNotStandard = isNotStandard;
        this.standard = standard;
        this.descriptions = descriptions;
        this.itemRefs = itemRefs;
        this.alias = alias;
        this.leaf = leaf;
    }
    addItemRef (itemRef) {
        this.itemRefs.push(itemRef);
    }
    addDescription (description) {
        this.descriptions.push(description);
    }
    getDescription (language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0];
        } else {
            return undefined;
        }
    }
}

class ItemDef {
    constructor ({
        oid, name, dataType, length,
        fractionDigits, fieldName, displayFormat,
        comment, codeList, valueList, valueListOid, parent,
        origins = [],
        descriptions = []
    } = {}) {
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.dataType = dataType;
        this.length = length;
        this.fractionDigits = fractionDigits;
        this.fieldName = fieldName;
        this.displayFormat = displayFormat;
        this.comment = comment;
        this.origins = origins;
        this.codeList = codeList;
        this.valueList = valueList;
        this.valueListOid = valueListOid;
        this.parent = parent;
        this.descriptions = descriptions;
    }
    addDescription (description) {
        this.descriptions.push(description);
    }
    getDescription (language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0];
        } else {
            return undefined;
        }
    }
    addOrigin (origin) {
        this.origins.push(origin);
    }
    setValueList (valueList) {
        this.valueList = valueList;
        var self = this;
        this.valueList.getItemRefs().forEach(function (itemRef) {
            itemRef.itemDef.setParent(self);
        });
    }
    setParent (parent) {
        this.parent = parent;
    }
}

class ItemRef {
    constructor ({
        orderNumber, mandatory, keySequence, method, role, roleCodeList, itemDef, isNotStandatd, whereClause
    } = {}) {
        this.orderNumber = orderNumber;
        this.mandatory = mandatory;
        this.keySequence = keySequence;
        this.method = method;
        this.isNotStandard = isNotStandatd;
        this.role = role;
        this.roleCodeList = roleCodeList;
        this.itemDef = itemDef;
        this.whereClause = whereClause;
    }
}

class ValueList {
    constructor ({
        oid, itemRefs = [], descriptions = []
    } = {}) {
        this.oid = oid || getOid(this.constructor.name);
        this.itemRefs = itemRefs;
        this.descriptions = descriptions;
    }
    addItemRef (itemRef) {
        this.itemRefs.push(itemRef);
    }
    addDescription (description) {
        this.descriptions.push(description);
    }
    getDescription (language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0];
        } else {
            return undefined;
        }
    }
    getItemRefs () {
        return this.itemRefs;
    }
}

class Origin {
    constructor ({
        type, source, descriptions = [], documents = []
    } = {}) {
        this.type = type;
        this.source = source;
        this.descriptions = descriptions;
        this.documents = documents;
    }
    addDescription (description) {
        this.descriptions.push(description);
    }
    getDescription (language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0];
        } else {
            return undefined;
        }
    }
    addDocument (document) {
        this.documents.push(document);
    }
}

class WhereClause {
    constructor ({
        oid, comment, rangeChecks = []
    } = {}) {
        this.oid = oid;
        this.comment = comment;
        this.rangeChecks = [];
    }
    addRangeCheck (rangeCheck) {
        this.rangeChecks.push(rangeCheck);
    }
}

class RangeCheck {
    constructor ({
        comparator, softHard, itemOid, checkValues = []
    } = {}) {
        this.comparator = comparator;
        this.softHard = softHard;
        this.itemOid = itemOid;
        this.checkValues = checkValues;
    }
    addCheckValue (value) {
        this.checkValues.push(value);
    }
}

class CodeList {
    constructor ({
        oid, name, dataType, standard, sasFormatName, comment, externalCodelist, alias,
        descriptions = [],
        enumeratedItems = [],
        codeListItems = []
    } = {}) {
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.dataType = dataType;
        this.standard = standard;
        this.sasFormatName = sasFormatName;
        this.comment = comment;
        this.externalCodelist = externalCodelist;
        this.alias = alias;
        this.descriptions = descriptions;
        this.enumeratedItems = enumeratedItems;
        this.codeListItems = codeListItems;
    }
    addEnumeratedItem (item) {
        this.enumeratedItems.push(item);
    }
    addCodeListItem (item) {
        this.codeListItems.push(item);
    }
    addDescription (description) {
        this.descriptions.push(description);
    }
    getDescription (language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0];
        } else {
            return undefined;
        }
    }
    setExternalCodelist (item) {
        this.externalCodelist = item;
    }
}

class EnumeratedItem {
    constructor ({
        codedValue, rank, orderNumber, extendedValue, alias
    } = {}) {
        this.codedValue = codedValue;
        this.rank = rank;
        this.orderNumber = orderNumber;
        this.extendedValue = extendedValue;
        this.alias = alias;
    }
}

class CodeListItem extends EnumeratedItem {
    constructor ({
        codedValue, rank, orderNumber, extendedValue, alias,
        decodes = []
    } = {}) {
        super({
            codedValue    : codedValue,
            rank          : rank,
            orderNumber   : orderNumber,
            extendedValue : extendedValue,
            alias         : alias
        });
        this.decodes = decodes;
    }
    addDecode (decode) {
        this.decodes.push(decode);
    }
}

class ExternalCodelist {
    constructor ({
        dictionary, version, ref, href
    } = {}) {
        this.dictionary = dictionary;
        this.version = version;
        this.ref = ref;
        this.href = href;
    }
}

class Alias {
    constructor ({
        name, context
    } = {}) {
        this.name = name;
        this.context = context;
    }
}

class TranslatedText {
    constructor ({
        lang = 'en', value
    } = {}) {
        this.lang = lang;
        this.value = value;
    }
}

class Comment {
    constructor ({
        oid, descriptions = [], documents = []
    } = {}) {
        this.oid = oid;
        this.descriptions = descriptions;
        this.documents = documents;
    }
    addDescription (description) {
        this.descriptions.push(description);
    }
    getDescription (language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0];
        } else {
            return undefined;
        }
    }
    addDocument (document) {
        this.documents.push(document);
    }
}

class Method extends Comment {
    constructor ({
        oid, name, type, descriptions = [], documents = [], formalExpressions = []
    } = {}) {
        super({
            oid          : oid,
            descriptions : descriptions,
            documents    : documents
        });
        this.name = name;
        this.type = type;
        this.formalExpressions = formalExpressions;
    }
    addFormalExpression (expression) {
        this.formalExpressions.push(expression);
    }
}

class Document {
    constructor ({
        leaf, pdfPageRefs = []
    } = {}) {
        this.leaf = leaf;
        this.pdfPageRefs = pdfPageRefs;
    }
    addPdfPageRef (pdfPageRef) {
        this.pdfPageRefs.push(pdfPageRef);
    }
}

class PdfPageRef {
    constructor ({
        type, pageRefs, firstPage, lastPage, title
    } = {}) {
        this.type = type;
        this.pageRefs = pageRefs;
        this.firstPage = firstPage;
        this.lastPage = lastPage;
        this.title = title;
    }
}

class Leaf {
    constructor ({
        id, href, title
    } = {}) {
        this.id = id;
        this.href = href;
        this.title = title;
    }
}

module.exports = {
    Odm              : Odm,
    Study            : Study,
    GlobalVariables  : GlobalVariables,
    MetaDataVersion  : MetaDataVersion,
    Standard         : Standard,
    ValueList        : ValueList,
    WhereClause      : WhereClause,
    RangeCheck       : RangeCheck,
    ItemGroup        : ItemGroup,
    ItemRef          : ItemRef,
    ItemDef          : ItemDef,
    CodeList         : CodeList,
    Method           : Method,
    TranslatedText   : TranslatedText,
    ExternalCodelist : ExternalCodelist,
    CodeListItem     : CodeListItem,
    EnumeratedItem   : EnumeratedItem,
    Alias            : Alias,
    Origin           : Origin,
    Comment          : Comment,
    Document         : Document,
    PdfPageRef       : PdfPageRef,
    Leaf             : Leaf
};
