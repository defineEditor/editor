import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import ReactSelectEditor from 'editors/reactSelectEditor.js';
import getSelectionList from 'utils/getSelectionList.js';

const styles = theme => ({
    selectList: {
        minWidth: '110px',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        codeLists    : state.odm.study.metaDataVersion.codeLists,
        stdCodeLists : state.stdCodeLists,
        standards    : state.odm.study.metaDataVersion.standards,
    };
};


class ConnectedCodeListStandardEditor extends React.Component {
    constructor(props) {
        super(props);

        let standardList = {};
        Object.keys(props.standards).forEach( standardOid => {
            if (props.standards[standardOid].type === 'CT') {
                standardList[standardOid] = props.stdCodeLists[standardOid].description;
            }
        });

        if (Object.keys(standardList).length === 0) {
            // Create a blank value, so that a blank selection is shown
            standardList = { noStandards: ' ' };
        }

        let codeListList = [];

        let standard;
        let standardCodeList;
        if (props.defaultValue.standardOid !== undefined && props.stdCodeLists.hasOwnProperty(props.defaultValue.standardOid)) {
            standard = props.stdCodeLists[props.defaultValue.standardOid];
            Object.keys(standard.codeLists).forEach( codeListOid => {
                let item = {
                    value : codeListOid,
                    label : standard.codeLists[codeListOid].name,
                };
                codeListList.push(item);
            });
            Object.keys(props.standards).forEach( standardOid => {
                if (props.standards[standardOid].type === 'CT') {
                    standardList[standardOid] = props.stdCodeLists[standardOid].description;
                }
            });
            if (codeListList.length === 0) {
                // Create a blank value, so that a blank selection is shown
                codeListList = [{ value: 'noCodeLists', label: 'No Codelist available for this standard' }];
            }
            if (props.defaultValue.alias !== undefined && standard.nciCodeOids.hasOwnProperty(props.defaultValue.alias.name)) {
                standardCodeList = standard.codeLists[standard.nciCodeOids[props.defaultValue.alias.name]];
            }
        }

        this.state = {
            standard,
            standardList,
            codeListList,
            standardCodeList,
        };
    }

    handleChange = (name) => (updateObj) => {
    }

    render () {
        const { classes } = this.props;
        let standardDescription = '';
        if (this.state.standard !== undefined) {
            standardDescription = this.state.standard.description;
        }
        let standardCodeListOid;
        if (this.state.standardCodeList !== undefined) {
            standardCodeListOid = this.state.standardCodeList.oid;
        }

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <TextField
                        label='Stadard'
                        select
                        value={standardDescription}
                        onChange={this.handleChange('updateStandard')}
                        className={classes.selectList}
                    >
                        {getSelectionList(this.state.standardList)}
                    </TextField>
                </Grid>
                {this.state.standard !== undefined &&
                        <Grid item xs={12}>
                            <ReactSelectEditor
                                onUpdate={this.handleChange('updateCodeList')}
                                defaultValue={standardCodeListOid}
                                options={this.state.codeListList}
                                extensible={false}
                            />
                        </Grid>
                }
            </Grid>
        );
    }
}

ConnectedCodeListStandardEditor.propTypes = {
    codeLists    : PropTypes.object.isRequired,
    stdCodeLists : PropTypes.object.isRequired,
    standards    : PropTypes.object.isRequired,
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func
};

const CodeListStandardEditor = connect(mapStateToProps)(ConnectedCodeListStandardEditor);
export default withStyles(styles)(CodeListStandardEditor);
