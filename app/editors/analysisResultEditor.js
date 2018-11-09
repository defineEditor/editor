import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import { getDescription } from 'utils/defineStructureUtils.js';
import getSelectionList from 'utils/getSelectionList.js';
import {
    updateAnalysisResult,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        outline   : 'none',
    },
    paramter: {
        minWidth: '200px',
    },
});

const mapDispatchToProps = dispatch => {
    return {
        updateAnalysisResult: updateObj => dispatch(updateAnalysisResult(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        mdv          : state.present.odm.study.metaDataVersion,
        stdConstants : state.present.stdConstants,
    };
};

class ConnectedAnalysisResultEditor extends React.Component {

    constructor (props) {

        super(props);

        let analysisResult = props.mdv.analysisResultDisplays.analysisResults[props.analysisResultOid];

        const {
            analysisReason,
            analysisPurpose,
            parameterOid,
            documentation,
            programmingCode,
            analysisDatasets,
            analysisDatasetOrder,
            analysisDatasetsCommentOid
        } = analysisResult;

        let listOfVariables = this.getListOfVariables(analysisDatasets);

        let descriptionText = getDescription(analysisResult);
        this.state = {
            descriptionText,
            analysisReason,
            analysisPurpose,
            parameterOid,
            documentation,
            programmingCode,
            analysisDatasets,
            analysisDatasetOrder,
            analysisDatasetsCommentOid,
            listOfVariables,
        };
    }

    getListOfVariables = (analysisDatasets) => {
        let result = [];
        const mdv = this.props.mdv;
        const itemGroups = mdv.itemGroups;
        Object.values(analysisDatasets).forEach( analysisDataset => {
            let itemGroupOid = analysisDataset.itemGroupOid;
            if (itemGroups.hasOwnProperty(itemGroupOid)) {
                let itemGroup = itemGroups[itemGroupOid];
                let datasetName = itemGroup.name;
                itemGroup.itemRefOrder.forEach( itemRefOid => {
                    let itemDef = mdv.itemDefs[itemGroup.itemRefs[itemRefOid].itemOid];
                    result.push({ [itemDef.oid]: datasetName + '.' + itemDef.name });
                });
            }
        });
        return result;
    }

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    }

    save = () => {
        this.props.onUpdateFinished();
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onUpdateFinished();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render () {
        const { classes } = this.props;
        return (
            <div className={classes.root} onKeyDown={this.onKeyDown} tabIndex='0'>
                <List>
                    <ListItem dense>
                        <TextField
                            label='Description'
                            value={this.state.descriptionText}
                            autoFocus
                            fullWidth
                            onChange={this.handleChange('descriptionText')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem dense>
                        <Grid container justify='space-between' spacing={8}>
                            <Grid item>
                                <TextField
                                    label='Analysis Reason'
                                    value={this.state.analysisReason}
                                    fullWidth
                                    select
                                    onChange={this.handleChange('analysisReason')}
                                >
                                    {getSelectionList(this.props.stdConstants.armAnalysisReason)}
                                </TextField>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label='Analysis Purpose'
                                    value={this.state.analysisPurpose}
                                    fullWidth
                                    select
                                    onChange={this.handleChange('analysisPurpose')}
                                >
                                    {getSelectionList(this.props.stdConstants.armAnalysisPurpose)}
                                </TextField>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label='Parameter'
                                    value={this.state.parameterOid}
                                    fullWidth
                                    select
                                    onChange={this.handleChange('parameterOid')}
                                    className={classes.paramter}
                                >
                                    {getSelectionList(this.state.listOfVariables)}
                                </TextField>
                            </Grid>
                        </Grid>
                    </ListItem>
                    <ListItem dense>
                    </ListItem>
                    <ListItem dense>
                    </ListItem>
                </List>
            </div>
        );
    }
}

ConnectedAnalysisResultEditor.propTypes = {
    analysisResult   : PropTypes.object.isRequired,
    classes          : PropTypes.object.isRequired,
    onUpdateFinished : PropTypes.func.isRequired,
};

const AnalysisResultEditor = connect(mapStateToProps, mapDispatchToProps)(ConnectedAnalysisResultEditor);
export default withStyles(styles)(AnalysisResultEditor);
