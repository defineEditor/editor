import stdColumns from 'constants/columns.js';

// UI
const main = (() => {
    return {
        mainMenuOpened: false,
        currentPage: 'studies',
        currentDefineId: '',
        isCurrentDefineSaved: true,
        quitNormally: null,
        reviewMode: false,
        showDataInput: false,
        copyBuffer: {},
    };
})();

const tabs = (() => {
    /* TODO: 'Methods', 'Comments', 'Where Conditions'*/
    let tabNames = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Coded Values', 'Documents'];
    let tabObjectNames = ['standards', 'datasets', 'variables', 'codeLists', 'codedValues', 'documents'];

    let setting = {
        windowScrollPosition: 0,
    };

    let settings = [];
    for (let i = 0; i < tabNames.length; i++) {
        let tabObjectName = tabObjectNames[i];
        settings[i] = { ...setting };
        if (['Datasets', 'Variables', 'Codelists', 'Coded Values'].includes(tabNames[i])) {
            settings[i].rowSelect = {};
        }
        // When tab has multiple tables
        if (['Variables', 'Coded Values'].includes(tabNames[i])) {
            settings[i].vlmState = {};
            settings[i].scrollPosition = {};
            settings[i].groupOid = undefined;
            settings[i].filter = {
                isEnabled: false,
                applyToVlm: true,
                conditions: [],
                connectors: [],
            };
        }
        // Column state
        if (['Datasets', 'Variables','Codelists','Coded Values'].includes(tabNames[i])) {
            settings[i].columns = {};
            Object.keys(stdColumns[tabObjectName]).forEach( columnName => {
                settings[i].columns[columnName] = { hidden: stdColumns[tabObjectName][columnName].hidden };
            });
        }
    }

    return {
        tabNames,
        tabObjectNames,
        currentTab: 2,
        settings,
    };
})();

const modal = {
    type: null,
    props: {},
};

const studies = {
    orderType      : 'alphabetical',
    defineForm     : false,
    currentStudyId : '',
};

const ui = {
    main,
    tabs,
    modal,
    studies,
};

const initialValues = {
    ui,
};

export default initialValues;
