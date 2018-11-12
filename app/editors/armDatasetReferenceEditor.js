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
import ArmDatasetEditor from 'editors/armDatasetEditor.js';

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
    handleChange = (name, oid) => event => {
        if (name === 'addDataset') {
            let datasets = {};
            Object.values(this.props.itemGroups).forEach( itemGroup => { datasets[itemGroup.oid] = itemGroup.name; } );
            let datasetsNotUsed = Object.keys(datasets);
            Object.keys(datasets).forEach( oid => {
                if (Object.keys(this.props.analysisDatasets).includes(oid)) {
                    delete datasetsNotUsed.splice(datasetsNotUsed.indexOf(oid), 1);
                }
            });
            let newAnalysisDataset = { ...new AnalysisDataset({ itemGroupOid: datasetsNotUsed[0] }) };
            let newAnalysisDatasets = { ...this.props.analysisDatasets, [newAnalysisDataset.itemGroupOid]: newAnalysisDataset };
            let newAnalysisDatasetOrder = this.props.analysisDatasetOrder.concat([newAnalysisDataset.itemGroupOid]);
            this.props.onChange({ analysisDatasets: newAnalysisDatasets, analysisDatasetOrder: newAnalysisDatasetOrder });
        } else if (name === 'deleteDataset') {
            let newAnalysisDatasets = { ...this.props.analysisDatasets };
            delete newAnalysisDatasets[oid];
            let newAnalysisDatasetOrder = this.props.analysisDatasetOrder.slice();
            newAnalysisDatasetOrder.splice(newAnalysisDatasetOrder.indexOf(oid), 1);
            this.props.onChange({ analysisDatasets: newAnalysisDatasets, analysisDatasetOrder: newAnalysisDatasetOrder });
        } else if (name === 'datasetOrder') {
            this.props.onChange({ analysisDatasetOrder: event.map( item => (item.oid)) });
        } else if (name === 'updateDataset') {
            let newAnalysisDatasets = { ...this.props.analysisDatasets, [event.analysisDataset.itemGroupOid]: event.analysisDataset };
            // If a new dataset was selected, remove the old dataset
            if (oid !== event.analysisDataset.itemGroupOid) {
                delete newAnalysisDatasets[oid];
                let newAnalysisDatasetOrder = this.props.analysisDatasetOrder.slice();
                newAnalysisDatasetOrder.splice(newAnalysisDatasetOrder.indexOf(oid), 1, event.analysisDataset.itemGroupOid);
                this.props.onChange({ analysisDatasets: newAnalysisDatasets, analysisDatasetOrder: newAnalysisDatasetOrder });
            } else {
                this.props.onChange({ analysisDatasets: newAnalysisDatasets });
            }
        }
    };


    render () {

        const { classes } = this.props;

        let datasets = {};
        Object.values(this.props.itemGroups).forEach( itemGroup => { datasets[itemGroup.oid] = itemGroup.name; } );
        let datasetsNotUsed = Object.keys(datasets);
        Object.keys(datasets).forEach( oid => {
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
                        <Tooltip title='Add Reference Dataset' placement='bottom' enterDelay={1000}>
                            <IconButton
                                color='default'
                                onClick={() => { this.setState({ showDatasetOrderEditor: true });}}
                                className={classes.iconButton}
                            >
                                <LowPriority/>
                            </IconButton>
                        </Tooltip>
                    </Typography>
                </Grid>
                <Grid item xs={12} >
                    { this.props.analysisDatasetOrder.map( (oid, index) => (
                        <Grid container justify='flex-start' alignItems='flex-end' spacing={8} key={index}>
                            <Grid item>
                                <Tooltip title="Remove Dataset" placement="bottom-end" enterDelay={1000}>
                                    <IconButton
                                        color='secondary'
                                        onClick={this.handleChange('deleteDataset',oid)}
                                        className={classes.button}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <ArmDatasetEditor
                                    analysisDataset={this.props.analysisDatasets[oid]}
                                    datasets={datasets}
                                    datasetsNotUsed={datasetsNotUsed}
                                    itemGroups={this.props.itemGroups}
                                    onChange={this.handleChange('updateDataset',oid)}
                                />
                            </Grid>
                        </Grid>

                    ))
                    }
                </Grid>
                <Grid item xs={12} >
                    { this.state.showDatasetOrderEditor && (
                        <GeneralOrderEditor
                            items={Object.keys(this.props.analysisDatasets).map( oid => ({oid, name: datasets[oid]}))}
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
    analysisDatasetOrder : PropTypes.array.isRequired,
    analysisDatasets     : PropTypes.object.isRequired,
    itemGroups           : PropTypes.object.isRequired,
    onChange             : PropTypes.func.isRequired,
};

export default withStyles(styles)(ArmDatasetReferenceEditor);
