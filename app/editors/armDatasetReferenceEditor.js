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

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';
import LowPriority from '@material-ui/icons/LowPriority';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/AddCircle';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';
import { AnalysisDataset } from 'core/armStructure.js';
import ArmAnalysisDatasetEditor from 'editors/armAnalysisDatasetEditor.js';

const styles = theme => ({
    button: {
        margin: 'none',
    },
    iconButton: {
        marginBottom: '8px',
    },
});

class ArmDatasetReferenceEditor extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            showDatasetOrderEditor: false
        };
    }

    handleChange = (name, oid) => updateObj => {
        if (name === 'addDataset') {
            let datasets = {};
            Object.values(this.props.itemGroups).forEach(itemGroup => { datasets[itemGroup.oid] = itemGroup.name; });
            let datasetsNotUsed = Object.keys(datasets);
            Object.keys(datasets).forEach(oid => {
                if (Object.keys(this.props.analysisDatasets).includes(oid)) {
                    delete datasetsNotUsed.splice(datasetsNotUsed.indexOf(oid), 1);
                }
            });
            let newAnalysisDataset = { ...new AnalysisDataset({ itemGroupOid: datasetsNotUsed[0] }) };
            let newAnalysisDatasets = { ...this.props.analysisDatasets, [newAnalysisDataset.itemGroupOid]: newAnalysisDataset };
            let newAnalysisDatasetOrder = this.props.analysisDatasetOrder.concat([newAnalysisDataset.itemGroupOid]);
            this.props.onChange({
                analysisDatasets: newAnalysisDatasets,
                analysisDatasetOrder: newAnalysisDatasetOrder,
            });
        } else if (name === 'deleteDataset') {
            let newAnalysisDatasets = { ...this.props.analysisDatasets };
            delete newAnalysisDatasets[oid];
            let newAnalysisDatasetOrder = this.props.analysisDatasetOrder.slice();
            newAnalysisDatasetOrder.splice(newAnalysisDatasetOrder.indexOf(oid), 1);
            let newWhereClauses = { ...this.props.whereClauses };
            if (newWhereClauses.hasOwnProperty(oid)) {
                delete newWhereClauses[oid];
            }
            this.props.onChange({
                analysisDatasets: newAnalysisDatasets,
                analysisDatasetOrder: newAnalysisDatasetOrder,
                whereClauses: newWhereClauses,
            });
        } else if (name === 'datasetOrder') {
            this.props.onChange({ analysisDatasetOrder: updateObj.map(item => (item.oid)) });
        } else if (name === 'updateDataset') {
            if (updateObj.hasOwnProperty('analysisDataset')) {
                let newAnalysisDatasets = { ...this.props.analysisDatasets, [updateObj.analysisDataset.itemGroupOid]: updateObj.analysisDataset };
                // If a new dataset was selected, remove the old dataset
                if (oid !== updateObj.analysisDataset.itemGroupOid) {
                    delete newAnalysisDatasets[oid];
                    let newAnalysisDatasetOrder = this.props.analysisDatasetOrder.slice();
                    newAnalysisDatasetOrder.splice(newAnalysisDatasetOrder.indexOf(oid), 1, updateObj.analysisDataset.itemGroupOid);
                    let newWhereClauses = { ...this.props.whereClauses };
                    if (newWhereClauses.hasOwnProperty(oid)) {
                        delete newWhereClauses[oid];
                    }
                    if (updateObj.hasOwnProperty('whereClause')) {
                        newWhereClauses[updateObj.analysisDataset.itemGroupOid] = updateObj.whereClause;
                    }
                    this.props.onChange({
                        analysisDatasets: newAnalysisDatasets,
                        analysisDatasetOrder: newAnalysisDatasetOrder,
                        whereClauses: newWhereClauses,
                    });
                } else {
                    if (updateObj.hasOwnProperty('whereClause')) {
                        let newWhereClauses = { ...this.props.whereClauses };
                        newWhereClauses[updateObj.analysisDataset.itemGroupOid] = updateObj.whereClause;
                        this.props.onChange({ analysisDatasets: newAnalysisDatasets, whereClauses: newWhereClauses });
                    } else {
                        this.props.onChange({ analysisDatasets: newAnalysisDatasets });
                    }
                }
            } else if (updateObj.hasOwnProperty('whereClause')) {
                let newWhereClauses = { ...this.props.whereClauses };
                newWhereClauses[oid] = updateObj.whereClause;
                this.props.onChange({ whereClauses: newWhereClauses });
            }
        }
    };

    render () {
        const { classes } = this.props;

        let datasets = {};
        Object.values(this.props.itemGroups).forEach(itemGroup => { datasets[itemGroup.oid] = itemGroup.name; });
        let datasetsNotUsed = Object.keys(datasets);
        Object.keys(datasets).forEach(oid => {
            if (Object.keys(this.props.analysisDatasets).includes(oid)) {
                delete datasetsNotUsed.splice(datasetsNotUsed.indexOf(oid), 1);
            }
        });

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subheading">
                        Datasets
                        <Tooltip title='Add Reference Dataset' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={this.handleChange('addDataset')}
                                    className={classes.iconButton}
                                    disabled={datasetsNotUsed.length === 0}
                                    color='primary'
                                >
                                    <AddIcon/>
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Order Datasets' placement='bottom' enterDelay={1000}>
                            <IconButton
                                color='primary'
                                onClick={() => { this.setState({ showDatasetOrderEditor: true }); }}
                                className={classes.iconButton}
                            >
                                <LowPriority/>
                            </IconButton>
                        </Tooltip>
                    </Typography>
                </Grid>
                <Grid item xs={12} >
                    { this.props.analysisDatasetOrder.map((oid, index) => (
                        <Grid container justify='flex-start' alignItems='flex-start' spacing={8} key={index} wrap='nowrap'>
                            <Grid item>
                                <Tooltip title="Remove Dataset" placement="bottom-end" enterDelay={1000}>
                                    <IconButton
                                        color='secondary'
                                        onClick={this.handleChange('deleteDataset', oid)}
                                        className={classes.button}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <ArmAnalysisDatasetEditor
                                    analysisDataset={this.props.analysisDatasets[oid]}
                                    datasets={datasets}
                                    datasetsNotUsed={datasetsNotUsed}
                                    whereClause={this.props.whereClauses[oid]}
                                    itemGroups={this.props.itemGroups}
                                    itemDefs={this.props.itemDefs}
                                    onChange={this.handleChange('updateDataset', oid)}
                                />
                            </Grid>
                        </Grid>

                    ))
                    }
                </Grid>
                <Grid item xs={12} >
                    { this.state.showDatasetOrderEditor && (
                        <GeneralOrderEditor
                            items={Object.keys(this.props.analysisDatasets).map(oid => ({ oid, name: datasets[oid] }))}
                            onSave={this.handleChange('datasetOrder')}
                            noButton={true}
                            title='Dataset Order'
                            width='500px'
                            onCancel={() => this.setState({ showDatasetOrderEditor: false })}
                        />
                    )}
                </Grid>
            </Grid>
        );
    }
}

ArmDatasetReferenceEditor.propTypes = {
    analysisDatasetOrder: PropTypes.array.isRequired,
    analysisDatasets: PropTypes.object.isRequired,
    itemGroups: PropTypes.object.isRequired,
    itemDefs: PropTypes.object.isRequired,
    whereClauses: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ArmDatasetReferenceEditor);
