
/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import compareCodeListItems from 'utils/compareCodeListItems.js';
import {
    closeModal,
    updateLinkCodeLists,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        top           : '40%',
        transform     : 'translate(0%, calc(-50%+0.5px))',
        overflowX     : 'auto',
        maxHeight     : '85%',
        maxWidth      : '70%',
        overflowY     : 'auto',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        codeLists     : state.present.odm.study.metaDataVersion.codeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        closeModal              : () => dispatch(closeModal()),
        updateLinkCodeLists     : (updateObj) => dispatch(updateLinkCodeLists(updateObj)),
    };
};

class ConnectedModalLinkCodeLists extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ignoreCodeListOrder: true,
            ignoreCase: true,
            ignoreExcessiveWhiteSpaces: true,
        };
    }

    handleChange = (name) => (event, checked) => {
        if ([
            'ignoreCodeListOrder',
            'ignoreCase',
            'ignoreExcessiveWhiteSpaces',
        ].includes(name)) {
            this.setState({ [name]: checked });
        }
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        }
    }

    onLinkCodeLists = () => {
        // create codelist compare options
        let compareOptions = {
            ignoreCodeListOrder: this.state.ignoreCodeListOrder,
            ignoreCase: this.state.ignoreCase,
            ignoreExcessiveWhiteSpaces: this.state.ignoreExcessiveWhiteSpaces,
        };
        // retrieve enumerated codelists to an object
        let enumeratedCodeLists = Object.keys(this.props.codeLists)
            // filter codelists to enumerated
            .filter( codeList => this.props.codeLists[codeList].codeListType === 'enumerated' && !this.props.codeLists[codeList].linkedCodeListOid)
            // create new object that includes only filtered codelists
            .reduce( (object, key) => {
                // map assigns array of codelist values to property 'key'
                object[key] = this.props.codeLists[key].itemOrder.map( item => {
                    return this.props.codeLists[key].enumeratedItems[item].codedValue;
                });
                return object;
            }, {} );
        // analogously retrieve decoded codelists to an object;
        let decodedCodeLists = Object.keys(this.props.codeLists)
            .filter( codeList => this.props.codeLists[codeList].codeListType === 'decoded' && !this.props.codeLists[codeList].linkedCodeListOid)
            .reduce( (object, key) => {
                object[key] = this.props.codeLists[key].itemOrder.map( item => {
                    return (this.props.codeLists[key].codeListItems[item].decodes[0] || { value: '' }).value;
                });
                return object;
            }, {} );
        // create object with codelists to link: property decodedCodeList - value enumeratedCodeList
        const linkedCodeLists = Object.keys(decodedCodeLists)
            // sort the array of keys to put text decoded codelists first
            .sort( (first, second) => {
                if (this.props.codeLists[first].dataType === this.props.codeLists[second].dataType) {
                    return 0;
                } else if (this.props.codeLists[first].dataType === 'text') {
                    return -1;
                } else {
                    return 1;
                }
            })
            // iterate on decodedCodelists properties
            .reduce( (object, key) => {
                // iterate on enumeratedCodelists properties
                // stop on finding a match/delete the respective enumeratedCodelists property to avoid comparing to already linked codelist
                Object.keys(enumeratedCodeLists).some( (element, index) => {
                    return compareCodeListItems(decodedCodeLists[key], enumeratedCodeLists[element], compareOptions) ?
                        ((object[key] = element, delete enumeratedCodeLists[element]), true) : false;
                });
                return object;
            }, {} );
        if (Object.keys(linkedCodeLists).length !== 0) {
            // perform an action only if there are codelists to link
            this.props.updateLinkCodeLists(linkedCodeLists);
        }
        this.props.closeModal();
    }

    onCancel = () => {
        this.props.closeModal();
    }

    render () {
        const { classes } = this.props;

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                open
                PaperProps={{className: classes.dialog}}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title">
                    Link Decoded and Enumerated Codelists
                </DialogTitle>
                <DialogContent>
                    <Grid
                        container
                        spacing={16}
                    >
                        <Grid item xs={12}>
                            <Typography variant='body1' gutterBottom align='left'>
                                The codelists will be compared against each other based on the rules selected below.
                                Already linked codelists are excluded from the comparison and their links are left as they are.
                                Regardless of the rules you choose, codelists&apos; items will not be updated.
                                However, when a matching pair is found, enumarated codelist fully inherits decoded codelist items.
                            </Typography>
                            <Grid container>
                                <Grid item xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.ignoreCodeListOrder}
                                                    onChange={this.handleChange('ignoreCodeListOrder')}
                                                    color='primary'
                                                    className={classes.switch}
                                                />
                                            }
                                            label='Ignore codelist order'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.ignoreCase}
                                                    onChange={this.handleChange('ignoreCase')}
                                                    color='primary'
                                                    className={classes.switch}
                                                />
                                            }
                                            label='Ignore codelist case'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.ignoreExcessiveWhiteSpaces}
                                                    onChange={this.handleChange('ignoreExcessiveWhiteSpaces')}
                                                    color='primary'
                                                    className={classes.switch}
                                                />
                                            }
                                            label='Ignore multiple whitespace characters, leading and trailing blanks'
                                        />
                                    </FormGroup>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onLinkCodeLists} color="primary">
                        Link Codelists
                    </Button>
                    <Button onClick={this.onCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalLinkCodeLists.propTypes = {
    classes: PropTypes.object.isRequired,
    codeLists: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
};

const ModalLinkCodeLists = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalLinkCodeLists);
export default withStyles(styles)(ModalLinkCodeLists);
