import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import Button from '@material-ui/core/Button';
import withWidth from '@material-ui/core/withWidth';
import NavigationBar from 'core/navigationBar.js';
import { addStudy } from 'actions/index.js';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: theme.palette.grey[50],
        minHeight: 'calc(100vh -  ' + (theme.spacing.unit * 7).toString() + 'px)',
        marginTop: theme.spacing.unit * 7
    },
    gridList: {
        width: '100%'
    },
    gridTile: {
        width: 100
    }
});

const mapStateToProps = state => {
    return {
        controlledTerminologyLocation: state.settings.general.controlledTerminologyLocation,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addStudy: updateObj => dispatch(addStudy(updateObj))
    };
};

class ConnectedControlledTerminology extends React.Component {

    componentDidMount() {
        ipcRenderer.on('controlledTerminologyFolderData', this.loadControlledTerminology);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('controlledTerminologyFolderData', this.loadControlledTerminology);
    }

    loadControlledTerminology = (event, data) => {
        console.log(data);
    }

    scanControlledTerminologyFolder = () => {
        ipcRenderer.send('scanControlledTerminologyFolder', this.props.controlledTerminologyLocation);
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <NavigationBar>
                    <Button size="small" variant="raised" onClick={this.scanControlledTerminologyFolder}>
                        Scan CT Folder
                    </Button>
                </NavigationBar>
                <div className={classes.root}>
                </div>
            </React.Fragment>
        );
    }
}

ConnectedControlledTerminology.propTypes = {
    classes: PropTypes.object.isRequired,
    studies: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    width: PropTypes.string.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    addStudy: PropTypes.func.isRequired
};

const ControlledTerminology = connect(mapStateToProps, mapDispatchToProps)(ConnectedControlledTerminology);
export default withWidth()(withStyles(styles)(ControlledTerminology));
