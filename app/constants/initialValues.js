/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import { remote } from 'electron';
import stdColumns from 'constants/columns.js';

// UI
const main = (() => {
    return {
        mainMenuOpened: false,
        currentPage: 'studies',
        currentDefineId: '',
        currentStudyId: '',
        isCurrentDefineSaved: true,
        lastSaveHistoryIndex: 0,
        quitNormally: null,
        reviewMode: false,
        showDataInput: false,
        sampleStudyCopied: false,
        copyBuffer: {},
        dummyActionTimeStamp: '',
        actionHistory: [],
        rowsPerPage: {
            variableTab: 50,
            codeListTab: 100,
            codedValuesTab: 100,
        },
        pathToLastFile: undefined,
    };
})();

const tabs = (() => {
    /* TODO: 'Methods', 'Comments', 'Where Conditions' */
    let tabNames = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Coded Values', 'Documents', 'Result Displays', 'Analysis Results', 'Review Comments'];
    let tabObjectNames = ['standards', 'datasets', 'variables', 'codeLists', 'codedValues', 'documents', 'resultDisplays', 'analysisResults', 'reviewComments'];

    let setting = {
        windowScrollPosition: 0,
    };

    let settings = [];
    for (let i = 0; i < tabNames.length; i++) {
        let tabObjectName = tabObjectNames[i];
        settings[i] = { ...setting };
        if (['Datasets', 'Variables', 'Codelists', 'Coded Values', 'Result Displays'].includes(tabNames[i])) {
            settings[i].rowSelect = {};
        }
        if (['Variables', 'Codelists', 'Coded Values'].includes(tabNames[i])) {
            settings[i].pagination = {};
        }
        if (tabNames[i] === 'Review Comments') {
            settings[i].panelStatus = {};
            settings[i].showResolved = true;
        }
        // When tab has multiple tables
        if (['Variables', 'Coded Values', 'Analysis Results'].includes(tabNames[i])) {
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
        if (['Datasets', 'Variables', 'Codelists', 'Coded Values', 'Result Displays'].includes(tabNames[i])) {
            settings[i].columns = {};
            Object.keys(stdColumns[tabObjectName]).forEach(columnName => {
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

const snackbar = {
    type: null,
    message: undefined,
    props: {},
};

const studiesUi = {
    orderType: 'alphabetical',
    defineForm: false,
    currentStudyId: '',
};

const ui = {
    main,
    tabs,
    modal,
    snackbar,
    studies: studiesUi,
};

// Settings
const general = {
    userName: process.env.USERNAME || process.env.USER || process.env.user || process.env.username || 'Winnie-the-Pooh',
    controlledTerminologyLocation: '',
    alwaysSaveDefineXml: true,
    addStylesheet: true,
    disableAnimations: false,
};

const popUp = {
    onCodeListTypeUpdate: true,
    onCodeListDelete: true,
    onCodeListLink: true,
    onStartUp: true,
};

const editor = {
    removeUnusedCodeListsInDefineXml: true,
    getNameLabelFromWhereClause: true,
    lengthForAllDataTypes: false,
    textInstantProcessing: true,
    enableSelectForStdCodedValues: true,
    showLineNumbersInCode: false,
    removeTrailingSpacesWhenParsing: true,
    enableTablePagination: true,
    enableProgrammingNote: true,
    stripWhitespacesForCodeValues: false,
    allowNonExtCodeListExtension: false,
    allowSigDigitsForNonFloat: false,
    onlyArmEdit: false,
    showVlmWithParent: false,
};

const define = {
    schemaLocation200: 'http://www.cdisc.org/ns/def/v2.0/define2-0-0.xsd',
    schemaLocation210: 'http://www.cdisc.org/ns/def/v2.1/define2-1-0.xsd',
    sourceSystem: remote.app.getName(),
    sourceSystemVersion: remote.app.getVersion(),
    stylesheetLocation: './stylesheet/define2-0-0.xsl'
};

const settings = {
    general,
    editor,
    define,
    popUp,
};

const defines = {
    byId: {
        'NG.DEF.SAMPLE.SDTM': {
            'id': 'NG.DEF.SAMPLE.SDTM',
            'name': 'SDTM',
            'pathToFile': '',
            'stats': {
                'datasets': 4,
                'codeLists': 25,
                'variables': 91,
            },
            'lastChanged': '2019-02-04T15:34:51.947Z'
        },
    },
    allIds: ['NG.DEF.SAMPLE.SDTM']
};

const studies = {
    byId: {
        'NG.SDY.SAMPLE': {
            'id': 'NG.SDY.SAMPLE',
            'name': 'Sample Study',
            'defineIds': [
                'NG.DEF.SAMPLE.SDTM'
            ]
        },
    },
    allIds: ['NG.SDY.SAMPLE']
};

const initialValues = {
    ui,
    settings,
    defines,
    studies,
};

export default initialValues;
