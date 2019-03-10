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
        quitNormally: null,
        reviewMode: false,
        showDataInput: false,
        copyBuffer: {},
        dummyActionTimeStamp: '',
    };
})();

const tabs = (() => {
    /* TODO: 'Methods', 'Comments', 'Where Conditions' */
    let tabNames = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Coded Values', 'Documents', 'ARM Summary', 'Analysis Results'];
    let tabObjectNames = ['standards', 'datasets', 'variables', 'codeLists', 'codedValues', 'documents', 'armSummary', 'analysisResults'];

    let setting = {
        windowScrollPosition: 0,
    };

    let settings = [];
    for (let i = 0; i < tabNames.length; i++) {
        let tabObjectName = tabObjectNames[i];
        settings[i] = { ...setting };
        if (['Datasets', 'Variables', 'Codelists', 'Coded Values', 'ARM Summary'].includes(tabNames[i])) {
            settings[i].rowSelect = {};
        }
        if (['Variables'].includes(tabNames[i])) {
            settings[i].pagination = {};
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
        if (['Datasets', 'Variables', 'Codelists', 'Coded Values', 'ARM Summary'].includes(tabNames[i])) {
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

const studies = {
    orderType: 'alphabetical',
    defineForm: false,
    currentStudyId: '',
};

const ui = {
    main,
    tabs,
    modal,
    studies,
};

// Settings
const general = {
    userName: 'Winnie-the-Pooh',
    controlledTerminologyLocation: '',
    alwaysSaveDefineXml: true,
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
    textInstantProcessing: false,
    enableSelectForStdCodedValues: true,
    showLineNumbersInCode: false,
    removeTrailingSpacesWhenParsing: true,
    enableTablePagination: false,
    defaultRowsPerPage: 25,
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

const initialValues = {
    ui,
    settings,
};

export default initialValues;
