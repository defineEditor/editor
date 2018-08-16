class Study {
    constructor ({
        id, name, image, lastChanged,
        defineIds = [],
    } = {}) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.defineIds = defineIds;
        if (lastChanged !== undefined) {
            this.lastChanged = lastChanged;
        } else {
            this.lastChanged = new Date().toISOString();
        }
    }
}

class Define {
    constructor ({
        id, name, image, lastChanged, stats, pathToFile,
    } = {}) {
        this.id = id;
        this.name = name;
        this.pathToFile = pathToFile;
        if (stats !== undefined) {
            this.stats = stats;
        } else {
            this.stats = {
                datasets : 0,
                variables : 0,
                codeLists : 0,
            };
        }
        if (lastChanged !== undefined) {
            this.lastChanged = lastChanged;
        } else {
            this.lastChanged = new Date().toISOString();
        }
    }
}

class ControlledTerminology {
    constructor ({
        id, name, version, codeListCount, pathToFile, isDefault, sources, isCdiscNci, publishingSet
    } = {}) {
        this.id = id;
        this.name = name;
        this.version = version;
        this.codeListCount = codeListCount;
        this.pathToFile = pathToFile;
        this.isDefault = isDefault || false;
        this.isCdiscNci = isCdiscNci;
        this.publishingSet = publishingSet;
        if (sources === undefined) {
            this.sources = {
                defineIds: [],
            };
        } else {
            this.sources = sources;
        }
    }
}

module.exports = {
    Study,
    Define,
    ControlledTerminology,
};
