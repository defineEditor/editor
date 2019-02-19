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
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
    updateItemRef
} from 'actions/index.js';

const styles = theme => ({
    textField: {
        width: '40px',
        height: '20px',
    },
    gridItem: {
        flexBasis: 'unset',
        textAlign: 'center',
        height: '20px',
    },
    checkbox: {
        margin: 'none',
    },
    root: {
        outline: 'none',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemRef: (source, updateObj) => dispatch(updateItemRef(source, updateObj)),
    };
};

class ConnectedMandatoryEditor extends React.Component {
    constructor (props) {
        super(props);
        this.rootRef = React.createRef();
        this.state = {
            mandatoryFlag: this.props.mandatory === 'Yes',
        };
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.checked }, this.save);
    };

    save = () => {
        let updateObj = {};
        updateObj.mandatory = this.state.mandatoryFlag ? 'Yes' : 'No';
        this.props.updateItemRef(this.props.source, updateObj);
        this.props.onFinished();
    }

    cancel = () => {
        this.props.onFinished();
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.keyCode === 13) {
            this.save();
        } else if (event.keyCode === 32) {
            event.preventDefault();
            this.setState({ mandatoryFlag: !this.state.mandatoryFlag });
        }
    }

    componentDidMount () {
        this.rootRef.current.focus();
    }

    render () {
        const { classes } = this.props;

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                className={classes.root}
            >
                <Grid
                    container
                    spacing={0}
                >
                    <Grid
                        item
                        xs={12}
                        className={classes.gridItem}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.mandatoryFlag}
                                    onChange={this.handleChange('mandatoryFlag')}
                                    value='Mandatory'
                                    color='primary'
                                    className={classes.checkbox}
                                />
                            }
                            className={classes.textField}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedMandatoryEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    source: PropTypes.object.isRequired,
    mandatory: PropTypes.string.isRequired,
    onFinished: PropTypes.func.isRequired,
};

const MandatoryEditor = connect(undefined, mapDispatchToProps)(ConnectedMandatoryEditor);
export default withStyles(styles)(MandatoryEditor);
