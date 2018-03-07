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
    clone() {
        return new TranslatedText(this);
    }
}

class BasicFunctions {
    addDescription (description) {
        if (description === undefined) {
            this.descriptions.push(new TranslatedText({value: ''}));
        } else {
            this.descriptions.push(description);
        }
    }
    getDescription (language) {
        if (this.descriptions.length === 1) {
            return this.descriptions[0].value;
        } else {
            return undefined;
        }
    }
    setDescription (value, language = 'en') {
        let updatedFlag = false;
        // No description yet
        if (this.descriptions.length === 0) {
            this.descriptions.push(new TranslatedText({lang: 'language', value: value}));
            updatedFlag = true;
        } else {
        // Search for a description with a specific language and update it
            this.descriptions.forEach( (description, index) => {
                if (description.lang === language) {
                    this.descriptions[index] = new TranslatedText({lang: language, value: value});
                    updatedFlag = true;
                }
            });
        }
        // In case there is a description without language, use it as default;
        if (updatedFlag === false && this.descriptions.length === 1
            && this.descriptions[0].lang === undefined && language === 'en'
        ) {
            this.descriptions[0] = new TranslatedText({value: value});
        }
    }
}

class StdCodeList extends BasicFunctions {
    constructor ({
        oid, name, dataType, standard, sasFormatName, comment, externalCodeList, alias, cdiscSubmissionValue,
        descriptions = [],
        enumeratedItems = [],
        codeListItems = []
    } = {}) {
        super();
        this.oid = oid;
        this.name = name;
        this.dataType = dataType;
        this.alias = alias;
        this.descriptions = descriptions;
        this.codeListItems = codeListItems;
        this.cdiscSubmissionValue = cdiscSubmissionValue;
    }
    addCodeListItem (item) {
        this.codeListItems.push(item);
    }
    setExternalCodeList (item) {
        this.externalCodeList = item;
    }
    getCodeListType () {
        return 'decoded';
    }
}

class StdEnumeratedItem {
    constructor ({
        codedValue, alias
    } = {}) {
        this.codedValue = codedValue;
        this.alias = alias;
    }
}

class StdCodeListItem extends StdEnumeratedItem {
    constructor ({
        codedValue, alias,
        decodes = []
    } = {}) {
        super({
            codedValue : codedValue,
            alias      : alias
        });
        this.decodes = decodes;
    }
    addDecode (decode) {
        this.decodes.push(decode);
    }
    getDecode (language) {
        if (this.decodes.length === 1) {
            return this.decodes[0].value;
        } else {
            return undefined;
        }
    }
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

class MetaDataVersion extends BasicFunctions {
    constructor ({
        oid, name, defineVersion, comment,
        standards, valueLists, whereClauses,
        itemGroups, itemDefs, codeLists, methods, comments, leafs, model,
        annotatedCrf = [],
        supplementalDoc = [],
        descriptions = []
    } = {}) {
        super();
        this.oid = oid;
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
        this.model = model;
    }
    addStandard (standard) {
        this.standards.push(standard);
    }
    addItemGroup (itemGroup) {
        this.itemGroups[itemGroup.oid] = itemGroup;
    }
    getOidByName (source, name) {
        let result;
        Object.keys(this[source]).some( oid => {
            if (this[source][oid].name.toLowerCase() === name.toLowerCase()) {
                result = oid;
                return true;
            }
            return false;
        });
        return result;
    }
}

module.exports = {
    Odm               : Odm,
    Study             : Study,
    GlobalVariables   : GlobalVariables,
    MetaDataVersion   : MetaDataVersion,
    StdCodeList       : StdCodeList,
    TranslatedText    : TranslatedText,
    StdCodeListItem   : StdCodeListItem,
    StdEnumeratedItem : StdEnumeratedItem,
    Alias             : Alias,
};
