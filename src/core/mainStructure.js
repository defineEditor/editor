class Study {
    constructor ({
        id, name, image, lastChanged,
        defines = [],
    } = {}) {
        this.id = id;
        this.name = name;
        this.image = image;
        if (lastChanged !== undefined) {
            this.lastChanged = lastChanged;
        } else {
            this.lastChanged = new Date();
        }
    }
}

class Define {
    constructor ({
        id, name, image, lastChanged,
        defines = [],
    } = {}) {
        this.id = id;
        this.name = name;
        if (lastChanged !== undefined) {
            this.lastChanged = lastChanged;
        } else {
            this.lastChanged = new Date();
        }
    }
}

module.exports = {
    Study,
    Define,
};
