import getOid from 'utils/getOid.js';

class ExternalCodeList {
    constructor({ dictionary, version, ref, href } = {}) {
        this.dictionary = dictionary;
        this.version = version;
        this.ref = ref;
        this.href = href;
    }
}

class Alias {
    constructor({ name, context } = {}) {
        this.name = name;
        this.context = context;
    }
    clone() {
        return new Alias(this);
    }
}

class TranslatedText {
    constructor({ lang = 'en', value } = {}) {
        this.lang = lang;
        this.value = value;
    }
    clone() {
        return new TranslatedText(this);
    }
}

// Non-define XML element
class Note {
    constructor({ markdown, value } = {}) {
        this.markdown = markdown;
        this.value = value;
    }
}

class Leaf {
    constructor({ id, href, title, isPdf, type } = {}) {
        this.id = id;
        this.href = href;
        this.title = title;
        // Non-define XML properties
        this.isPdf = isPdf;
        this.type = type;
    }
    clone() {
        return new Leaf(this);
    }
}

class PdfPageRef {
    constructor({ type, pageRefs, firstPage, lastPage, title } = {}) {
        this.type = type;
        this.pageRefs = pageRefs;
        this.firstPage = firstPage;
        this.lastPage = lastPage;
        this.title = title; // 2.1D
    }
    clone() {
        return new PdfPageRef(this);
    }
}

class Document {
    constructor({ leafId, pdfPageRefs = [] } = {}) {
        this.leafId = leafId;
        this.pdfPageRefs = pdfPageRefs;
    }
    addPdfPageRef(pdfPageRef) {
        if (pdfPageRef === undefined) {
            this.pdfPageRefs.push(new PdfPageRef());
        } else {
            this.pdfPageRefs.push(pdfPageRef);
        }
        // Return index of the added element
        return this.pdfPageRefs.length - 1;
    }
    clone() {
        let pdfPageRefs = this.pdfPageRefs.map(pdfPageRef => pdfPageRef.clone());
        return new Document({ leafId: this.leafId, pdfPageRefs: pdfPageRefs });
    }
}

class BasicFunctions {
    addDescription(description) {
        if (description === undefined) {
            this.descriptions.push(new TranslatedText({ value: '' }));
        } else {
            this.descriptions.push(description);
        }
    }
    getDescription(language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0].value;
        } else {
            return '';
        }
    }
    setDescription(value, language = 'en') {
        let updatedFlag = false;
        // No description yet
        if (this.descriptions.length === 0) {
            this.descriptions.push(
                new TranslatedText({ lang: 'language', value: value })
            );
            updatedFlag = true;
        } else {
            // Search for a description with a specific language and update it
            this.descriptions.forEach((description, index) => {
                if (description.lang === language) {
                    this.descriptions[index] = new TranslatedText({
                        lang: language,
                        value: value
                    });
                    updatedFlag = true;
                }
            });
        }
        // In case there is a description without language, use it as default;
        if (
            updatedFlag === false &&
      this.descriptions.length === 1 &&
      this.descriptions[0].lang === undefined &&
      language === 'en'
        ) {
            this.descriptions[0] = new TranslatedText({ value: value });
        }
    }
    addDocument(document) {
        if (this.hasOwnProperty('documents')) {
            if (document === undefined) {
                this.documents.push(new Document());
            } else {
                this.documents.push(document);
            }
        }
    }
}

class Origin extends BasicFunctions {
    constructor({ type, source, descriptions = [], documents = [] } = {}) {
        super();
        this.type = type;
        this.source = source; // 2.1D
        this.descriptions = descriptions;
        this.documents = documents;
    }
    clone() {
        let descriptions = this.descriptions.map(description =>
            description.clone()
        );
        let documents = this.documents.map(document => document.clone());
        return new Origin({
            type: this.type,
            source: this.source,
            descriptions: descriptions,
            documents: documents
        });
    }
}

class WhereClause {
    constructor({ oid, commentOid, sources, rangeChecks = [] } = {}) {
        this.oid = oid;
        this.commentOid = commentOid;
        this.rangeChecks = rangeChecks;
        // List of ItemGroups/itemRefs from which the whereClause is linked
        if (sources !== undefined) {
            this.sources = sources;
        } else {
            this.sources = {
                valueLists: []
            };
        }
    }
    addRangeCheck(rangeCheck) {
        this.rangeChecks.push(rangeCheck);
    }
    clone() {
        return new WhereClause({
            oid: this.oid,
            commentOid: this.commentOid,
            rangeChecks: this.rangeChecks
        });
    }
    toString(mdv) {
        return this.rangeChecks
            .map(rangeCheck => rangeCheck.toString(mdv))
            .join(' AND ');
    }
}

class RangeCheck {
    constructor({
        comparator,
        softHard = 'Soft',
        itemOid,
        checkValues = [],
        itemGroupOid
    } = {}) {
        this.comparator = comparator;
        this.softHard = softHard;
        this.itemOid = itemOid;
        this.checkValues = checkValues;
        // Non-define XML properties
        this.itemGroupOid = itemGroupOid;
    }
    addCheckValue(value) {
        this.checkValues.push(value);
    }
    clone() {
        return new RangeCheck({
            comparator: this.comparator,
            softHard: this.softHard,
            itemOid: this.itemOid,
            checkValues: this.checkValues.slice(),
            itemGroupOid: this.itemGroupOid
        });
    }
    toString(mdv) {
        function surroundWithQuotes(value) {
            if (/'/.test(value) && /"/.test(value) && /\s/.test(value)) {
                // TODO Throw an error -> cannot handle such values at the moment
                return value;
            }
            if (/"/.test(value) && /\s/.test(value)) {
                return "'" + value + "'";
            } else if (/'/.test(value) || /\s/.test(value)) {
                return '"' + value + '"';
            } else {
                return value;
            }
        }
        let result;
        let itemName = mdv.itemDefs[this.itemOid].name;
        if (this.itemGroupOid !== undefined) {
            let itemGroupName = mdv.itemGroups[this.itemGroupOid].name;
            result = itemGroupName + '.' + itemName + ' ' + this.comparator + ' ';
        } else {
            result = itemName + ' ' + this.comparator + ' ';
        }
        if (this.checkValues.length > 0) {
            if (['IN', 'NOTIN'].indexOf(this.comparator) >= 0) {
                result +=
          '(' +
          this.checkValues.map(value => surroundWithQuotes(value)).join(', ') +
          ')';
            } else {
                result += surroundWithQuotes(this.checkValues[0]);
            }
        }
        return result;
    }
}

class CodeList extends BasicFunctions {
    constructor({
        oid,
        name,
        dataType,
        standardOid,
        formatName,
        commentOid,
        externalCodeList,
        alias,
        cdiscSubmissionValue,
        linkedCodeListOid,
        codeListType,
        standardCodeListOid,
        enumeratedItems,
        codeListItems,
        itemOrder = [],
        descriptions = [],
        sources
    } = {}) {
        super();
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.dataType = dataType;
        this.standardOid = standardOid;
        this.formatName = formatName;
        this.commentOid = commentOid; // 2.1D
        this.externalCodeList = externalCodeList;
        this.alias = alias;
        this.descriptions = descriptions; // 2.1D
        this.enumeratedItems = enumeratedItems;
        if (codeListType === 'enumerated' && enumeratedItems === undefined) {
            this.enumeratedItems = {};
        }
        this.codeListItems = codeListItems;
        if (codeListType === 'decoded' && codeListItems === undefined) {
            this.codeListItems = {};
        }
        this.itemOrder = itemOrder;
        // Non-define XML properties
        this.codeListType = codeListType;
        if (codeListType === undefined) {
            if (this.codeListItems !== undefined) {
                this.codeListType = 'decoded';
            } else if (this.enumeratedItems !== undefined) {
                this.codeListType = 'enumerated';
            } else if (this.externalCodeList !== undefined) {
                this.codeListType = 'external';
            }
        }
        this.linkedCodeListOid = linkedCodeListOid;
        this.standardCodeListOid = standardCodeListOid;
        this.cdiscSubmissionValue = cdiscSubmissionValue;
        // List of items from which the codelist is linked
        if (sources !== undefined) {
            this.sources = sources;
        } else {
            this.sources = {
                itemDefs: []
            };
        }
    }
    addEnumeratedItem(item) {
        let oid;
        if (this.enumeratedItems !== undefined) {
            oid = getOid(
                'CodeListItem',
                undefined,
                Object.keys(this.enumeratedItems)
            );
            this.enumeratedItems[oid] = item;
            this.itemOrder.push(oid);
        } else {
            oid = getOid('CodeListItem');
            this.enumeratedItems = { [oid]: item };
            this.itemOrder.push(oid);
        }
        return oid;
    }
    addCodeListItem(item) {
        let oid;
        if (this.codeListItems !== undefined) {
            oid = getOid('CodeListItem', undefined, Object.keys(this.codeListItems));
            this.codeListItems[oid] = item;
            this.itemOrder.push(oid);
        } else {
            oid = getOid('CodeListItem');
            this.codeListItems = { [oid]: item };
            this.itemOrder.push(oid);
        }
        return oid;
    }
    setExternalCodeList(item) {
        this.externalCodeList = item;
    }
    getCodeListType() {
        return this.codeListType;
    }
    getMaxLength() {
    // Returns the maximum length among all codedValues
        let maxLength;
        if (this.dataType === 'float' || this.dataType === 'integer') {
            // For numeric data types count only digits
            maxLength = (max, value) =>
                value.codedValue.replace(/[^\d]/g, '').length > max
                    ? value.codedValue.replace(/[^\d]/g, '').length
                    : max;
        } else {
            maxLength = (max, value) =>
                value.codedValue.length > max ? value.codedValue.length : max;
        }
        if (this.getCodeListType() === 'decoded') {
            return Object.keys(this.codeListItems)
                .map(itemOid => this.codeListItems[itemOid])
                .reduce(maxLength, 1);
        } else if (this.getCodeListType() === 'enumerated') {
            return Object.keys(this.enumeratedItems)
                .map(itemOid => this.enumeratedItems[itemOid])
                .reduce(maxLength, 1);
        } else {
            return 1;
        }
    }
}

class EnumeratedItem {
    constructor({ codedValue, rank, extendedValue, alias } = {}) {
        this.codedValue = codedValue;
        this.rank = rank;
        this.extendedValue = extendedValue;
        this.alias = alias;
    }
}

class CodeListItem extends EnumeratedItem {
    constructor({
        codedValue,
        rank,
        orderNumber,
        extendedValue,
        alias,
        decodes = []
    } = {}) {
        super({
            codedValue: codedValue,
            rank: rank,
            orderNumber: orderNumber,
            extendedValue: extendedValue,
            alias: alias
        });
        this.decodes = decodes;
    }
    addDecode(decode) {
        this.decodes.push(decode);
    }
    getDecode(language) {
        if (this.decodes.length === 1) {
            return this.decodes[0].value;
        } else {
            return undefined;
        }
    }
}

class Comment extends BasicFunctions {
    constructor({ oid, descriptions = [], documents = [], sources } = {}) {
        super();
        this.oid = oid;
        this.descriptions = descriptions;
        this.documents = documents;
        if (sources !== undefined) {
            this.sources = sources;
        } else {
            this.sources = {
                itemDefs: [],
                itemGroups: [],
                whereClauses: [],
                codeLists: [],
                metaDataVersion: []
            };
        }
    }
    getText(leafs) {
        let result = this.getDescription();
        if (this.documents.length > 0) {
            this.documents.forEach(doc => {
                if (leafs.hasOwnProperty(doc.leafId)) {
                    result +=
            '\n' + leafs[doc.leafId].title + '(' + leafs[doc.leafId].href + ')';
                }
            });
        }
        return result;
    }
    clone() {
        let descriptions = this.descriptions.map(description =>
            description.clone()
        );
        let documents = this.documents.map(document => document.clone());
        let sources = {};
        Object.keys(this.sources).forEach(type => {
            sources[type] = this.sources[type].slice();
        });
        return new Comment({
            oid: this.oid,
            descriptions: descriptions,
            documents: documents,
            sources: sources
        });
    }
}

class FormalExpression {
    constructor({ value, context } = {}) {
        this.context = context;
        this.value = value;
    }

    clone() {
        return new FormalExpression(this);
    }
}

class Method extends Comment {
    constructor({
        oid,
        name = '',
        type = 'Computation',
        autoMethodName,
        descriptions = [],
        documents = [],
        formalExpressions = [],
        sources
    } = {}) {
        let initialSources;
        if (sources !== undefined) {
            initialSources = sources;
        } else {
            initialSources = {
                itemGroups: {},
                valueLists: {}
            };
        }
        super({
            oid: oid,
            descriptions: descriptions,
            documents: documents,
            sources: initialSources
        });
        this.name = name;
        this.type = type;
        this.formalExpressions = formalExpressions;
        // Non-define XML properties
        if (autoMethodName !== undefined) {
            this.autoMethodName = autoMethodName;
        } else {
            if (name === undefined) {
                this.autoMethodName = true;
            } else {
                this.autoMethodName = false;
            }
        }
    }
    addFormalExpression(expression) {
        if (expression === undefined) {
            this.formalExpressions.push(new FormalExpression());
        } else {
            this.formalExpressions.push(expression);
        }
    }
    clone() {
        let descriptions = this.descriptions.map(description =>
            description.clone()
        );
        let formalExpressions = this.formalExpressions.map(formalExpression =>
            formalExpression.clone()
        );
        let documents = this.documents.map(document => document.clone());
        let sources = {
            itemGroups: {},
            valueLists: {}
        };
        Object.keys(this.sources).forEach(type => {
            Object.keys(this.sources[type]).forEach(typeOid => {
                sources[type][typeOid] = this.sources[type][typeOid].slice();
            });
        });
        return new Method({
            oid: this.oid,
            name: this.name,
            type: this.type,
            autoMethodName: this.autoMethodName,
            descriptions: descriptions,
            documents: documents,
            sources: sources,
            formalExpressions: formalExpressions
        });
    }
}

class MetaDataVersion extends BasicFunctions {
    constructor({
        oid,
        name,
        defineVersion,
        commentOid,
        description,
        standards = {},
        valueLists = {},
        whereClauses = {},
        itemGroups = {},
        itemDefs = {},
        codeLists = {},
        methods = {},
        comments = {},
        leafs = {},
        model,
        lang = 'en',
        annotatedCrf = {},
        supplementalDoc = {},
        order = { itemGroupOrder: [], codeListOrder: [], leafOrder: [] }
    } = {}) {
        super();
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.defineVersion = defineVersion;
        this.description = description;
        this.commentOid = commentOid; //2.1
        // Child elements
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
        // Non-define XML properties
        this.model = model;
        if (order !== undefined) {
            this.order = order;
        } else {
            this.order = {
                itemGroupOrder: [],
                codeListOrder: [],
                leafOrder: [],
                standardOrder: []
            };
        }
        if (lang !== undefined) {
            this.lang = lang;
        } else {
            this.lang = 'en';
        }
    }
    addStandard(standard) {
        this.standards[standard.oid] = standard;
    }
    addItemGroup(itemGroup) {
        this.itemGroups[itemGroup.oid] = itemGroup;
    }
}

class Standard {
    constructor({
        oid,
        name,
        type,
        publishingSet,
        version,
        status,
        isDefault,
        commentOid
    } = {}) {
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.type = type;
        this.publishingSet = publishingSet;
        this.version = version;
        this.isDefault = isDefault;
        this.commentOid = commentOid;
    }
}

class GlobalVariables {
    constructor({ protocolName, studyName, studyDescription } = {}) {
        this.protocolName = protocolName;
        this.studyName = studyName;
        this.studyDescription = studyDescription;
    }
}

class Study {
    constructor({ oid, metaDataVersion, globalVariables } = {}) {
        this.oid = oid;
        this.globalVariables = globalVariables;
        if (metaDataVersion === undefined) {
            this.metaDataVersion = new MetaDataVersion();
        } else {
            this.metaDataVersion = metaDataVersion;
        }
    }
}

class Odm {
    constructor({
        schemaLocation,
        odmVersion,
        fileType,
        fileOid,
        creationDateTime,
        asOfDateTime,
        originator,
        sourceSystem,
        sourceSystemVersion,
        context,
        study,
        xlink,
        def,
        xmlns,
        xsi
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
        this.xlink = xlink;
        this.def = def;
        this.xmlns = xmlns;
        this.xsi = xsi;
        if (study === undefined) {
            this.study = new Study();
        } else {
            this.study = study;
        }
    }
}

class ItemGroup extends BasicFunctions {
    constructor({
        oid,
        name,
        domain,
        datasetName,
        repeating,
        isReferenceData,
        purpose,
        structure,
        datasetClass,
        archiveLocationId,
        commentOid,
        isNotStandard,
        standardOid,
        alias,
        leaf,
        descriptions = [],
        itemRefs = {},
        itemRefOrder = [],
        keyOrder = []
    } = {}) {
        super();
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.domain = domain;
        this.datasetName = datasetName;
        this.repeating = repeating;
        this.isReferenceData = isReferenceData;
        this.purpose = purpose;
        this.structure = structure;
        this.datasetClass = datasetClass;
        this.archiveLocationId = archiveLocationId;
        this.commentOid = commentOid;
        this.isNotStandard = isNotStandard;
        this.standardOid = standardOid;
        this.descriptions = descriptions;
        this.itemRefs = itemRefs;
        this.itemRefOrder = itemRefOrder;
        this.keyOrder = keyOrder;
        this.alias = alias;
        if (leaf !== undefined) {
            this.leaf = leaf;
        } else {
            this.leaf = new Leaf();
        }
    }
    addItemRef(oid, itemRef) {
        this.itemRefs[oid] = itemRef;
    }
    getOidByName(name, itemDefs) {
        let result;
        Object.keys(this.itemRefs).some(itemRefOid => {
            if (
                itemDefs[this.itemRefs[itemRefOid].itemOid].name.toLowerCase() ===
        name.toLowerCase()
            ) {
                result = this.itemRefs[itemRefOid].itemOid;
                return true;
            }
            return false;
        });
        return result;
    }
}

class ItemDef extends BasicFunctions {
    constructor({
        oid,
        name,
        dataType,
        length,
        fractionDigits,
        fieldName,
        displayFormat,
        commentOid,
        codeListOid,
        valueList,
        valueListOid,
        parent,
        note,
        varLength,
        lengthAsData,
        lengthAsCodeList,
        parentItemDefOid,
        origins = [],
        descriptions = [],
        sources
    } = {}) {
        super();
        this.oid = oid || getOid(this.constructor.name);
        this.name = name;
        this.dataType = dataType;
        this.length = length;
        this.fractionDigits = fractionDigits;
        this.fieldName = fieldName;
        this.displayFormat = displayFormat;
        this.commentOid = commentOid;
        this.origins = origins;
        this.codeListOid = codeListOid;
        this.valueListOid = valueListOid;
        this.descriptions = descriptions;
        // Non-define XML properties
        // Parent Item for VLM records
        this.parentItemDefOid = parentItemDefOid;
        // Programming Note
        if (note === undefined) {
            this.note = note;
        } else {
            this.note = new Note();
        }
        // Length derived from data/codelist
        this.lengthAsData = lengthAsData;
        this.lengthAsCodeList = lengthAsCodeList;
        // List of itemGroups from which the itemDef is linked
        if (sources !== undefined) {
            this.sources = sources;
        } else {
            this.sources = {
                itemGroups: [],
                valueLists: []
            };
        }
    }
    addOrigin(origin) {
        this.origins.push(origin);
    }
}

class ItemRef {
    constructor({
        mandatory,
        methodOid,
        oid,
        role,
        roleCodeListOid,
        itemOid,
        isNotStandatd,
        whereClauseOid
    } = {}) {
        this.mandatory = mandatory;
        this.methodOid = methodOid;
        this.isNotStandard = isNotStandatd;
        this.role = role;
        this.roleCodeListOid = roleCodeListOid;
        this.itemOid = itemOid;
        this.whereClauseOid = whereClauseOid;
        // Non-define XML properties
        this.oid = oid || getOid(this.constructor.name);
    }
}

class ValueList extends BasicFunctions {
    constructor({
        oid,
        itemRefs = {},
        itemRefOrder = [],
        descriptions = [],
        keyOrder = [],
        sources
    } = {}) {
        super();
        this.oid = oid || getOid(this.constructor.name);
        this.itemRefs = itemRefs;
        this.itemRefOrder = itemRefOrder;
        this.descriptions = descriptions; // 2.1D
        this.keyOrder = keyOrder;
        // Non-define XML properties
        if (sources !== undefined) {
            this.sources = sources;
        } else {
            this.sources = {
                itemDefs: []
            };
        }
    }
    addItemRef(oid, itemRef) {
        this.itemRefs[oid] = itemRef;
    }
}

module.exports = {
    Odm: Odm,
    Study: Study,
    GlobalVariables: GlobalVariables,
    MetaDataVersion: MetaDataVersion,
    Standard: Standard,
    ValueList: ValueList,
    WhereClause: WhereClause,
    RangeCheck: RangeCheck,
    ItemGroup: ItemGroup,
    ItemRef: ItemRef,
    ItemDef: ItemDef,
    CodeList: CodeList,
    FormalExpression: FormalExpression,
    Method: Method,
    TranslatedText: TranslatedText,
    ExternalCodeList: ExternalCodeList,
    CodeListItem: CodeListItem,
    EnumeratedItem: EnumeratedItem,
    Alias: Alias,
    Origin: Origin,
    Comment: Comment,
    Document: Document,
    PdfPageRef: PdfPageRef,
    Leaf: Leaf,
    Note: Note
};
