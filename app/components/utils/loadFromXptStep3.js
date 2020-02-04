/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2020 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { withStyles, makeStyles, lighten } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';

const getStyles = makeStyles(theme => ({
    button: {
        marginRight: theme.spacing(1),
    },
    progressBar: {
        marginBottom: theme.spacing(2),
    },
}));

const getItemType = (variable) => {
    if (variable.type === 'Num') {
        return 'integer';
    } else if (variable.type === 'Char') {
        if (variable.name.toUpperCase().endsWith('DTC')) {
            return 'datatime';
        } else {
            return 'text';
        }
    }
};

const UpdatedLinearProgress = withStyles({
    root: {
        height: 10,
        backgroundColor: lighten('#3f51b5', 0.5),
        borderRadius: 30,
    },
    bar: {
        borderRadius: 30,
        backgroundColor: '#3f51b5',
    },
})(LinearProgress);

const getCurrentData = (mdv, dsNames) => {
    let currentData = {};
    mdv.order.itemGroupOrder.forEach(igOid => {
        let itemGroup = mdv.itemGroups[igOid];
        let dsName = itemGroup.name;
        if (!dsNames.includes(itemGroup.name)) {
            // If not in the list of ds names, there is nothing to update
            return;
        }
        currentData[dsName] = {};
        itemGroup.itemRefOrder.forEach(irOid => {
            let item = mdv.itemDefs[itemGroup.itemRefs[irOid].itemOid];
            currentData[dsName][item.name] = {
                dsName: dsName,
                varName: item.name,
                label: item.descriptions.length > 0 ? item.descriptions[0].value : '',
                length: item.length,
                lengthAsData: item.lengthAsData,
                dataType: item.dataType,
                displayFormat: item.displayFormat,
                fractionDigits: item.fractionDigits,
                codeListOid: item.codeListOid,
            };
        });
    });
    return currentData;
};

const LoadFromXptStep3 = (props) => {
    const [newData, setNewData] = useState(false);
    const [newDatasets, setNewDatasets] = useState([]);
    const [newCodedValues, setNewCodedValues] = useState([]);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const mdv = useSelector(state => state.present.odm.study.metaDataVersion);
    let classes = getStyles();

    // Count number of updates
    let updateCount = {
        length: 0,
        label: 0,
        newVars: 0,
        newDatasets: 0,
    };

    const updateCountLabels = {
        length: 'Variables with length updated',
        label: 'Variables with label updated',
        newVars: 'New variables',
        newDatasets: 'New datasets',
    };

    Object.keys(newData).forEach(dsName => {
        let ds = newData[dsName];
        Object.values(ds).forEach(item => {
            if (item.newVar === true) {
                updateCount.newVars += 1;
            } else {
                if (item.length) {
                    updateCount.length += 1;
                }
                if (item.label) {
                    updateCount.label += 1;
                }
            }
        });
        if (newDatasets.map(newDs => newDs.name).includes(dsName)) {
            updateCount.newDatasets += 1;
        }
    });

    // Dataset parsing progress bar
    const [showLoadBar, setShowLoadBar] = useState(false);
    const [processedRecords, setProcessedRecords] = useState(0);
    const [targetDatasets, setTargetDatasets] = useState([]);
    const [remainingDatasets, setRemainingDatasets] = useState([]);
    let progressValue = 0;
    if (targetDatasets.length > 0) {
        progressValue = (targetDatasets.length - remainingDatasets.length) / targetDatasets.length * 100;
    }
    let processLine = `Processed ${targetDatasets.length - remainingDatasets.length}/${targetDatasets.length} datasets (${processedRecords} records)`;
    let processingLine = '';
    if (remainingDatasets.length > 0) {
        processingLine = `Processing ${remainingDatasets.join(', ')}`;
    }
    useEffect(() => {
        const handleParsedDataset = (event, dsName, numRecords) => {
            let newRemainingDatasets = remainingDatasets.slice();
            newRemainingDatasets.splice(remainingDatasets.indexOf(dsName), 1);
            setRemainingDatasets(newRemainingDatasets);
            setProcessedRecords(numRecords);
        };

        ipcRenderer.on('derivedXptMetadataFinishedDataset', handleParsedDataset);
        return function cleanup () {
            ipcRenderer.removeListener('derivedXptMetadataFinishedDataset', handleParsedDataset);
        };
    }, [remainingDatasets]);

    const handleFinish = () => {
        props.onFinish({ newData, newDatasets, newCodedValues, updateCount });
    };

    useEffect(() => {
        const options = props.options;
        const handleDerivedXptMetadata = (updatedData) => (event, deriveXptMetadata) => {
            setAllDataLoaded(true);
            setRemainingDatasets([]);
            let newCodedValues = [];
            // Merge attributes derived from XPT metadata and attributes derived from XPT data
            Object.keys(updatedData).forEach(dsName => {
                if (options.deriveNumericType &&
                    deriveXptMetadata.numAttrs[dsName] !== undefined &&
                    Object.keys(deriveXptMetadata.numAttrs[dsName]).length > 0
                ) {
                    let attrs = deriveXptMetadata.numAttrs[dsName];
                    Object.keys(updatedData[dsName]).forEach(itemName => {
                        if (Object.keys(attrs).includes(itemName)) {
                            let updatedItem = updatedData[dsName][itemName];
                            let derivedItem = attrs[itemName];
                            if (derivedItem.fractionDigits > 0) {
                                updatedItem.dataType = 'float';
                                updatedItem.fractionDigits = derivedItem.fractionDigits;
                                updatedItem.length = derivedItem.length;
                            } else {
                                updatedItem.length = derivedItem.length;
                            }
                        }
                    });
                }
                if (options.addCodedValues &&
                    deriveXptMetadata.uniqueValues[dsName] !== undefined &&
                    Object.keys(deriveXptMetadata.uniqueValues[dsName]).length > 0
                ) {
                    // Get current metadata
                    let currentData = getCurrentData(mdv, [dsName]);
                    let derivedValues = deriveXptMetadata.uniqueValues[dsName];
                    Object.keys(derivedValues).forEach(itemName => {
                        // Skip those which have no values
                        if (derivedValues[itemName].length === 0) {
                            return;
                        }

                        // Get codelist of the variable
                        let codeListOid;
                        if (currentData[dsName] !== undefined && currentData[dsName][itemName] !== undefined) {
                            codeListOid = currentData[dsName][itemName].codeListOid;
                        }
                        // Get existing codelist values
                        let codeList;
                        if (Object.keys(mdv.codeLists).includes(codeListOid)) {
                            codeList = mdv.codeLists[codeListOid];
                        } else {
                            // Codelist not in the metadata
                            return;
                        }
                        // Drop values which are already in the codelist
                        let currentValues = getCodedValuesAsArray(codeList);
                        derivedValues[itemName]
                            .filter(value => !currentValues.includes(value))
                            .forEach(value => {
                                newCodedValues.push({ codeList: codeList.name, value });
                            })
                        ;
                    });
                }
            });
            setNewData(updatedData);
            if (options.addCodedValues === true) {
                setNewCodedValues(newCodedValues);
            }
        };

        let updatedData = {};
        let xptNewDatasets = [];
        const xptDatasetNames = Object.keys(props.metadata);
        // Get current metadata
        let currentData = getCurrentData(mdv, xptDatasetNames);
        // Compare/Update current metadata with XPT metadata
        xptDatasetNames.forEach(dsName => {
            const xptDs = props.metadata[dsName];
            const xptVarNames = xptDs.varMetadata.map(xptVar => xptVar.name);
            let xptVarObj = {};
            xptDs.varMetadata.forEach(xptVar => { xptVarObj[xptVar.name] = xptVar; });
            if (Object.keys(currentData).includes(dsName)) {
                const currentDs = currentData[dsName];
                const currentVarNames = Object.keys(currentDs);
                updatedData[dsName] = {};
                xptVarNames.forEach(itemName => {
                    const xptVar = xptVarObj[itemName];
                    if (currentVarNames.includes(itemName)) {
                        const currentVar = currentDs[itemName];
                        let updatedVar = {
                            dataset: dsName,
                            variable: itemName,
                        };
                        // Update length
                        if (currentVar.dataType === 'text') {
                            if (options.updateActualLengthOnly === true && currentVar.lengthAsData === true) {
                                updatedVar.length = xptVar.length;
                            } else if (options.updateActualLengthOnly !== true && currentVar.length !== xptVar.length) {
                                updatedVar.length = xptVar.length;
                            }
                        }
                        // Update label
                        if (options.updateLabel === true && currentVar.label !== xptVar.label) {
                            updatedVar.label = xptVar.label;
                        }
                        // Update display Format
                        if (options.updateDisplayFormat === true && currentVar.displayFormat !== xptVar.format) {
                            updatedVar.displayFormat = xptVar.format;
                        }
                        updatedData[dsName][itemName] = updatedVar;
                    } else if (options.addNewVariables) {
                        const dataType = getItemType(xptVar);
                        updatedData[dsName][itemName] = {
                            dataset: dsName,
                            variable: itemName,
                            length: dataType === 'datetime' ? undefined : xptVar.lenght,
                            label: xptVar.label,
                            dataType,
                            displayFormat: xptVar.format,
                            newVar: true,
                        };
                    }
                });
            } else {
                // A new dataset
                xptNewDatasets.push({ name: dsName, label: xptDs.dsMetadata.label });
                updatedData[dsName] = {};
                xptVarNames.forEach(itemName => {
                    const xptVar = xptVarObj[itemName];
                    const dataType = getItemType(xptVar);
                    updatedData[dsName][itemName] = {
                        dataset: dsName,
                        variable: itemName,
                        length: dataType === 'datetime' ? undefined : xptVar.lenght,
                        label: xptVar.label,
                        dataType,
                        displayFormat: xptVar.format,
                        newVar: true,
                    };
                });
            }
        });
        setNewDatasets(xptNewDatasets);
        if (options.deriveNumericType || options.addCodedValues) {
            // Get variables with a codelists
            let codeListVariables = {};
            if (options.addCodedValues === true) {
                Object.keys(currentData)
                    .filter(dsName => xptDatasetNames.includes(dsName))
                    .forEach(dsName => {
                        const xptDs = props.metadata[dsName];
                        const xptVarNames = xptDs.varMetadata.map(xptVar => xptVar.name);
                        codeListVariables[dsName] = [];
                        Object.keys(currentData[dsName])
                            .filter(itemName => xptVarNames.includes(itemName))
                            .forEach(itemName => {
                                if (currentData[dsName][itemName].codeListOid !== undefined) {
                                    codeListVariables[dsName].push(itemName);
                                }
                            });
                    });
            }
            // Get numeric variables
            let numericVariables = {};
            if (options.deriveNumericType === true) {
                Object.keys(updatedData)
                    .forEach(dsName => {
                        numericVariables[dsName] = [];
                        // Some of numeric variables will be coming from XPT and other from the current specs
                        Object.keys(updatedData[dsName]).forEach(itemName => {
                            if (['integer', 'float'].includes(updatedData[dsName][itemName].dataType)) {
                                numericVariables[dsName].push(itemName);
                            } else if (currentData[dsName] !== undefined &&
                                currentData[dsName][itemName] !== undefined &&
                                ['integer', 'float'].includes(currentData[dsName][itemName].dataType)
                            ) {
                                numericVariables[dsName].push(itemName);
                            }
                        });
                    });
            }
            // Get path to each dataset;
            // Get all datasets which are going to be analysed
            let filePaths = {};
            let datasetsToAnalyse = Object.keys(codeListVariables);
            Object.keys(numericVariables).forEach(dsName => {
                if (!datasetsToAnalyse.includes(dsName)) {
                    datasetsToAnalyse.push(dsName);
                }
            });
            datasetsToAnalyse.forEach(dsName => {
                filePaths[dsName] = props.metadata[dsName].filePath;
            });

            if (datasetsToAnalyse.length > 0) {
                setTargetDatasets(datasetsToAnalyse);
                setRemainingDatasets(datasetsToAnalyse);
                setShowLoadBar(true);
                ipcRenderer.on('derivedXptMetadata', handleDerivedXptMetadata(updatedData));
                ipcRenderer.send('deriveXptMetadata', {
                    options: props.options,
                    numericVariables,
                    codeListVariables,
                    filePaths,
                });
                return function cleanup () {
                    ipcRenderer.removeAllListeners('derivedXptMetadata');
                };
            } else {
                setAllDataLoaded(true);
                setNewData(updatedData);
            }
        } else {
            setAllDataLoaded(true);
            setNewData(updatedData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Grid container direction='column' spacing={1}>
            <Grid item className={classes.table}>
                <List className={classes.root}>
                    {Object.keys(updateCount).map(attr => {
                        return (
                            <React.Fragment key={attr}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={updateCountLabels[attr]}
                                        secondary={updateCount[attr]}
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        );
                    })}
                </List>
            </Grid>
            <Grid item>
                {showLoadBar === true && [
                    <Typography key='processLine' variant="body1" align="left" color='textSecondary'>
                        {processLine}
                    </Typography>,
                    <Typography key = 'processingLine' variant="caption" align="left" color='textSecondary'>
                        {processingLine}
                    </Typography>,
                    <UpdatedLinearProgress key='progressBar' variant='determinate' value={progressValue} className={classes.progressBar}/>
                ]
                }
            </Grid>
            <Grid item>
                <Grid container justify='flex-end'>
                    <Grid item>
                        <Button
                            color="primary"
                            onClick={props.onCancel}
                            className={classes.button}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={props.onBack}
                            className={classes.button}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!allDataLoaded}
                            onClick={handleFinish}
                            className={classes.button}
                        >
                            Finish
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

LoadFromXptStep3.propTypes = {
    options: PropTypes.object.isRequired,
    metadata: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
    onFinish: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default LoadFromXptStep3;
