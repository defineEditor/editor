/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
import { withStyles, makeStyles, lighten } from '@material-ui/core/styles';
import { connect, useSelector, useDispatch } from 'react-redux';
import { clipboard } from 'electron';
import Typography from '@material-ui/core/Typography';
import withWidth from '@material-ui/core/withWidth';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import GeneralTable from 'components/utils/generalTable.js';
import ControlledTerminologyBreadcrumbs from 'components/controlledTerminology/breadcrumbs.js';
import {
    changeCtView,
    changeCtSettings,
    openSnackbar,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        display: 'flex',
        width: '100%',
    },
});

const mapStateToProps = state => {
    return {
        currentView: state.present.ui.controlledTerminology.currentView,
        codeListSettings: state.present.ui.controlledTerminology.codeLists,
        codedValuesSettings: state.present.ui.controlledTerminology.codedValues,
        ctUiSettings: state.present.ui.controlledTerminology.packages,
        stdCodeLists: state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeCtView: updateObj => dispatch(changeCtView(updateObj)),
        changeCtSettings: updateObj => dispatch(changeCtSettings(updateObj)),
    };
};

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
    title: {
        marginRight: theme.spacing(2),
    },
    copyToBuffer: {
        marginRight: theme.spacing(2),
    },
}));

const getButtonStyles = makeStyles(theme => ({
    popper: {
        zIndex: 1100,
    },
}));

const options = {
    tab: 'As tab-delimited',
    sas: 'As SAS Format',
    r: 'As R vector',
    python: 'As Python dictionary',
};

const CopyToBuffer = ({ selected }) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const classes = getButtonStyles();
    const [selectedIndex, setSelectedIndex] = React.useState('tab');
    const codeListSettings = useSelector(state => state.present.ui.controlledTerminology.codeLists);
    const codedValuesSettings = useSelector(state => state.present.ui.controlledTerminology.codedValues);
    const stdCodeLists = useSelector(state => state.present.stdCodeLists);
    const dispatch = useDispatch();

    const copyToBuffer = (option) => {
        let id = codeListSettings.packageId;
        let ctPackage = stdCodeLists[id];
        let codeList = ctPackage.codeLists[codedValuesSettings.codeListId];
        let decodes = {};
        Object.keys(codeList.codeListItems).forEach(oid => {
            if (selected.includes(oid)) {
                let item = codeList.codeListItems[oid];
                if (item.decodes && item.decodes.length > 0) {
                    decodes[item.codedValue] = item.decodes[0].value;
                }
            }
        });
        let codeNum = Object.keys(decodes).length;
        if (option === 'tab') {
            let result = '';
            Object.keys(decodes).forEach(code => (
                result += `${code}\t${decodes[code]}\n`
            ));
            clipboard.writeText(result);
        } else if (option === 'sas') {
            let result = 'proc format;\n    value $formatName\n';
            Object.keys(decodes).forEach(code => (
                result += `        '${code}' = '${decodes[code]}'\n`
            ));
            result += '    ;\nrun;';
            clipboard.writeText(result);
        } else if (option === 'r') {
            let result = 'c(\n';
            Object.keys(decodes).forEach((code, index) => (
                result += `    "${code}" = "${decodes[code]}"${index !== codeNum - 1 ? ',' : ''}\n`
            ));
            result += ')';
            clipboard.writeText(result);
        } else if (option === 'python') {
            let result = '{\n';
            Object.keys(decodes).forEach((code, index) => (
                result += `    "${code}": "${decodes[code]}"${index !== codeNum - 1 ? ',' : ''}\n`
            ));
            result += '}';
            clipboard.writeText(result);
        }
        dispatch(openSnackbar({
            type: 'success',
            message: `${codeNum} value${codeNum === 1 ? 's' : ''} were copied to clipboard ${options[option][0].toLowerCase() + options[option].slice(1)}.`,
        }));
    };

    const handleClick = () => {
        copyToBuffer(selectedIndex);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        copyToBuffer(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen(prevOpen => !prevOpen);
    };

    const handleClose = event => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    return (
        <Grid container direction='column' alignItems='center'>
            <Grid item xs={12}>
                <ButtonGroup variant='contained' color='default' ref={anchorRef} aria-label='split button'>
                    <Button onClick={handleClick} color='default'>Copy to Clipboard</Button>
                    <Button
                        color='default'
                        size='small'
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label='select merge strategy'
                        aria-haspopup='menu'
                        onClick={handleToggle}
                    >
                        <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal className={classes.popper}>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id='split-button-menu'>
                                        {Object.keys(options).map(index => (
                                            <MenuItem
                                                key={options[index]}
                                                selected={index === selectedIndex}
                                                onClick={event => handleMenuItemClick(event, index)}
                                            >
                                                {options[index]}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </Grid>
        </Grid>
    );
};

class ConnectedCodedValues extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            selected: [],
            searchString: '',
        };
    }

    handleSearchUpdate = (event) => {
        this.setState({ searchString: event.target.value });
    }

    setRowsPerPage = (rowsPerPage) => {
        this.props.changeCtSettings({ view: 'packages', settings: { rowsPerPage } });
    }

    additionalActions = (classes) => {
        let result = [];
        let numSelected = this.state.selected.length;
        if (numSelected) {
            result.push(
                <Grid container justify='flex-start' alignItems='center'>
                    <Grid item>
                        <Typography className={classes.title} variant='subtitle1'>
                            {numSelected} item{numSelected === 1 ? '' : 's'} selected
                        </Typography>
                    </Grid>
                    <Grid item className={classes.copyToBuffer}>
                        <CopyToBuffer selected={this.state.selected}/>
                    </Grid>
                </Grid>
            );
        }
        return result;
    }

    CtToolbar = props => {
        const classes = useToolbarStyles();
        let numSelected = this.state.selected.length;

        return (
            <Toolbar className={numSelected > 0 ? classes.highlight : classes.root}>
                <ControlledTerminologyBreadcrumbs
                    searchString={this.state.searchString}
                    onSearchUpdate={this.handleSearchUpdate}
                    additionalActions={this.additionalActions(classes)}
                />
            </Toolbar>
        );
    };

    handleSelectChange = selected => {
        this.setState({ selected });
    };

    render () {
        const { classes, stdCodeLists, codeListSettings, codedValuesSettings } = this.props;
        let id = codeListSettings.packageId;
        let ctPackage = stdCodeLists.hasOwnProperty(id) ? stdCodeLists[id] : undefined;
        let codeList;
        if (ctPackage !== undefined) {
            codeList = ctPackage.codeLists[codedValuesSettings.codeListId];
        }

        let header = [
            { id: 'oid', label: 'oid', hidden: true, key: true },
            { id: 'codedValue', label: 'Submission Value' },
            { id: 'decode', label: 'Preferred Term' },
            { id: 'definition', label: 'Definition' },
            { id: 'synonyms', label: 'Synonyms' },
            { id: 'cCode', label: 'Code' },
        ];

        // Add width
        let colWidths = {
            codedValue: 300,
            decode: 450,
            cCode: 125,
        };

        header.forEach(column => {
            let width = colWidths[column.id];
            if (width !== undefined) {
                column.style = column.style ? { ...column.style, minWidth: width, maxWidth: width } : { minWidth: width, maxWidth: width };
            }
        });

        let data = [];

        if (codeList) {
            data = codeList.itemOrder.map(oid => {
                let value = codeList.codeListItems[oid];
                return {
                    oid,
                    codedValue: value.codedValue,
                    decode: value.decodes.length > 0 ? value.decodes[0].value : '',
                    definition: value.definition,
                    synonyms: value.synonyms.join(', '),
                    cCode: value.alias ? value.alias.name : '',
                };
            });
        }

        const searchString = this.state.searchString;

        if (searchString !== '') {
            const caseSensitiveSearch = /[A-Z]/.test(searchString);
            data = data.filter(row => (Object.keys(row)
                .filter(item => (!['oid'].includes(item)))
                .some(item => {
                    if (caseSensitiveSearch) {
                        return typeof row[item] === 'string' && row[item].includes(searchString);
                    } else {
                        return typeof row[item] === 'string' && row[item].toLowerCase().includes(searchString);
                    }
                })
            ));
        }

        return (
            <div className={classes.root}>
                { ctPackage !== null && (
                    <GeneralTable
                        data={data}
                        header={header}
                        sorting
                        selection = {{ selected: this.state.selected, setSelected: this.handleSelectChange }}
                        customToolbar={this.CtToolbar}
                        pagination={{ rowsPerPage: this.props.ctUiSettings.rowsPerPage, setRowsPerPage: this.setRowsPerPage }}
                        rowsPerPageOptions={[25, 50, 100, 250, 500]}
                    />
                )}
            </div>
        );
    }
}

ConnectedCodedValues.propTypes = {
    classes: PropTypes.object.isRequired,
    changeCtView: PropTypes.func.isRequired,
    codeListSettings: PropTypes.object.isRequired,
    codedValuesSettings: PropTypes.object.isRequired,
    ctUiSettings: PropTypes.object,
    stdCodeLists: PropTypes.object.isRequired,
};

const CodedValues = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodedValues);
export default withWidth()(withStyles(styles)(CodedValues));
