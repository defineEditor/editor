import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { AnalysisDataset } from 'core/armStructure.js';
import getSelectionList from 'utils/getSelectionList.js';

const styles = theme => ({
    datasetSelect: {
        width: '150px',
    },
});

class ArmDatasetEditor extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            showDatasetOrderEditor: false
        };
    }
    handleChange = (name, oid) => event => {
        if (name === 'changeDataset') {
            if (this.props.datasetsNotUsed.includes(event.target.value)) {
                let newAnalysisDataset = { ...new AnalysisDataset({ itemGroupOid: event.target.value }) };
                this.props.onChange({ analysisDataset: newAnalysisDataset });
            }
        } else if (name === 'deleteDataset') {
            //
        }
    };


    render () {
        const { classes, datasets, analysisDataset } = this.props;

        return (
            <Grid container>
                <Grid item xs={12}>
                    <TextField
                        label='Dataset'
                        value={analysisDataset.itemGroupOid}
                        select
                        onChange={this.handleChange('changeDataset')}
                        className={classes.datasetSelect}
                    >
                        {getSelectionList(datasets)}
                    </TextField>
                </Grid>
            </Grid>
        );
    }
}

ArmDatasetEditor.propTypes = {
    analysisDataset : PropTypes.object.isRequired,
    itemGroups      : PropTypes.object.isRequired,
    datasets        : PropTypes.object.isRequired,
    datasetsNotUsed : PropTypes.array.isRequired,
    onChange        : PropTypes.func.isRequired,
};

export default withStyles(styles)(ArmDatasetEditor);
