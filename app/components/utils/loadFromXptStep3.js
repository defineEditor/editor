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

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const getStyles = makeStyles(theme => ({
    button: {
        marginRight: theme.spacing(1),
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

const LoadFromXptStep3 = (props) => {
    const [data, setData] = useState(false);
    const [newDatasets, setNewDatasets] = useState([]);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [xptData, setXptData] = useState({});
    const mdv = useSelector(state => state.present.odm.study.metaDataVersion);
    let classes = getStyles();

    const dataRef = useRef(data);
    useEffect(() => { dataRef.current = data; }, [data]);

    // Count number of updates
    let updateCount = {
        length: 0,
        label: 0,
        newVars: 0,
        newDatasets: 0,
    };

    const updateCountLabels = {
        length: 'Variable with length updated',
        label: 'Variables with label updated',
        newVars: 'New variables',
        newDatasets: 'New datasets',
    };

    Object.keys(data).forEach(dsName => {
        let ds = data[dsName];
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

    const handleFinish = () => {
        props.onFinish(data, newDatasets, updateCount);
    };

    useEffect(() => {
        const options = props.options;
        let updatedData = {};
        let xptNewDatasets = [];
        // Get current metadata
        let currentData = {};
        const xptDatasetNames = Object.keys(props.metadata);
        mdv.order.itemGroupOrder.forEach(igOid => {
            let itemGroup = mdv.itemGroups[igOid];
            let dsName = itemGroup.name;
            if (!xptDatasetNames.includes(itemGroup.name)) {
                // If not in the list of XPT files, there is nothing to update
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
                };
            });
        });
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
                        if (!['float', 'integer'].includes(currentVar.dataType)) {
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
                        updatedData[dsName][itemName] = updatedVar;
                    } else if (options.addNewVariables) {
                        updatedData[dsName][itemName] = {
                            dataset: dsName,
                            variable: itemName,
                            length: xptVar.length,
                            label: xptVar.label,
                            dataType: getItemType(xptVar),
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
                    updatedData[dsName][itemName] = {
                        dataset: dsName,
                        variable: itemName,
                        length: xptVar.length,
                        label: xptVar.label,
                        dataType: getItemType(xptVar),
                        displayFormat: xptVar.format,
                        newVar: true,
                    };
                });
            }
        });
        setData(updatedData);
        setNewDatasets(xptNewDatasets);
        if (options.deriveNumericType || options.addCodedValues) {
            ipcRenderer.on('derivedXptMetadata', (event, data) => { setXptData({ ...xptData, ...data }); });
            ipcRenderer.on('xptMetadataParsed', (event, success) => { setAllDataLoaded(success); });
            ipcRenderer.send('deriveXptMetadata', props.options);
            return function cleanup () {
                ipcRenderer.removeAllListeners('deriveXptMetadata');
                ipcRenderer.removeAllListeners('xptMetadataParsed');
            };
        } else {
            setAllDataLoaded(true);
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
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        );
                    })}
                </List>
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
