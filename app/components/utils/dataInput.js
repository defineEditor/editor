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
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import csv from 'csvtojson';
import TableWithPagination from 'components/utils/tableWithPagination.js';
import getOidByName from 'utils/getOidByName.js';
import {
    loadActualData,
    updateMainUi,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        top: '10%',
        transform: 'translate(0%, calc(-10%+0.5px))',
        overflowX: 'auto',
        maxHeight: '80%',
        width: '90%',
        overflowY: 'auto'
    },
    textFieldInput: {
        padding: theme.spacing(1),
        borderRadius: 4,
        border: '1px solid',
    },
    textFieldRoot: {
        padding: 0,
    },
    button: {
        marginRight: theme.spacing(2),
    },
    notImported: {
        marginTop: theme.spacing(1),
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        loadActualData: (updateObj) => dispatch(loadActualData(updateObj)),
        updateMainUi: (updateObj) => dispatch(updateMainUi(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        mdv: state.present.odm.study.metaDataVersion,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
    };
};

class ConnectedVariableTabUpdate extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            rawData: '',
            parsedData: {},
            nonParsedData: [],
            showNonParsed: false,
        };
    }

    handleChange = (name) => (updateObj) => {
        if (name === 'input') {
            this.setState({
                rawData: updateObj.target.value,
            });
        }
    }

    parseData = async (data, mdv) => {
        let jsonData = await csv({ delimiter: 'auto' }).fromString(data);
        let parsedData = {};
        let nonParsedData = [];
        jsonData.forEach(row => {
            let itemOid;
            let itemGroupOid;
            if (row.dataset) {
                itemGroupOid = getOidByName(mdv, 'itemGroups', row.dataset);
            }
            if (row.variable && itemGroupOid !== undefined) {
                if (row.variable.indexOf('.') < 0) {
                    itemOid = getOidByName(mdv, 'itemDefs', row.variable, itemGroupOid);
                }
            }
            if (itemGroupOid !== undefined && itemOid !== undefined) {
                if (parsedData.hasOwnProperty(itemGroupOid)) {
                    parsedData[itemGroupOid][itemOid] = { ...row };
                } else {
                    parsedData[itemGroupOid] = { [itemOid]: { ...row } };
                }
            } else {
                nonParsedData.push(row);
            }
        });

        this.setState({ parsedData, nonParsedData });
    }

    cancel = () => {
        this.props.updateMainUi({ showDataInput: false });
    }

    import = () => {
        this.parseData(this.state.rawData, this.props.mdv);
    }

    reImport = () => {
        this.setState({ parsedData: {}, nonParsedData: [] });
    }

    getDataTable = () => {
        let data = [];
        let labels = { dataset: 'Dataset', variable: 'Variable', length: 'Length' };
        if (this.state.showNonParsed) {
            data = this.state.nonParsedData;
        } else {
            let parsedData = this.state.parsedData;
            Object.keys(parsedData).forEach(itemGroupOid => {
                Object.keys(parsedData[itemGroupOid]).forEach(itemDefOid => {
                    let item = parsedData[itemGroupOid][itemDefOid];
                    data.push({
                        dataset: item.dataset,
                        variable: item.variable,
                        length: item.length,
                    });
                });
            });
        }
        return (
            <TableWithPagination
                data={data}
                labels={labels}
                title={this.state.showNonParsed ? 'Not Imported Data' : 'Imported Data'}
            />
        );
    }

    update = (updateType) => (event) => {
        //
        const { rawData, parsedData, nonParsedData } = this.state;
        this.props.loadActualData({
            updateType,
            actualData: { rawData, parsedData, nonParsedData },
        });
        this.props.updateMainUi({ showDataInput: false });
    }

    render () {
        const { classes } = this.props;
        const dataLoaded = (Object.keys(this.state.parsedData).length + this.state.nonParsedData.length > 0);

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                PaperProps={{ className: classes.dialog }}
            >
                <DialogTitle>Import Actual Data Attributes</DialogTitle>
                <DialogContent>
                    <Grid container spacing={16} alignItems='flex-end'>
                        <Grid item xs={12}>
                            { dataLoaded && this.state.nonParsedData.length > 0 && (
                                <Typography variant="body1" gutterBottom className={classes.notImported} color='primary'>
                                    <Button
                                        variant='contained'
                                        mini
                                        onClick={() => { this.setState({ showNonParsed: !this.state.showNonParsed }); }}
                                        className={classes.button}
                                    >
                                        { this.state.showNonParsed ? 'Hide' : 'Show' }
                                    </Button>
                                    {this.state.nonParsedData.length} records that could not be parsed because a corresponding variable was not found.
                                </Typography>
                            )}
                            { dataLoaded && (
                                this.getDataTable()
                            )}
                        </Grid>
                        { !dataLoaded && (
                            <Grid item xs={12}>
                                <TextField
                                    multiline
                                    fullWidth
                                    value={this.state.rawData}
                                    rows={20}
                                    placeholder={'dataset,variable,length\nADSL,AVAL,20\nADSL,AVAL.AST,8'}
                                    onChange={this.handleChange('input')}
                                    InputProps={{
                                        disableUnderline: true,
                                        classes: {
                                            root: classes.textFieldRoot,
                                            input: classes.textFieldInput,
                                        },
                                    }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Grid container spacing={16} justify='flex-start'>
                                <Grid item>
                                    <Button
                                        color='primary'
                                        size='small'
                                        onClick={ dataLoaded ? this.reImport : this.import}
                                        variant='contained'
                                    >
                                        { dataLoaded ? 'Re-import' : 'Import'}
                                    </Button>
                                </Grid>
                                { dataLoaded && ([
                                    (<Grid item key='all'>
                                        <Button
                                            color='default'
                                            size='small'
                                            onClick={this.update('all')}
                                            variant='contained'
                                        >
                                            Update All Lengths
                                        </Button>
                                    </Grid>
                                    ), (
                                        <Grid item key='actual'>
                                            <Button
                                                color='default'
                                                size='small'
                                                onClick={this.update('actualData')}
                                                variant='contained'
                                            >
                                                Update Actual Lengths
                                            </Button>
                                        </Grid>
                                    )]
                                )}
                                <Grid item>
                                    <Button
                                        color='secondary'
                                        size='small'
                                        onClick={this.cancel}
                                        variant='contained'
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}

ConnectedVariableTabUpdate.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    updateMainUi: PropTypes.func.isRequired,
};

const VariableTabUpdate = connect(mapStateToProps, mapDispatchToProps)(ConnectedVariableTabUpdate);
export default withStyles(styles)(VariableTabUpdate);
