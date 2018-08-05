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
        id, name, image, lastChanged,
    } = {}) {
        this.id = id;
        this.name = name;
        if (lastChanged !== undefined) {
            this.lastChanged = lastChanged;
        } else {
            this.lastChanged = new Date().toISOString();
        }
    }
}

module.exports = {
    Study,
    Define,
};
