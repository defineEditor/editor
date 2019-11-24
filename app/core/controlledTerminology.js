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
import PropTypes from 'prop-types';
import { withStyles, lighten } from '@material-ui/core/styles';
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
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
    updateControlledTerminology,
    reloadControlledTerminology,
    openSnackbar,
} from 'actions/index.js';
import { ControlledTerminology } from 'core/mainStructure.js';

const styles = theme => ({
    root: {
        marginTop: theme.spacing(7),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    header: {
        marginBottom: theme.spacing(2),
    },
    scanning: {
        marginTop: theme.spacing(10),
    },
    progress: {
        marginTop: theme.spacing(10),
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
    },
    noCTMessage: {
        position: 'absolute',
        marginLeft: theme.spacing(2),
        top: '47%',
        transform: 'translate(0%, -47%)',
    },
});

const UpdatedLinearProgress = withStyles({
    root: {
        height: 40,
        backgroundColor: lighten('#3f51b5', 0.5),
        borderRadius: 30,
    },
    bar: {
        borderRadius: 30,
        backgroundColor: '#3f51b5',
    },
})(LinearProgress);

const mapStateToProps = state => {
    return {
        controlledTerminologyLocation: state.present.settings.general.controlledTerminologyLocation,
        controlledTerminology: state.present.controlledTerminology,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateControlledTerminology: updateObj => dispatch(updateControlledTerminology(updateObj)),
        reloadControlledTerminology: updateObj => dispatch(reloadControlledTerminology(updateObj)),
        openSnackbar: updateObj => dispatch(openSnackbar(updateObj)),
    };
};

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.primary.main,
        color: '#EEEEEE',
        fontSize: 16,
        fontWeight: 'bold',
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

class ConnectedControlledTerminology extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            scanning: false,
            totalCount: 0,
            count: 0,
        };
    }

    componentDidMount () {
        ipcRenderer.on('controlledTerminologyFolderData', this.loadControlledTerminology);
        ipcRenderer.on('scanCtFolderFinishedFile', this.updateCount);
        ipcRenderer.on('scanCtFolderStarted', this.initiateScanning);
        ipcRenderer.on('scanCtFolderError', this.showError);
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('controlledTerminologyFolderData', this.loadControlledTerminology);
        ipcRenderer.removeListener('scanCtFolderFinishedFile', this.updateCount);
        ipcRenderer.removeListener('scanCtFolderStarted', this.initiateScanning);
    }

    updateCount = () => {
        this.setState({ count: this.state.count + 1 });
    }

    initiateScanning = (event, value) => {
        this.setState({ scanning: true, totalCount: value });
    }

    showError = (event, msg) => {
        this.props.openSnackbar({
            type: 'error',
            message: msg,
        });
    }

    loadControlledTerminology = (event, data) => {
        let ctList = {};
        Object.keys(data).forEach(ctId => {
            let ct = data[ctId];
            ctList[ct.id] = { ...new ControlledTerminology({ ...ct }) };
        });
        this.props.reloadControlledTerminology({ ctList });
        // Reset scan UI values
        this.setState({ scanning: false, totalCount: 0, count: 0 });
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
            if (ctList[ct1].version > ctList[ct2].version) {
                return -1;
            } else if (ctList[ct1].version < ctList[ct2].version) {
                return 1;
            } else {
                return ctList[ct1].name > ctList[ct2].name ? 1 : -1;
            }
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

    render () {
        const { classes } = this.props;
        let ctNum = this.props.controlledTerminology.allIds.length;
        return (
            <React.Fragment>
                <NavigationBar>
                    <Button size="small" variant="contained" onClick={this.scanControlledTerminologyFolder}>
                        Scan CT Folder
                    </Button>
                </NavigationBar>
                <div className={classes.root}>
                    { this.state.scanning === false && ctNum === 0 && (
                        <Typography variant="h4" gutterBottom className={classes.noCTMessage} color='textSecondary'>
                            There is no Controlled Terminology available.
                            Download the NCI/CDISC CT in XML format, specify the folder in settings and press the &nbsp;
                            <Button size="small" variant="contained" onClick={this.scanControlledTerminologyFolder}>
                                Scan CT Folder
                            </Button> &nbsp; button
                        </Typography>
                    )}
                    { this.state.scanning === false && ctNum !== 0 && (
                        <React.Fragment>
                            <Typography variant="h5" className={classes.header}>
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
                    { this.state.scanning === true && (
                        <Box textAlign='center'>
                            <Typography variant="h4" color='textSecondary' className={classes.scanning}>
                                Scanning Controlled Terminology
                            </Typography>
                            <Typography variant="h6" color='textSecondary'>
                                Finished {this.state.count} of {this.state.totalCount} files
                            </Typography>
                            <UpdatedLinearProgress
                                variant="determinate"
                                value={this.state.totalCount > 0 ? this.state.count / this.state.totalCount * 100 : 0}
                                className={classes.progress}
                            />
                        </Box>
                    )}
                </div>
            </React.Fragment>
        );
    }
}

ConnectedControlledTerminology.propTypes = {
    classes: PropTypes.object.isRequired,
    updateControlledTerminology: PropTypes.func.isRequired,
    openSnackbar: PropTypes.func.isRequired,
    controlledTerminology: PropTypes.object.isRequired,
};

const ControlledTerminologyPage = connect(mapStateToProps, mapDispatchToProps)(ConnectedControlledTerminology);
export default withWidth()(withStyles(styles)(ControlledTerminologyPage));
