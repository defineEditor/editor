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
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { AnalysisDataset } from 'core/armStructure.js';
import getSelectionList from 'utils/getSelectionList.js';
import ArmAnalysisVariableEditor from 'editors/armAnalysisVariableEditor.js';
import WhereClauseEditor from 'editors/whereClauseEditor.js';

const styles = theme => ({
    datasetSelect: {
        width: '150px',
    },
});

class ArmDatasetEditor extends React.Component {
    handleChange = (name, oid) => updateObj => {
        if (name === 'changeDataset') {
            if (this.props.datasetsNotUsed.includes(updateObj.target.value)) {
                let newAnalysisDataset = { ...new AnalysisDataset({ itemGroupOid: updateObj.target.value }) };
                this.props.onChange({ analysisDataset: newAnalysisDataset });
            }
        } else if (name === 'changeVariables') {
            let newAnalysisDataset = { ...new AnalysisDataset({ ...this.props.analysisDataset, analysisVariableOids: updateObj }) };
            this.props.onChange({ analysisDataset: newAnalysisDataset });
        } else if (name === 'changeWhereClause') {
            if (updateObj === undefined && this.props.analysisDataset.whereClauseOid !== undefined) {
                let newAnalysisDataset = { ...new AnalysisDataset({ ...this.props.analysisDataset, whereClauseOid: undefined }) };
                this.props.onChange({ analysisDataset: newAnalysisDataset, whereClause: updateObj });
            } else if (updateObj !== undefined && updateObj.oid !== this.props.analysisDataset.whereClauseOid) {
                let newAnalysisDataset = { ...new AnalysisDataset({ ...this.props.analysisDataset, whereClauseOid: updateObj.oid }) };
                this.props.onChange({ analysisDataset: newAnalysisDataset, whereClause: updateObj });
            } else {
                this.props.onChange({ whereClause: updateObj });
            }
        }
    };

    render () {
        const { classes, datasets, analysisDataset, datasetsNotUsed } = this.props;
        let disabledDatasets = Object.keys(datasets).filter(oid => (!datasetsNotUsed.includes(oid) && oid !== analysisDataset.itemGroupOid)).map(oid => (oid));

        if (analysisDataset === undefined || analysisDataset.itemGroupOid === undefined) {
            return null;
        }

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <TextField
                        label='Dataset'
                        value={analysisDataset.itemGroupOid}
                        select
                        onChange={this.handleChange('changeDataset')}
                        className={classes.datasetSelect}
                    >
                        {getSelectionList(datasets, false, disabledDatasets)}
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    <WhereClauseEditor
                        itemGroup={this.props.itemGroups[analysisDataset.itemGroupOid]}
                        label='Selection Criteria'
                        whereClause={this.props.whereClause}
                        onChange={this.handleChange('changeWhereClause')}
                        fixedDataset={true}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ArmAnalysisVariableEditor
                        itemGroup={this.props.itemGroups[analysisDataset.itemGroupOid]}
                        itemDefs={this.props.itemDefs}
                        analysisVariables={analysisDataset.analysisVariableOids}
                        onChange={this.handleChange('changeVariables')}
                    />
                </Grid>
            </Grid>
        );
    }
}

ArmDatasetEditor.propTypes = {
    analysisDataset: PropTypes.object.isRequired,
    whereClause: PropTypes.object,
    itemGroups: PropTypes.object.isRequired,
    itemDefs: PropTypes.object.isRequired,
    datasets: PropTypes.object.isRequired,
    datasetsNotUsed: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ArmDatasetEditor);
