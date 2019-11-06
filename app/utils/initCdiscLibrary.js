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
import { decrypt } from 'utils/encryptDecrypt.js';
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
        .replace('/root/', '/r/')
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
    let requestOptions = JSON.toString({ ...request, url: undefined });
    let hash = await window.crypto.subtle.digest('SHA-1', new TextEncoder().encode(requestOptions));
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    if (hashHex === '0afd4c0de6a7b1a685edd9e8d152d66d5b4b7bd0') {
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
            // Create a store of objects
            db.createObjectStore('cdiscLibrary', {});
        },
    });

    // Search for an response in cache
    let zippedData = await db.get('cdiscLibrary', id);
    if (zippedData !== undefined) {
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
            // Create a store of objects
            db.createObjectStore('cdiscLibrary', {});
        },
    });

    // Add response to cache
    await db.put('cdiscLibrary', zippedData, id);
};

const initCdiscLibrary = () => {
    let claSettings = {};
    let state = store.getState().present;
    if (state.settings && state.settings.cdiscLibrary) {
        claSettings = state.settings.cdiscLibrary;
    }

    if (claSettings.enableCdiscLibrary === true) {
        return new CdiscLibrary({
            username: claSettings.username,
            password: decrypt(claSettings.password),
            baseUrl: claSettings.baseUrl,
            cache: { match: claMatch, put: claPut },
        });
    } else {
        return {};
    }
};

export default initCdiscLibrary;
