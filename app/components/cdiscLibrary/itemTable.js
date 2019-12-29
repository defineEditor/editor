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
import { lighten, makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import GeneralTable from 'components/utils/generalTable.js';
import CdiscLibraryDataTypeButton from 'components/utils/cdiscLibraryDataTypeButton.js';
import CdiscLibraryCodeListButton from 'components/utils/cdiscLibraryCodeListButton.js';

const getStyles = makeStyles(theme => ({
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
    addButton: {
        marginLeft: theme.spacing(3),
    },
}));

// Redux functions
const mapStateToProps = (state, props) => {
    if (props.mountPoint === 'Main') {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            stdCodeLists: state.present.stdCodeLists,
        };
    }
};

const cdashAttributes = {
    definition: 'Definition',
    questionText: 'Question Text',
    completionInstructions: 'Completion Instructions',
    prompt: 'Prompt',
    mappingInstructions: 'Mapping Instructions',
    implementationNotes: 'Implementation Notes',
};

const itemDescription = (layout) => (props) => {
    const item = props.row;
    if (layout !== 3) {
        // SDTM or ADaM
        return (
            <div>
                {item.description}
                { item.valueList !== undefined &&
                        <React.Fragment>
                            <br />
                            <Typography variant="body2" color='textSecondary' display='inline'>
                                Possible values:&nbsp;
                            </Typography>
                            {item.valueList.join(', ')}
                        </React.Fragment>
                }
                { item.describedValueDomain !== undefined &&
                        <React.Fragment>
                            <br />
                            <Typography variant="body2" color='textSecondary' display='inline'>
                                Value domain:&nbsp;
                            </Typography>
                            {item.describedValueDomain}
                        </React.Fragment>
                }
            </div>
        );
    } else {
        // CDASH
        return (
            <div>
                { Object.keys(cdashAttributes).map((attr, index) => {
                    if (item[attr] !== undefined) {
                        return (
                            <React.Fragment key={index}>
                                { index !== 0 && <br />}
                                <Typography variant="body2" color='textSecondary' display='inline'>
                                    {cdashAttributes[attr]}:&nbsp;
                                </Typography>
                                {item[attr]}
                            </React.Fragment>
                        );
                    }
                }) }
            </div>
        );
    }
};

const itemRole = (props) => {
    const { role, row } = props;
    return (
        <React.Fragment>
            {role}
            { row.roleDescription !== undefined && row.roleDescription !== row.role &&
                    <React.Fragment>
                        <br />
                        <Typography variant="body2" color='textSecondary'>
                            Description:&nbsp;
                        </Typography>
                        <Typography variant="body2" color='textPrimary' display='inline'>
                            {row.roleDescription}
                        </Typography>
                    </React.Fragment>
            }
        </React.Fragment>
    );
};

const getCodeListsData = (props) => {
    /* Get information about codelists, which are referenced in the items */
    const mdv = props.mdv;
    // Get all standard codelists loaded into the study
    const loadedCodelistOids = Object.values(mdv.standards).filter(std => (std.type === 'CT' && std.name === 'CDISC/NCI')).map(std => std.oid);
    const allStdCodeLists = props.stdCodeLists;
    const allStdCodeListOids = Object.keys(allStdCodeLists);

    let stdCodeListsLoaded = { };
    loadedCodelistOids.forEach(oid => {
        if (allStdCodeListOids.includes(oid)) {
            stdCodeListsLoaded[oid] = allStdCodeLists[oid];
        }
    });

    // Get all standard codelists, which are already in Define-XML
    let studyCodeLists = { };
    let studyCcodes = [];
    // Keep only standard codelists
    Object.keys(mdv.codeLists).forEach(oid => {
        let codeList = mdv.codeLists[oid];
        if ((codeList.alias && codeList.alias.context === 'nci:ExtCodeID' && codeList.alias.name)) {
            studyCodeLists[oid] = codeList;
            studyCcodes.push(codeList.alias.name);
        }
    });

    let codeLists = {
        'study': { codeLists: studyCodeLists, studyCcodes },
        ...stdCodeListsLoaded,
    };

    return codeLists;
};

const deriveAdditionalAttributes = (items, codeLists) => {
    return items.map(item => {
        // Covert simpDatatype to Define-XML datatype
        let dataType;
        if (item.simpleDatatype === 'Char') {
            if (item.describedValueDomain !== 'ISO 8601') {
                dataType = 'text';
            } else if (!item.name.endsWith('DUR')) {
                dataType = 'datetime';
            } else {
                dataType = 'durationDatetime';
            }
        } else if (item.simpleDatatype === 'Num') {
            dataType = 'integer';
        }
        // Get codelist data
        let codeListOptions = [];
        let codeListInfo = {};
        if (item.codelist) {
            let cCode = item.codelist;
            // Search codelists in the study
            if (codeLists.study.studyCcodes && codeLists.study.studyCcodes.includes(cCode)) {
                Object.values(codeLists.study.codeLists)
                    .filter(codeList => (codeList.alias && codeList.alias.name === cCode))
                    .forEach(codeList => {
                        codeListOptions.push({ category: 'Study', categoryOid: 'study', oid: codeList.oid, name: codeList.name });
                    })
                ;
            }
            // Search codelists in the standardCodeLists
            Object.keys(codeLists)
                .filter(ctOid => ctOid !== 'study')
                .forEach(ctOid => {
                    let ct = codeLists[ctOid];
                    if (Object.keys(ct.nciCodeOids).includes(cCode)) {
                        let codeList = ct.codeLists[ct.nciCodeOids[cCode]];
                        codeListOptions.push({ category: `${ct.type} ${ct.version}`, categoryOid: ctOid, oid: codeList.oid, name: codeList.name });
                    }
                })
            ;
            if (codeListOptions.length > 0) {
                codeListInfo = codeListOptions[0];
            }
        }

        return { ...item, dataType, codeListOptions, codeListInfo };
    });
};

class ConnectedItemTable extends React.Component {
    constructor (props) {
        super(props);

        let codeLists = getCodeListsData(props);
        let items = deriveAdditionalAttributes(props.items, codeLists);

        this.state = {
            searchString: '',
            selected: [],
            codeLists,
            items,
        };
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleSelectChange = selected => {
        this.setState({ selected });
    };

    handleDataTypeChange = (ordinal, dataType) => {
        let items = this.state.items.map(item => {
            if (item.ordinal === ordinal) {
                return { ...item, dataType };
            } else {
                return item;
            }
        });
        this.setState({ items });
    };

    dataTypeButton = (props) => {
        if (props.simpleDatatype === 'Num' || props.row.describedValueDomain === 'ISO 8601') {
            return (
                <CdiscLibraryDataTypeButton setDataType={this.handleDataTypeChange} {...props} />
            );
        } else if (props.simpleDatatype === 'Char') {
            return 'text';
        }
    }

    handleSetCodeListInfo = (ordinal, codeListInfo) => {
        let items = this.state.items.map(item => {
            if (item.ordinal === ordinal) {
                return { ...item, codeListInfo };
            } else {
                return item;
            }
        });
        this.setState({ items });
    };

    codeListButton = (props) => {
        if (!props.codelist) {
            return null;
        } else {
            if (this.props.mountPoint === 'Main' && props.row.codeListOptions.length > 1) {
                return (<CdiscLibraryCodeListButton setCodeListInfo={this.handleSetCodeListInfo} {...props}/>);
            } else if (this.props.mountPoint === 'Main' && props.row.codeListOptions.length === 1) {
                return (<span>{props.row.codeListInfo.name}</span>);
            } else {
                return (<span>{props.codelist}</span>);
            }
        }
    };

    customToolbar = props => {
        const classes = getStyles();
        let numSelected = this.state.selected.length;

        return (
            <Toolbar className={numSelected > 0 ? classes.highlight : classes.root}>
                { numSelected > 0 ? (
                    <Typography variant='subtitle1'>
                        {numSelected} selected
                        <Button
                            size='medium'
                            variant='contained'
                            color='secondary'
                            onClick={this.addValues}
                            className={classes.addButton}
                        >
                            Add
                        </Button>
                    </Typography>
                ) : (
                    this.props.title
                )}
            </Toolbar>
        );
    };

    render () {
        const { mountPoint, itemGroup, searchString, variableSet } = this.props;

        // Define layout depending on the dataset type
        let layout;
        let product = this.props.product;
        if (product.type === 'Foundational Model' && product.model === 'SDTM') {
            layout = 4;
        } else if (itemGroup.type === 'SDTM Dataset') {
            layout = 1;
        } else if (itemGroup.constructor && itemGroup.constructor.name === 'DataStructure') {
            layout = 2;
        } else if (product.model === 'CDASH') {
            layout = 3;
        } else {
            layout = 1;
        }

        const descriptionFormatter = itemDescription(layout);

        let header = [
            { id: 'ordinal', label: 'id', hidden: true, key: true },
            { id: 'name', label: 'Name', style: { wordBreak: 'break-all' } },
            { id: 'label', label: 'Label' },
            { id: 'simpleDatatype', label: 'Datatype', formatter: mountPoint === 'Main' && this.dataTypeButton },
            { id: 'codelist', label: 'Codelist', formatter: mountPoint === 'Main' && this.codeListButton },
            { id: 'description', label: 'Description', formatter: descriptionFormatter },
        ];

        // Additional columns shown only in the CDISC Library viewer mode
        if (mountPoint !== 'Main') {
            header.splice(4, 0, { id: 'core', label: 'Core' }, { id: 'role', label: 'Role', formatter: itemRole });
            // Drop columns for some of the layouts
            if (![1, 4].includes(layout)) {
                header = header.filter(col => (col.id !== 'role'));
            }
            if (layout === 3) {
                header = header.filter(col => (col.id !== 'core'));
            }
            if (layout === 4) {
                header = header.filter(col => (col.id !== 'codelist' && col.id !== 'core'));
            }
        }

        // Add width
        let colWidths;
        if (mountPoint === 'Main') {
            colWidths = {
                name: 120,
                label: 230,
                simpleDatatype: 155,
                codelist: 220,
            };
        } else {
            colWidths = {
                name: 120,
                label: 230,
                simpleDatatype: 100,
                codelist: 100,
                core: 80,
                role: layout === 4 ? 290 : 100,
            };
        }

        header.forEach(column => {
            let width = colWidths[column.id];
            if (width !== undefined) {
                column.style = column.style ? { ...column.style, minWidth: width, maxWidth: width } : { minWidth: width, maxWidth: width };
            }
        });

        let data = this.state.items.slice();
        if (variableSet && variableSet !== '__all') {
            // Filter by variable set if it is specified. Value _all is for ADaM structure, which corresponds to all items
            data = data.filter(item => item.variableSet === variableSet);
        }

        if (searchString !== '') {
            data = data.filter(row => {
                let matchFound = false;
                matchFound = Object.keys(row).some(attr => {
                    // Exclude technical attributes
                    if (['id', 'coreobject', 'type', 'ordinal', 'href', 'codelisthref'].includes(attr.toLowerCase())) {
                        return false;
                    }
                    if (typeof row[attr] === 'string') {
                        if (/[A-Z]/.test(searchString)) {
                            return row[attr].includes(searchString);
                        } else {
                            return row[attr].toLowerCase().includes(searchString.toLowerCase());
                        }
                    }

                    if (attr.toLowerCase() === 'valuelist' && row[attr] !== undefined && row[attr].length > 0) {
                        if (/[A-Z]/.test(searchString)) {
                            return row[attr].join(', ').includes(searchString);
                        } else {
                            return row[attr].join(', ').toLowerCase().includes(searchString.toLowerCase());
                        }
                    }
                });

                return matchFound;
            });
        }

        return (
            <GeneralTable
                data={data}
                header={header}
                sorting
                customToolbar={this.customToolbar}
                disableToolbar
                fullRowSelect
                pagination
                rowsPerPageOptions={[25, 50, 100, 250]}
                selection = { mountPoint === 'Main' && { selected: this.state.selected, setSelected: this.handleSelectChange }}
            />
        );
    }
}

ConnectedItemTable.propTypes = {
    items: PropTypes.array.isRequired,
    itemGroup: PropTypes.object.isRequired,
    product: PropTypes.object.isRequired,
    searchString: PropTypes.string.isRequired,
    title: PropTypes.object.isRequired,
    mountPoint: PropTypes.string.isRequired,
    variableSet: PropTypes.string,
    mdv: PropTypes.object,
    stdCodeLists: PropTypes.object,
};

const ItemTable = connect(mapStateToProps)(ConnectedItemTable);
export default ItemTable;
