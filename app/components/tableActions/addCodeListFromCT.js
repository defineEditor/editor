import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import clone from 'clone';
import TextField from '@material-ui/core/TextField';
import { addCodeList } from 'actions/index.js';
import getSelectionList from 'utils/getSelectionList.js';
import CodedValueSelectorTable from 'components/utils/codedValueSelectorTable.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    selectionField: {
        minWidth: 100,
        marginRight: theme.spacing.unit * 6,
        marginBottom: theme.spacing.unit * 2,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addCodeList: (updateObj) => dispatch(addCodeList(updateObj))
    };
};

const mapStateToProps = (state, props) => {
    return {
        codeListOrder : state.present.odm.study.metaDataVersion.order.codeListOrder,
        stdCodeLists  : state.present.stdCodeLists,
        standards     : state.present.odm.study.metaDataVersion.standards,
        defineVersion : state.present.odm.study.metaDataVersion.defineVersion,
    };
};

const getCodeListList = (standard) => {
    let result = {};
    if (standard !== undefined) {
        Object.keys(standard.codeLists).forEach( codeListOid => {
            result[codeListOid] = standard.codeLists[codeListOid].name;
        });
    }
    return result;
};

class ConnectedAddCodeListFromCT extends React.Component {
    constructor(props) {
        super(props);

        let standardList = {};
        Object.keys(props.standards).forEach( standardOid => {
            if (props.stdCodeLists.hasOwnProperty(standardOid) && props.standards[standardOid].type === 'CT') {
                standardList[standardOid] = props.stdCodeLists[standardOid].description;
            }
        });

        let standardOid;
        let codeListList = {};
        if (Object.keys(standardList).length > 0) {
            standardOid = Object.keys(standardList)[0];
            codeListList = getCodeListList(props.stdCodeLists[standardOid]);
        }

        let codeListOid = null;

        this.state = {
            standardOid,
            codeListOid,
            standardList,
            codeListList,
        };
    }

    handleChange = (name) => (updateObj) => {
        if (name === 'standard') {
            let standardOid = updateObj.target.value;
            let standard = this.props.stdCodeLists[updateObj.target.value];
            let codeListList = getCodeListList(standard);
            this.setState( { standardOid, codeListList, codeListOid: null, selectedCodes: [] });
        } else if (name === 'codeList') {
            this.setState( { codeListOid: updateObj.target.value, selectedCodes: [] });
        }
    }

    handleAddCodeList = (selectedCodes) => {
        let codeList = clone(this.props.stdCodeLists[this.state.standardOid].codeLists[this.state.codeListOid]);
        // Check if the OID is unique
        if (this.props.codeListOrder.includes(codeList.oid)) {
            codeList.oid = getOid('CodeList', undefined, this.props.codeListOrder);
        }

        // Keep only selected codes;
        let items;
        if (codeList.codeListType === 'decoded') {
            items = codeList.codeListItems;
        } else if (codeList.codeListType === 'enumerated') {
            items = codeList.enumeratedItems;
        }

        if (items !== undefined) {
            Object.keys(items).forEach( codeOid => {
                if (!selectedCodes.includes(codeOid)) {
                    delete items[codeOid];
                    codeList.itemOrder.splice(codeList.itemOrder.indexOf(codeOid),1);
                }
            });
        }

        // Connect to the standard;
        codeList.standardOid = this.state.standardOid;


        this.props.addCodeList(codeList);
        this.props.onClose();
    };

    render() {
        const { defineVersion, classes } = this.props;
        let codeList;
        if (this.state.codeListOid !== null) {
            let standard = this.props.stdCodeLists[this.state.standardOid];
            codeList = standard.codeLists[this.state.codeListOid];
        }

        return (
            <Grid container spacing={8} className={classes.root}>
                <Grid item>
                    <TextField
                        label='Standard'
                        value={this.state.standardOid}
                        onChange={this.handleChange('standard')}
                        className={classes.selectionField}
                        select
                    >
                        {getSelectionList(this.state.standardList)}
                    </TextField>
                </Grid>
                <Grid item>
                    <TextField
                        label='Codelist'
                        disabled={this.state.standardOid === null}
                        value={this.state.codeListOid||''}
                        onChange={this.handleChange('codeList')}
                        className={classes.selectionField}
                        select
                    >
                        {getSelectionList(this.state.codeListList)}
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    { codeList !== undefined &&
                            <CodedValueSelectorTable
                                key={this.state.codeListOid}
                                onAdd={this.handleAddCodeList}
                                addLabel='Add Codelist'
                                sourceCodeList={codeList}
                                defineVersion={defineVersion}
                            />
                    }
                </Grid>
            </Grid>
        );
    }
}

ConnectedAddCodeListFromCT.propTypes = {
    classes       : PropTypes.object.isRequired,
    stdCodeLists  : PropTypes.object.isRequired,
    codeListOrder : PropTypes.array.isRequired,
    standards     : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
    addCodeList   : PropTypes.func.isRequired,
    onClose       : PropTypes.func.isRequired,
};

const AddCodeListFromCT = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedAddCodeListFromCT
);
export default withStyles(styles)(AddCodeListFromCT);
