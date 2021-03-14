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
import { withStyles, makeStyles, lighten } from '@material-ui/core/styles';
import GeneralTable from 'components/utils/generalTable.js';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Toolbar from '@material-ui/core/Toolbar';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import getSelectionList from 'utils/getSelectionList.js';
import getTableDataForImport from 'utils/getTableDataForImport.js';
import { copyVariables } from 'utils/copyUtils.js';
import DescriptionFormatter from 'formatters/descriptionFormatter.js';
import { addVariables } from 'actions/index.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    table: {
        minWidth: 100
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing(1)
    },
});

const useToolbarStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
        color: theme.palette.text.primary,
        backgroundColor: lighten(theme.palette.primary.light, 0.85),
    },
    datasetSelector: {
        minWidth: 100,
    },
    checkBoxes: {
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(1),
    },
    searchField: {
        width: 120,
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addVariables: (updateObj) => dispatch(addVariables(updateObj))
    };
};

const mapStateToProps = (state, props) => {
    if (props.sourceMdv !== undefined) {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
            sameDefine: false,
        };
    } else {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
            sourceMdv: state.present.odm.study.metaDataVersion,
            sourceDefineId: state.present.odm.defineId,
            sameDefine: true,
        };
    }
};

const getInitialValues = (props) => {
    // Get a list of all datasets for selection
    const itemGroupList = {};
    props.sourceMdv.order.itemGroupOrder.forEach(itemGroupOid => {
        itemGroupList[itemGroupOid] = props.sourceMdv.itemGroups[itemGroupOid].name;
    });
    // Get initial data
    const sourceItemGroupOid = Object.keys(itemGroupList)[0];
    let itemGroupData = [];
    if (sourceItemGroupOid !== undefined) {
        itemGroupData = getTableDataForImport({
            source: props.sourceMdv.itemGroups[sourceItemGroupOid],
            datasetOid: sourceItemGroupOid,
            mdv: props.sourceMdv,
            defineVersion: props.defineVersion,
            vlmLevel: 0,
        });
    }

    return { itemGroupList, sourceItemGroupOid, itemGroupData };
};

const searchDescription = (description, searchString) => {
    // Search in comment/method
    let fields = ['comment', 'method'];
    let matchFound = fields
        .filter(field => description[field] !== undefined)
        .some(field => {
            let text = getDescription(description[field]);
            if (field === 'method') {
                text += ' ' + description[field].name + ' ' + description[field].type;
                if (description[field].formalExpressions !== undefined && Array.isArray(description[field].formalExpressions)) {
                    description[field].formalExpressions.forEach(exp => {
                        text += ' ' + exp.context + ' ' + exp.value;
                    });
                }
            }
            if (/[A-Z]/.test(searchString)) {
                return text.includes(searchString);
            } else {
                return text.toLowerCase().includes(searchString.toLowerCase());
            }
        });

    // Search in origins
    if (!matchFound) {
        if (description.origins.length > 0) {
            let fullOrigin = '';
            description.origins.forEach(origin => {
                fullOrigin += ' ' + origin.type + ' ' + getDescription(origin);
                fullOrigin = fullOrigin.trim();
            });
            if (/[A-Z]/.test(searchString)) {
                matchFound = fullOrigin.includes(searchString);
            } else {
                matchFound = fullOrigin.toLowerCase().includes(searchString.toLowerCase());
            }
        }
    }

    return matchFound;
};

class AddVariableFromDefineConnected extends React.Component {
    constructor (props) {
        super(props);

        const { itemGroupList, sourceItemGroupOid, itemGroupData } = getInitialValues(props);

        this.state = {
            selected: [],
            searchString: '',
            itemGroupList,
            sourceDefineId: props.sourceDefineId,
            sourceItemGroupOid,
            itemGroupData,
            detachMethods: true,
            detachComments: true,
            copyVlm: true,
            addAsPredecessor: false,
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        // If source ODM has changed
        if (nextProps.sourceDefineId !== prevState.sourceDefineId) {
            return ({ ...getInitialValues(nextProps), sourceDefineId: nextProps.sourceDefineId });
        } else {
            return null;
        }
    }

    handleSelectChange = selected => {
        this.setState({ selected });
    };

    handleAddVariables = () => {
        let { mdv, sourceMdv, itemGroupOid, position, sameDefine } = this.props;
        let currentGroup = mdv.itemGroups[itemGroupOid];
        let sourceGroup = sourceMdv.itemGroups[this.state.sourceItemGroupOid];
        // Order itemRefOids as they are in the data;
        let originalSorting = this.state.itemGroupData.map(row => row.itemRefOid);
        let itemRefList = this.state.selected.sort((id1, id2) => (originalSorting.indexOf(id1) - originalSorting.indexOf(id2)));
        let { itemDefs, itemRefs, codeLists, methods, leafs, comments, valueLists, whereClauses } = copyVariables({
            mdv,
            sourceMdv,
            currentGroup,
            sourceGroup,
            itemRefList,
            itemGroupOid,
            sameDefine,
            sourceItemGroupOid: this.state.sourceItemGroupOid,
            copyVlm: this.state.copyVlm,
            addAsPredecessor: this.state.addAsPredecessor,
            detachMethods: this.state.detachMethods,
            detachComments: this.state.detachComments,
        });

        // Get position to insert
        let positionUpd = position || (mdv.itemGroups[itemGroupOid].itemRefOrder.length + 1);

        this.props.addVariables({
            itemGroupOid,
            position: positionUpd,
            itemDefs,
            itemRefs,
            codeLists,
            methods,
            leafs,
            comments,
            valueLists,
            whereClauses,
        });

        this.props.onClose();
    };

    handleItemGroupChange = event => {
        if (event.target.value !== this.state.sourceItemGroupOid) {
            let sourceItemGroupOid = event.target.value;
            let itemGroupData = getTableDataForImport({
                source: this.props.sourceMdv.itemGroups[sourceItemGroupOid],
                datasetOid: sourceItemGroupOid,
                mdv: this.props.sourceMdv,
                defineVersion: this.props.defineVersion,
                vlmLevel: 0,
            });
            this.setState({
                sourceItemGroupOid: event.target.value,
                itemGroupData,
                selected: [],
                page: 0,
            });
        }
    };

    handleChangeSearchString = event => {
        this.setState({ searchString: event.target.value });
    };

    handleCheckBoxChange = name => event => {
        if (name === 'addAsPredecessor' && this.state['copyVlm'] === true) {
            this.setState({
                copyVlm: false,
                [name]: !this.state[name]
            });
        } else {
            this.setState({ [name]: !this.state[name] });
        }
    }

    Toolbar = props => {
        const classes = useToolbarStyles();
        let numSelected = this.state.selected.length;

        return (
            <Toolbar className={numSelected > 0 ? classes.highlight : classes.root}>
                <Grid
                    container
                    justify='space-between'
                    alignItems='center'
                >
                    <Grid item>
                        <Grid
                            container
                            justify='flex-start'
                            alignItems='center'
                        >
                            <Grid item>
                                {numSelected > 0 ? (
                                    <Grid item>
                                        <Button
                                            onClick={this.handleAddVariables}
                                            color='default'
                                            variant='contained'
                                        >
                                            Add {numSelected} variable{numSelected > 1 && 's'}
                                        </Button>
                                    </Grid>
                                ) : (
                                    <Grid item>
                                        <TextField
                                            label='Dataset'
                                            value={this.state.sourceItemGroupOid}
                                            onChange={this.handleItemGroupChange}
                                            className={classes.datasetSelector}
                                            select
                                        >
                                            {getSelectionList(this.state.itemGroupList)}
                                        </TextField>
                                    </Grid>
                                )}
                            </Grid>
                            <Grid item>
                                <FormGroup row className={classes.checkBoxes}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={this.state.copyVlm}
                                                onChange={this.handleCheckBoxChange('copyVlm')}
                                                color='primary'
                                                value='copyVlm'
                                                disabled={this.state.addAsPredecessor}
                                            />
                                        }
                                        label='Copy VLM'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={this.state.detachMethods}
                                                onChange={this.handleCheckBoxChange('detachMethods')}
                                                disabled={!this.props.sameDefine}
                                                color='primary'
                                                value='detachMethods'
                                            />
                                        }
                                        label='Detach Methods'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={this.state.detachComments}
                                                onChange={this.handleCheckBoxChange('detachComments')}
                                                disabled={!this.props.sameDefine}
                                                color='primary'
                                                value='detachComments'
                                            />
                                        }
                                        label='Detach Comments'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={this.state.addAsPredecessor}
                                                onChange={this.handleCheckBoxChange('addAsPredecessor')}
                                                color='primary'
                                                value='addAsPredecessor'
                                            />
                                        }
                                        label='Add as Predecessor'
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <TextField
                            onChange={this.handleChangeSearchString}
                            value={this.state.searchString}
                            label='Search'
                            className={classes.searchField}
                        />
                    </Grid>
                </Grid>
            </Toolbar>
        );
    };

    descriptionFormatter = (props) => {
        return (
            <DescriptionFormatter
                model={this.props.sourceMdv.model}
                mdv={this.props.sourceMdv}
                value={props.row.description}
            />
        );
    }

    getVariableTable (defineVersion, classes) {
        const { searchString, itemGroupData } = this.state;

        let header = [
            { id: 'itemRefOid', label: 'oid', hidden: true, key: true },
            { id: 'name', label: 'Name' },
            { id: 'label', label: 'Label' },
            { id: 'description', label: 'Description', formatter: this.descriptionFormatter, noSort: true },
        ];

        let colWidths = {
            name: 120,
            label: 230,
        };

        header.forEach(column => {
            let width = colWidths[column.id];
            if (width !== undefined) {
                column.style = column.style ? { ...column.style, minWidth: width } : { minWidth: width };
            }
        });

        let data = itemGroupData.slice();
        if (searchString !== '') {
            data = data.filter(row => {
                if (/[A-Z]/.test(searchString)) {
                    return row.name.includes(searchString) ||
                        row.label.includes(searchString) ||
                        searchDescription(row.description, searchString)
                    ;
                } else {
                    return row.name.toLowerCase().includes(searchString.toLowerCase()) ||
                        row.label.toLowerCase().includes(searchString.toLowerCase()) ||
                        searchDescription(row.description, searchString)
                    ;
                }
            });
        }

        return (
            <GeneralTable
                data={data}
                header={header}
                customToolbar={this.Toolbar}
                pagination
                selection = {{ selected: this.state.selected, setSelected: this.handleSelectChange }}
                initialRowsPerPage= {25}
            />
        );
    }

    render () {
        const { defineVersion, classes } = this.props;
        return (
            this.getVariableTable(
                defineVersion,
                classes
            )
        );
    }
}

AddVariableFromDefineConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    sourceMdv: PropTypes.object.isRequired,
    sameDefine: PropTypes.bool.isRequired,
    defineVersion: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string.isRequired,
    sourceDefineId: PropTypes.string.isRequired,
    position: PropTypes.number,
    onClose: PropTypes.func.isRequired,
};

const addVariableFromDefine = connect(mapStateToProps, mapDispatchToProps)(
    AddVariableFromDefineConnected
);
export default withStyles(styles)(addVariableFromDefine);
