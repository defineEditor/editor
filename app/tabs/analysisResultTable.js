import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import grey from '@material-ui/core/colors/grey';
import { withStyles } from '@material-ui/core/styles';
import OpenDrawer from '@material-ui/icons/ArrowUpward';
import AnalysisResultOrderEditor from 'components/orderEditors/analysisResultOrderEditor.js';
import AnalysisResultTile from 'components/utils/analysisResultTile.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import {
    addAnalysisResult,
} from 'actions/index.js';

const styles = theme => ({
    buttonGroup: {
        marginLeft: theme.spacing.unit * 2,
    },
    button: {
        margin: theme.spacing.unit,
    },
    chip: {
        verticalAlign : 'top',
        marginLeft    : theme.spacing.unit,
    },
    drawerButton: {
        marginLeft : theme.spacing.unit * 2,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addAnalysisResult    : (updateObj) => dispatch(addAnalysisResult(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        resultDisplays  : state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplays,
        tabSettings     : state.present.ui.tabs.settings[state.present.ui.tabs.currentTab],
        reviewMode      : state.present.ui.main.reviewMode,
    };
};

class ConnectedAnalysisResultTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            resultDisplayOid : this.props.resultDisplayOid,
            setScrollY       : false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let stateUpdate = {};
        // Store previous groupOid in state so it can be compared with when props change
        if (nextProps.resultDisplayOid !== prevState.resultDisplayOid) {
            stateUpdate.resultDisplayOid = nextProps.resultDisplayOid;
            stateUpdate.setScrollY = true;
            return ({ ...stateUpdate });
        } else {
            return null;
        }
    }

    componentDidUpdate() {
        if (this.state.setScrollY) {
            // Restore previous tab scroll position for a specific dataset
            let tabSettings = this.props.tabSettings;
            if (tabSettings.scrollPosition[this.props.resultDisplayOid] !== undefined) {
                window.scrollTo(0, tabSettings.scrollPosition[this.props.resultDisplayOid]);
            } else {
                window.scrollTo(0, 0);
            }
            this.setState({ setScrollY: false });
        }
    }

    addAnalysisResult = (event) => {
        this.props.addAnalysisResult({ resultDisplayOid: this.props.resultDisplayOid });
    }

    render () {
        const { classes } = this.props;
        const resultDisplay = this.props.resultDisplays[this.props.resultDisplayOid];
        let resultDisplayTitle = resultDisplay.name + ' ' + getDescription(resultDisplay);

        return (
            <React.Fragment>
                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <Grid container alignItems='center' justify='flex-start' wrap='nowrap'>
                            <Grid>
                                <h3 style={{marginTop: '20px', marginBottom: '10px', color: grey[600]}}>
                                    {resultDisplayTitle}
                                </h3>
                            </Grid>
                            <Grid>
                                <Button
                                    color="default"
                                    variant='fab'
                                    mini
                                    onClick={this.props.openDrawer}
                                    className={this.props.classes.drawerButton}
                                >
                                    <OpenDrawer/>
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={16} alignItems='center'>
                            <Grid item>
                                <Button
                                    color='default'
                                    variant='raised'
                                    onClick={this.addAnalysisResult}
                                    className={classes.button}
                                >
                                    Add Analysis Result
                                </Button>
                            </Grid>
                            <Grid item>
                                <AnalysisResultOrderEditor resultDisplayOid={this.props.resultDisplayOid}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        {resultDisplay.analysisResultOrder.map( (analysisResultOid, index) => (
                            <AnalysisResultTile key={index} analysisResultOid={analysisResultOid} resultDisplayOid={this.props.resultDisplayOid}/>
                        ))}
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}

ConnectedAnalysisResultTable.propTypes = {
    resultDisplays    : PropTypes.object.isRequired,
    resultDisplayOid  : PropTypes.string.isRequired,
    reviewMode        : PropTypes.bool,
};

const AnalysisResultTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedAnalysisResultTable);
export default withStyles(styles)(AnalysisResultTable);
