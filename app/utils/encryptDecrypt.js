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

import crypto from 'crypto';
import os from 'os';

const iv = crypto.randomBytes(16);

const getKey = () => {
    // Get some key, which depends on a user system
    let secret = '';
    try {
        let interfaces = os.networkInterfaces();
        let mac = '';
        if (interfaces.eth0 && interfaces.eth0[0] && interfaces.eth0[0].mac) {
            mac = interfaces.eth0[0].mac;
        } else if (Object.values(interfaces)[0] && Object.values(interfaces)[0][0] && Object.values(interfaces)[0][0].mac) {
            mac = Object.values(interfaces)[0][0].mac;
        }
        secret = mac + os.platform() + os.userInfo().username + os.cpus()[0].model;
    } catch (error) {
        secret = 'somethingWentWrong';
    }
    let salt = os.platform();
    return crypto.pbkdf2Sync(secret, salt, 100, 32, 'sha256');
};

const encrypt = (text, key) => {
    try {
        // Use mac as a default key to encrypt the password, it is not a real protection, still better than plaintext
        if (key === undefined) {
            key = getKey();
        }
        let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        return '';
    }
};

function decrypt (text, key) {
    try {
        if (key === undefined) {
            key = getKey();
        }
        let iv = Buffer.from(text.split(':')[0], 'hex');
        let encryptedText = text.split(':')[1];
        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return '';
    }
}

export default { encrypt, decrypt };
