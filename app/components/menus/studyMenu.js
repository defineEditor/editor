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
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import { FaFileExport, FaFileImport } from 'react-icons/fa';
import Divider from '@material-ui/core/Divider';
import {
    openModal,
    studyImport,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        openModal: updateObj => dispatch(openModal(updateObj)),
        studyImport: updateObj => dispatch(studyImport(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        defines: state.present.defines.byId,
    };
};

class ConnectedStudyMenu extends React.Component {
    delete = () => {
        this.props.openModal({
            type: 'DELETE_STUDY',
            props: {
                studyId: this.props.study.id,
                defineIds: this.props.study.defineIds
            }
        });
        this.props.onClose();
    };

    export = () => {
        let exportObject = { study: this.props.study, defines: {} };
        // Get the list of all defines
        this.props.study.defineIds.forEach(defineId => {
            exportObject.defines[defineId] = this.props.defines[defineId];
        });
        ipcRenderer.send('exportStudy', exportObject);
        this.props.onClose();
    }

    import = () => {
        ipcRenderer.once('importedStudyData', this.importData);
        // Send the list of existing DefineIds and the id of the study
        ipcRenderer.send('importStudy', { studyId: this.props.study.id, defineIds: Object.keys(this.props.defines) });
        this.props.onClose();
    }

    importData = (event, data) => {
        // Update study, unite existing and imported OIDs
        let newStudy = { ...this.props.study, ...data.study, defineIds: this.props.study.defineIds.concat(data.study.defineIds) };
        this.props.studyImport({ study: newStudy, defines: data.defines });
    }

    render () {
        return (
            <React.Fragment>
                <Menu
                    id="menu"
                    anchorEl={this.props.anchorEl}
                    open={Boolean(this.props.anchorEl)}
                    onClose={this.props.onClose}
                    PaperProps={{
                        style: {
                            width: 145,
                        },
                    }}
                >
                    <MenuItem key='Export' onClick={this.export}>
                        <ListItemIcon style={{ marginLeft: '4px' }}>
                            <FaFileExport />
                        </ListItemIcon>
                        <ListItemText inset primary="Export" />
                    </MenuItem>
                    <MenuItem key='Import' onClick={this.import}>
                        <ListItemIcon>
                            <FaFileImport />
                        </ListItemIcon>
                        <ListItemText inset primary="Import" />
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Delete' onClick={this.delete}>
                        <ListItemIcon>
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText inset primary="Delete" />
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedStudyMenu.propTypes = {
    defines: PropTypes.object.isRequired,
    anchorEl: PropTypes.object.isRequired,
    openModal: PropTypes.func.isRequired,
    study: PropTypes.object.isRequired,
};

const StudyMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedStudyMenu);
export default StudyMenu;
