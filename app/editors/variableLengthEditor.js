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
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import SaveCancel from 'editors/saveCancel.js';
import TextField from '@material-ui/core/TextField';
import { getMaxLength } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    formControl: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
    root: {
        outline: 'none',
    },
    textField: {
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        lengthForAllDataTypes : state.present.settings.editor.lengthForAllDataTypes,
        actualData            : state.present.odm.actualData || {},
    };
};

class ConnectedVariableLengthEditor extends React.Component {
    constructor (props) {
        super(props);
        let lengthNotApplicable;
        if ( props.lengthForAllDataTypes
            ||
            ['float','text','integer'].indexOf(props.row.dataType) >= 0
            ||
            props.defaultValue.length
        ) {
            lengthNotApplicable = false;
        } else {
            lengthNotApplicable = true;
        }

        let actualLength;
        if (props.actualData.hasOwnProperty('parsedData')
            &&
            props.actualData.parsedData.hasOwnProperty(props.row.datasetOid)
            &&
            props.actualData.parsedData[props.row.datasetOid].hasOwnProperty(props.row.oid)) {
            actualLength = props.actualData.parsedData[props.row.datasetOid][props.row.oid].length;
        }
        this.rootRef = React.createRef();
        this.state = {
            length           : props.defaultValue.length,
            fractionDigits   : props.defaultValue.fractionDigits,
            lengthAsData     : props.defaultValue.lengthAsData ? true : false,
            lengthAsCodeList : props.defaultValue.lengthAsCodeList ? true : false,
            actualLength,
            lengthNotApplicable,
        };
    }

    componentDidMount() {
        // If not applicable, then manually set focus, so that shortcuts work
        if (this.state.lengthNotApplicable) {
            this.rootRef.current.focus();
        }
    }

    handleChange = name => event => {
        if (name === 'lengthAsData') {
            let lengthAsCodeList;
            if (this.state.lengthAsCodeList === true) {
                lengthAsCodeList = false;
            }
            let length;
            if (event.target.checked === true) {
                length = this.state.actualLength;
            }
            this.setState({ [name]: event.target.checked, lengthAsCodeList, length });
        } else if (name === 'lengthAsCodeList') {
            let lengthAsData;
            if (this.state.lengthAsData === true) {
                lengthAsData = false;
            }
            let length = getMaxLength(this.props.row.codeList);
            this.setState({ [name]: event.target.checked, lengthAsData, length });
        } else {
            if (/^\d*$/.test(event.target.value)) {
                this.setState({ [name]: event.target.value });
            }
        }
    }

    save = () => {
        this.props.onUpdate(this.state);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render() {
        const {classes} = this.props;
        const lengthAsData = this.state.lengthAsData;
        const lengthAsCodeList = this.state.lengthAsCodeList;
        const hasCodeList = this.props.row.codeList !== undefined;
        const dataType = this.props.row.dataType;
        const lengthNotApplicable = this.state.lengthNotApplicable;

        let length;
        if (lengthAsData) {
            length = this.state.actualLength || 'No Data';
        } else if (lengthAsCodeList && hasCodeList) {
            length = getMaxLength(this.props.row.codeList);
        } else if (lengthNotApplicable) {
            length = 'Not Applicable';
        } else {
            length = this.state.length || '';
        }
        const fractionDigits = this.state.fractionDigits || '';
        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                className={classes.root}
            >
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Switch
                                        color='primary'
                                        checked={this.state.lengthAsData}
                                        onChange={this.handleChange('lengthAsData')}
                                        disabled={lengthNotApplicable}
                                    />
                                }
                                label="Actual Length"
                                className={classes.formControl}
                            />
                            { hasCodeList &&
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                color='primary'
                                                checked={this.state.lengthAsCodeList}
                                                onChange={this.handleChange('lengthAsCodeList')}
                                                className={classes.switch}
                                            />
                                        }
                                        label="Codelist Length"
                                        className={classes.formControl}
                                        disabled={lengthNotApplicable}
                                    />
                            }
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='Length'
                            autoFocus
                            error={ (length < 1 || length > 200) && length !== '' }
                            value={length}
                            onChange={this.handleChange('length')}
                            className={classes.textField}
                            disabled={lengthAsData || lengthAsCodeList || lengthNotApplicable}
                        />
                    </Grid>
                    { dataType === 'float' &&
                            <Grid item xs={12}>
                                <TextField
                                    label='Fraction Digits'
                                    value={fractionDigits}
                                    onChange={this.handleChange('fractionDigits')}
                                    className={classes.textField}
                                />
                            </Grid>
                    }
                    <Grid item xs={12}>
                        <SaveCancel mini icon save={this.save} cancel={this.cancel}/>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedVariableLengthEditor.propTypes = {
    classes               : PropTypes.object.isRequired,
    defaultValue          : PropTypes.object.isRequired,
    onUpdate              : PropTypes.func.isRequired,
    lengthForAllDataTypes : PropTypes.bool.isRequired,
    actualData            : PropTypes.object,
};

const VariableLengthEditor = connect(mapStateToProps)(ConnectedVariableLengthEditor);
export default withStyles(styles)(VariableLengthEditor);
