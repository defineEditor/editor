/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import clone from 'clone';
import CodedValueSelectorTable from 'components/utils/codedValueSelectorTable.js';
import { addCodedValues } from 'actions/index.js';

const styles = theme => ({
    paper: {
        paddingLeft: theme.spacing.unit * 4,
        paddingRight: theme.spacing.unit * 4,
        paddingTop: theme.spacing.unit * 1,
        paddingBottom: theme.spacing.unit * 3,
        position: 'absolute',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        overflowX: 'auto',
        maxHeight: '90%',
        width: '70%',
        overflowY: 'auto'
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addCodedValues: (codeListOid, updateObj) => dispatch(addCodedValues(codeListOid, updateObj))
    };
};

const mapStateToProps = state => {
    return {
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion
    };
};

class ConnectedCodedValueSelector extends React.Component {

    handleAddCodedValues = (selected) => {
        // Get items which are copied from the standard
        let sourceItems;
        if (this.props.sourceCodeList.codeListType === 'decoded') {
            sourceItems = this.props.sourceCodeList.codeListItems;
        } else if (this.props.sourceCodeList.codeListType === 'enumerated') {
            sourceItems = this.props.sourceCodeList.enumeratedItems;
        }
        let items = [];
        selected.forEach(oid => {
            items.push(clone(sourceItems[oid]));
        });
        this.props.addCodedValues(this.props.codeList.oid, {
            items,
            orderNumber: this.props.orderNumber
        });
        this.props.onClose();
    };

    render() {
        const { defineVersion, classes, sourceCodeList, codeList } = this.props;
        return (
            <Modal open={true} onClose={this.props.onClose}>
                <Paper className={classes.paper} elevation={5}>
                    <CodedValueSelectorTable
                        onAdd={this.handleAddCodedValues}
                        onClose={this.props.onClose}
                        sourceCodeList={sourceCodeList}
                        defineVersion={defineVersion}
                        codeList={codeList}
                    />
                </Paper>
            </Modal>
        );
    }
}

ConnectedCodedValueSelector.propTypes = {
    classes: PropTypes.object.isRequired,
    sourceCodeList: PropTypes.object.isRequired,
    codeList: PropTypes.object.isRequired,
    orderNumber: PropTypes.number,
    defineVersion: PropTypes.string.isRequired,
    addCodedValues: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

const CodedValueSelector = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodedValueSelector);
export default withStyles(styles)(CodedValueSelector);
