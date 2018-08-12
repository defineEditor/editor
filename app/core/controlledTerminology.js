import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import withWidth from '@material-ui/core/withWidth';
import NavigationBar from 'core/navigationBar.js';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { updateControlledTerminology, reloadControlledTerminology } from 'actions/index.js';
import { ControlledTerminology } from 'core/mainStructure.js';

const styles = theme => ({
    root: {
        marginTop: theme.spacing.unit * 7,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    header: {
        marginBottom: theme.spacing.unit * 2,
    },
    noCTMessage: {
        position: 'absolute',
        marginLeft: theme.spacing.unit * 2,
        top: '47%',
        transform: 'translate(0%, -47%)',
    },
});

const mapStateToProps = state => {
    return {
        controlledTerminologyLocation: state.settings.general.controlledTerminologyLocation,
        controlledTerminology: state.controlledTerminology,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateControlledTerminology: updateObj => dispatch(updateControlledTerminology(updateObj)),
        reloadControlledTerminology: updateObj => dispatch(reloadControlledTerminology(updateObj)),
    };
};

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor : theme.palette.primary.main,
        color           : '#EEEEEE',
        fontSize        : 16,
        fontWeight      : 'bold',
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

class ConnectedControlledTerminology extends React.Component {

    componentDidMount() {
        ipcRenderer.on('controlledTerminologyFolderData', this.loadControlledTerminology);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('controlledTerminologyFolderData', this.loadControlledTerminology);
    }

    loadControlledTerminology = (event, data) => {
        let ctList = {};
        Object.keys(data).forEach( ctId => {
            let ct = data[ctId];
            ctList[ct.id] = { ...new ControlledTerminology ({ ...ct }) };
        });
        this.props.reloadControlledTerminology({ ctList });
    }

    scanControlledTerminologyFolder = () => {
        ipcRenderer.send('scanControlledTerminologyFolder', this.props.controlledTerminologyLocation);
    }

    toggleDefault = (ctId) => () => {
        let currentCt = this.props.controlledTerminology.byId[ctId];
        let updatedCt = { ...currentCt, isDefault: !currentCt.isDefault };
        this.props.updateControlledTerminology({ ctList: { [ctId]: updatedCt } });
    }
    getControlledTerminologies = () => {
        let ctList = this.props.controlledTerminology.byId;
        let ctIds = this.props.controlledTerminology.allIds;

        const sortByVersion = (ct1, ct2) => {
            return ctList[ct1].version > ctList[ct2].version ? -1 : 1;
        };

        return ctIds.sort(sortByVersion).map(ctId => {
            return (
                <TableRow key={ctId}>
                    <CustomTableCell>
                        {ctList[ctId].name}
                    </CustomTableCell>
                    <CustomTableCell>
                        {ctList[ctId].version}
                    </CustomTableCell>
                    <CustomTableCell>
                        {ctList[ctId].codeListCount}
                    </CustomTableCell>
                    <CustomTableCell>
                        <Checkbox
                            checked={ctList[ctId].isDefault}
                            onChange={this.toggleDefault(ctId)}
                            color="primary"
                        />
                    </CustomTableCell>
                </TableRow>
            );
        });
    };

    render() {
        const { classes } = this.props;
        let ctNum = this.props.controlledTerminology.allIds.length;
        return (
            <React.Fragment>
                <NavigationBar>
                    <Button size="small" variant="raised" onClick={this.scanControlledTerminologyFolder}>
                        Scan CT Folder
                    </Button>
                </NavigationBar>
                <div className={classes.root}>
                    { ctNum === 0 ? (
                        <Typography variant="display1" gutterBottom className={classes.noCTMessage}>
                            There is no Controlled Terminology available. Download the NCI/CDISC CT in XML format, specify the folder in settings and press the &nbsp;
                            <Button size="small" variant="raised" onClick={this.scanControlledTerminologyFolder}>
                                Scan CT Folder
                            </Button> &nbsp; button
                        </Typography>
                    ) : (
                        <React.Fragment>
                            <Typography variant="headline" component="h3" className={classes.header}>
                                Controlled Terminology
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <CustomTableCell>Name</CustomTableCell>
                                        <CustomTableCell>Version</CustomTableCell>
                                        <CustomTableCell># Codelists</CustomTableCell>
                                        <CustomTableCell>Add by Default</CustomTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.getControlledTerminologies()}
                                </TableBody>
                            </Table>
                        </React.Fragment>
                    )}
                </div>
            </React.Fragment>
        );
    }
}

ConnectedControlledTerminology.propTypes = {
    classes: PropTypes.object.isRequired,
    updateControlledTerminology: PropTypes.func.isRequired,
    controlledTerminology: PropTypes.object.isRequired,
};

const ControlledTerminologyPage = connect(mapStateToProps, mapDispatchToProps)(ConnectedControlledTerminology);
export default withWidth()(withStyles(styles)(ControlledTerminologyPage));
