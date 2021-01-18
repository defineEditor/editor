/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2018-2021 Dmitry Kolosov                                           *
 *                                                                                  *
 * Visual Define-XML Editor is free software: you can redistribute it and/or modify *
 * it under the terms of version 3 of the GNU Affero General Public License         *
 *                                                                                  *
 * Visual Define-XML Editor is distributed in the hope that it will be useful,      *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
 * version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
 ***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import clone from 'clone';
import SettingTabs from 'components/settings/tabs.js';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import { initCdiscLibrary, updateCdiscLibrarySettings, dummyRequest } from 'utils/cdiscLibraryUtils.js';
import saveState from 'utils/saveState.js';
import { updateSettings, openModal, openSnackbar } from 'actions/index.js';
import { encrypt, decrypt } from 'utils/encryptDecrypt.js';

const appVersion = process.argv.filter(arg => arg.startsWith('--vdeVersion')).map(arg => arg.replace(/.*:\s*(.*)/, '$1'))[0];
const appName = process.argv.filter(arg => arg.startsWith('--vdeName')).map(arg => arg.replace(/.*:\s*(.*)/, '$1').replace(/_/g, ' '))[0];

const mapDispatchToProps = dispatch => {
    return {
        updateSettings: updateObj => dispatch(updateSettings(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
        openSnackbar: (updateObj) => dispatch(openSnackbar(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        settings: state.present.settings
    };
};

class ConnectedSettings extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
        this.state.settings = clone(this.props.settings);
        // Decrypt the cdiscLibrary password/apiKey
        if (this.state.settings.cdiscLibrary && this.state.settings.cdiscLibrary.password) {
            this.state.settings.cdiscLibrary.password = decrypt(this.state.settings.cdiscLibrary.password);
            // Keep the decrypted password for comparison
            this.state.originalPassword = this.state.settings.cdiscLibrary.password;
        }
        if (this.state.settings.cdiscLibrary && this.state.settings.cdiscLibrary.apiKey) {
            this.state.settings.cdiscLibrary.apiKey = decrypt(this.state.settings.cdiscLibrary.apiKey);
            // Keep the decrypted apieKey for comparison
            this.state.originalApiKey = this.state.settings.cdiscLibrary.apiKey;
        }
        // Check if default System is used
        if (this.state.settings.define && this.state.settings.define.sourceSystem === appName) {
            this.state.defaultSource = true;
        } else {
            this.state.defaultSource = false;
        }
        this.state.showEncryptedValue = false;
    }

    static contextType = CdiscLibraryContext;

    componentDidMount () {
        ipcRenderer.on('selectedFile', this.setFolder);
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('selectedFile', this.setFolder);
        window.removeEventListener('keydown', this.onKeyDown);
        // If settings are not saved, open a confirmation window
        let diff = this.getSettingsDiff();
        if (Object.keys(diff).length > 0) {
            this.props.openModal({
                type: 'SAVE_SETTINGS',
                props: { updatedSettings: diff }
            });
        }
    }

    setFolder = (event, location, title) => {
        if (title === 'Select Controlled Terminology Folder') {
            this.handleChange('general', 'controlledTerminologyLocation')(location);
        } else if (title === 'Select Backup Folder') {
            this.handleChange('backup', 'backupFolder')(location);
        }
    };

    selectLocation = (type) => {
        if (type === 'ct') {
            ipcRenderer.send('selectFile', 'Select Controlled Terminology Folder',
                { initialFolder: this.props.settings.general.controlledTerminologyLocation, type: 'openDirectory' }
            );
        } else if (type === 'backup') {
            ipcRenderer.send('selectFile', 'Select Backup Folder',
                { initialFolder: this.props.settings.backup.backupFolder, type: 'openDirectory' }
            );
        }
    };

    makeBackup = () => {
        // Save state without writing any current Define-XML changes
        saveState('noWrite');
        ipcRenderer.send('makeBackup', this.state.settings.backup);
    };

    loadBackup = () => {
        ipcRenderer.send('loadBackup', this.state.settings.backup);
    };

    handleChange = (category, name) => (event, checked) => {
        if (category === 'defaultSource') {
            if (this.state.defaultSource === false && this.state.settings.define && this.state.settings.define.sourceSystem !== appName) {
                this.setState({
                    defaultSource: !this.state.defaultSource,
                    settings: { ...this.state.settings,
                        define: { ...this.state.settings.define, sourceSystem: appName, sourceSystemVersion: appVersion }
                    },
                });
            } else {
                if (this.state.settings.define && this.state.settings.define.sourceSystem === appName) {
                    this.setState({
                        defaultSource: !this.state.defaultSource,
                        settings: { ...this.state.settings,
                            define: { ...this.state.settings.define, sourceSystemVersion: appVersion }
                        },
                    });
                } else {
                    this.setState({ defaultSource: !this.state.defaultSource });
                }
            }
        } else if (name === 'controlledTerminologyLocation') {
            this.setState({
                settings: { ...this.state.settings,
                    [category]: { ...this.state.settings[category], [name]: event }
                },
            });
        } else if ([
            'removeUnusedCodeListsInDefineXml',
            'getNameLabelFromWhereClause',
            'lengthForAllDataTypes',
            'textInstantProcessing',
            'enableSelectForStdCodedValues',
            'enableTablePagination',
            'enableProgrammingNote',
            'alwaysSaveDefineXml',
            'showLineNumbersInCode',
            'removeTrailingSpacesWhenParsing',
            'stripWhitespacesForCodeValues',
            'allowNonExtCodeListExtension',
            'allowSigDigitsForNonFloat',
            'showVlmWithParent',
            'disableAnimations',
            'checkForUpdates',
            'addStylesheet',
            'onlyArmEdit',
            'enableCdiscLibrary',
            'checkForCLUpdates',
            'oAuth2',
            'enableBackup',
            'backupControlledTerminology',
        ].includes(name) || category === 'popUp') {
            this.setState({
                settings: { ...this.state.settings,
                    [category]: { ...this.state.settings[category], [name]: checked }
                },
            });
        } else if (['sourceSystemVersion'].includes(name)) {
            // Version can be changed only when sourceSystem is modified
            if (this.state.settings.define && this.state.settings.define.sourceSystem !== appName) {
                this.setState({
                    settings: { ...this.state.settings,
                        [category]: { ...this.state.settings[category], [name]: event.target.value }
                    },
                });
            }
        } else if (category === 'backup') {
            if (name === 'backupFolder') {
                this.setState({
                    settings: { ...this.state.settings,
                        [category]: { ...this.state.settings[category], [name]: event }
                    },
                });
            } else {
                if (event.target.value && /^\d+$/.test(event.target.value.trim())) {
                    this.setState({
                        settings: { ...this.state.settings,
                            [category]: { ...this.state.settings[category], [name]: parseInt(event.target.value) }
                        },
                    });
                }
                if (event.target.value === '') {
                    this.setState({
                        settings: { ...this.state.settings,
                            [category]: { ...this.state.settings[category], [name]: 0 }
                        },
                    });
                }
            }
        } else {
            this.setState({
                settings: { ...this.state.settings,
                    [category]: { ...this.state.settings[category], [name]: event.target.value }
                },
            });
        }
    };

    getSettingsDiff = () => {
        let result = {};
        let newSettings = clone(this.state.settings);
        Object.keys(newSettings).forEach(category => {
            Object.keys(newSettings[category]).forEach(setting => {
                if (
                    newSettings[category][setting] !==
                    this.props.settings[category][setting]
                ) {
                    result[category] = {
                        ...result[category],
                        [setting]: newSettings[category][setting]
                    };
                }
            });
        });
        // Password is encrypted in settings, so compare it with decrypted value in state
        if (result.cdiscLibrary && result.cdiscLibrary.password && result.cdiscLibrary.password === this.state.originalPassword) {
            delete result.cdiscLibrary.password;
            if (Object.keys(result.cdiscLibrary).length === 0) {
                delete result.cdiscLibrary;
            }
        }
        if (result.cdiscLibrary && result.cdiscLibrary.apiKey && result.cdiscLibrary.apiKey === this.state.originalApiKey) {
            delete result.cdiscLibrary.apiKey;
            if (Object.keys(result.cdiscLibrary).length === 0) {
                delete result.cdiscLibrary;
            }
        }
        return result;
    }

    save = () => {
        let diff = this.getSettingsDiff();
        if (Object.keys(diff).length > 0) {
            // Update CDISC Library credentials
            if (diff.cdiscLibrary) {
                // Save the new unencrypted password/apiKey in state
                if (diff.cdiscLibrary.password) {
                    this.setState({ originalPassword: diff.cdiscLibrary.password });
                }
                if (diff.cdiscLibrary.apiKey) {
                    this.setState({ originalApiKey: diff.cdiscLibrary.apiKey });
                }
                // If password/apiKey was changed, it is encrypted by the updateCdiscLibrarySettings
                diff.cdiscLibrary = updateCdiscLibrarySettings(diff.cdiscLibrary, this.props.settings.cdiscLibrary, this.context);
            }
            this.props.updateSettings(diff);
        }
    };

    cancel = () => {
        let newState = clone(this.props.settings);
        // Decrypt the cdiscLibrary password/apiKey
        if (newState.cdiscLibrary && newState.cdiscLibrary.password) {
            newState.cdiscLibrary.password = decrypt(newState.cdiscLibrary.password);
        }
        if (newState.cdiscLibrary && newState.cdiscLibrary.apiKey) {
            newState.cdiscLibrary.apiKey = decrypt(newState.cdiscLibrary.apiKey);
        }
        this.setState({ settings: newState });
    };

    onKeyDown = event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && event.keyCode === 83) {
            this.save();
        }
    };

    handleClickShowEncyptedValue = () => {
        this.setState(state => ({ showEncryptedValue: !state.showEncryptedValue }));
    };

    checkCdiscLibraryConnection = async () => {
        // For the check, create a new instance of CDISC Library, because user may have not saved the changed settings
        let claSettings = clone(this.state.settings.cdiscLibrary);
        // Encrypt password/apiKey
        claSettings.password = encrypt(claSettings.password);
        claSettings.apiKey = encrypt(claSettings.apiKey);
        let newCl = initCdiscLibrary(claSettings);
        // As bug workaround, send a dummy request in 1 seconds if the object did not load
        if (process.platform === 'linux') {
            setTimeout(() => {
                dummyRequest(newCl.cdiscLibrary);
            }, 1000);
        }
        let check = await newCl.checkConnection();
        if (!check || check.statusCode === -1) {
            this.props.openSnackbar({
                type: 'error',
                message: 'Failed to connected to CDISC Library.',
            });
        } else if (check.statusCode !== 200) {
            this.props.openSnackbar({
                type: 'error',
                message: `Failed to connected to CDISC Library. Status code ${check.statusCode}: ${check.description}`,
            });
        } else {
            this.props.openSnackbar({
                type: 'success',
                message: 'Successfully connected to the CDISC Library.',
            });
        }
    }

    cleanCdiscLibraryCache = () => {
        this.props.openModal({
            type: 'CLEAN_CDISC_LIBRARY_CACHE',
        });
    }

    render () {
        let settingsNotChanged = Object.keys(this.getSettingsDiff()).length === 0;

        return (
            <SettingTabs
                state={this.state}
                handleChange={this.handleChange}
                selectLocation={this.selectLocation}
                appVersion={appVersion}
                appName={appName}
                checkCdiscLibraryConnection={this.checkCdiscLibraryConnection}
                handleClickShowEncyptedValue={this.handleClickShowEncyptedValue}
                cleanCdiscLibraryCache={this.cleanCdiscLibraryCache}
                makeBackup={this.makeBackup}
                loadBackup={this.loadBackup}
                save={this.save}
                cancel={this.cancel}
                settingsNotChanged={settingsNotChanged}
            />
        );
    }
}

ConnectedSettings.propTypes = {
    settings: PropTypes.object.isRequired,
    updateSettings: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    openSnackbar: PropTypes.func.isRequired,
};

const Settings = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedSettings
);
export default Settings;
