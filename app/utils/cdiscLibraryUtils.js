/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/
import store from 'store/index.js';
import { CdiscLibrary } from 'cla-wrapper';
import clone from 'clone';
import { encrypt, decrypt } from 'utils/encryptDecrypt.js';
import { openDB } from 'idb';
import Jszip from 'jszip';

const getRequestId = async (request) => {
    let shortenedUrl = request.url
        .replace('/root/', '/r/')
        .replace('/cdash/', '/cd/')
        .replace('/cdashig/', '/cdi/')
        .replace('/sdtm/', '/s/')
        .replace('/sdtmig/', '/si/')
        .replace('/send/', '/se/')
        .replace('/sendig/', '/sei/')
        .replace('/adam/', '/a/')
        .replace('/datasets/', '/d/')
        .replace('/domains/', '/dm/')
        .replace('/datastructures/', '/ds/')
        .replace('/classes/', '/c/')
        .replace('/variables/', '/v/')
        .replace('/fields/', '/f/')
        .replace('/varsets/', '/vs/')
        .replace('/packages/', '/p/')
        .replace('/codelists/', '/cl/')
        .replace('/terms/', '/t/')
        .replace('/scenarios/', '/s/')
        .replace(/.*?\/mdr\//, '')
    ;
    let requestOptions = JSON.stringify({ ...request.headers });
    let hash = await window.crypto.subtle.digest('SHA-1', new TextEncoder().encode(requestOptions));
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    if (request && request.headers && request.headers.Accept === 'application/json') {
        // These are standard request options, no need to add a hash code
        return shortenedUrl;
    } else {
        return shortenedUrl + hashHex;
    }
};

const claMatch = async (request) => {
    // Get an id
    let id = await getRequestId(request);

    const db = await openDB('cdiscLibrary-store', 1, {
        upgrade (db) {
            db.createObjectStore('cdiscLibrary', {});
        },
    });

    // Search for the response in cache
    let response = await db.get('cdiscLibrary', id);
    if (response !== undefined) {
        let zippedData = response.data;
        let zip = new Jszip();
        await zip.loadAsync(zippedData);
        if (Object.keys(zip.files).includes('response.json')) {
            let result = await zip.file('response.json').async('string');
            return { statusCode: 200, body: result };
        }
    }
};

const claPut = async (request, response) => {
    // Get an id
    let id = await getRequestId(request);
    // Minify the response
    let data = JSON.parse(response.body);
    // Compress the data
    let zip = new Jszip();
    zip.file('response.json', JSON.stringify(data));
    let zippedData = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 7
        }
    });

    const db = await openDB('cdiscLibrary-store', 1, {
        upgrade (db) {
            db.createObjectStore('cdiscLibrary', {});
        },
    });

    // Add response to cache
    await db.put('cdiscLibrary', { date: new Date(), data: zippedData }, id);
};

const initCdiscLibrary = (settings) => {
    let claSettings = {};
    let state = store.getState().present;
    if (settings !== undefined) {
        claSettings = settings;
    } else if (state.settings && state.settings.cdiscLibrary) {
        claSettings = state.settings.cdiscLibrary;
    }
    let info = {};
    if (state.ui && state.ui.cdiscLibrary && state.ui.cdiscLibrary.info) {
        info = state.ui.cdiscLibrary.info;
    }

    if (claSettings.enableCdiscLibrary === true) {
        let options = {
            username: claSettings.username,
            password: decrypt(claSettings.password),
            baseUrl: claSettings.baseUrl,
            cache: { match: claMatch, put: claPut },
        };
        if (info) {
            options.traffic = info.traffic;
        }
        return new CdiscLibrary(options);
    } else {
        return {};
    }
};

const updateCdiscLibrarySettings = (settingsDiff, originalSettings, cdiscLibraryKit) => {
    // Encrypt the cdiscLibrary password
    let diff = clone(settingsDiff);
    if (diff.password) {
        diff.password = encrypt(diff.password);
    }
    // Enable/Disable the CDISC Library
    if (diff.enableCdiscLibrary === true) {
        let settings = { ...originalSettings, ...diff };
        cdiscLibraryKit.updateCdiscLibrary(initCdiscLibrary(settings));
    } else if (diff.enableCdiscLibrary === false) {
        cdiscLibraryKit.updateCdiscLibrary({});
    } else if (originalSettings.enableCdiscLibrary === true) {
        // If the credentials were changed, use the new
        let coreObject = cdiscLibraryKit.cdiscLibrary.coreObject;
        if (diff.username !== undefined) {
            coreObject.username = diff.username;
        }
        if (diff.password !== undefined) {
            coreObject.password = decrypt(diff.password);
        }
        if (diff.baseUrl !== undefined) {
            coreObject.baseUrl = diff.baseUrl;
        }
    }
    // Returns settings with encrypted password if it was in diff
    return diff;
};

const dummyRequest = async (cl) => {
    // There is a glitch in linux, which causes the response not to come back in some cases
    // https://github.com/electron/electron/issues/10570
    // It is currently fixed by sending a dummy request in 1 second if the main response did not come back
    try {
        await cl.coreObject.apiRequest('/dummyEndpoint', { noCache: true });
    } catch (error) {
        // It is expected to fail, so do nothing
    }
};

export default { initCdiscLibrary, updateCdiscLibrarySettings, dummyRequest };
