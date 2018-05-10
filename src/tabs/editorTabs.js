import React from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import StandardTable from 'tabs/standardTab.js';
import DatasetTable from 'tabs/datasetTab.js';
import VariableTable from 'tabs/variableTab.js';
import CodeListTable from 'tabs/codeListTab.js';
import CodedValueTable from 'tabs/codedValueTab.js';
import DocumentTab from 'tabs/documentTab.js';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme, withStyles } from 'material-ui/styles';
import getItemGroupOrder from 'utils/getItemGroupOrder.js';
//import Grid from 'material-ui/Grid';

const theme = createMuiTheme({
    palette: {
        primary: {
            light        : '#757ce8',
            main         : '#3f50b5',
            dark         : '#002884',
            contrastText : '#fff',
        },
        secondary: {
            light        : '#ff7961',
            main         : '#f44336',
            dark         : '#ba000d',
            contrastText : '#000',
        },
    },
});

const mapStateToProps = state => {
    return {
        odm          : state.odm,
        stdCodeLists : state.stdCodeLists,
    };
};

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    root: {
        flexGrow        : 1,
        marginTop       : theme.spacing.unit * 3,
        backgroundColor : theme.palette.background.paper,
    },
});

class ConnectedEditorTabs extends React.Component {
    constructor (props) {
        super(props);
        this.state = { value: 0 };
        this.handleChange = this.handleChange.bind(this);
        this.handleMdvChange = this.handleMdvChange.bind(this);
        this.generateVariableTables = this.generateVariableTables.bind(this);
    }

    handleChange (event, value) {
        this.setState({ value });
    }

    handleMdvChange (type, elementId, updateObj) {
        let odm = Object.assign({},this.props.odm);
        let mdv = odm.study.metaDataVersion;
        if (type === 'Item') {
            mdv.itemGroups[elementId.itemGroupOid].update(updateObj, mdv);
        }

        this.setState({odm: odm});
    }

    generateVariableTables = (defineVersion) => {
        let datasets = [];
        // Sort datasets according to the orderNumber
        const mdv = this.props.odm.study.metaDataVersion;
        getItemGroupOrder(mdv.itemGroups).forEach((itemGroupOid, index) => {
            datasets[index] = itemGroupOid;
        });
        let result = datasets.map(itemGroupOid => {
            return (
                <div key={itemGroupOid}>
                    <VariableTable mdv={mdv} itemGroupOid={itemGroupOid} onMdvChange={this.handleMdvChange} defineVersion={defineVersion}/>
                </div>
            );
        });
        return result;
    }

    generateCodeListTables = (defineVersion) => {
        // Sort codeLists according to the orderNumber
        const codeLists = this.props.odm.study.metaDataVersion.codeLists;
        let codeListOids = Object.keys(codeLists);
        // Show only enumerated and decoded codelists
        let result = codeListOids
            .filter(codeListOid => (codeLists[codeListOid].codeListType !== 'external'))
            .map(codeListOid => {
                return (
                    <div key={codeListOid}>
                        <CodedValueTable codeListOid={codeListOid}/>
                    </div>
                );
            });
        return result;
    }

    render() {

        const { classes } = this.props;
        const { value } = this.state;
        const defineVersion = this.props.odm.study.metaDataVersion.defineVersion;
        // Remove whitespaces and make lowercase for ID values
        /* TODO: 'Methods', 'Comments', 'Where Conditions'*/
        let tabs = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Coded Values', 'Documents'];

        return (
            <MuiThemeProvider theme={theme}>
                <div className={classes.root}>
                    <AppBar position="sticky" color='default'>
                        <Tabs
                            value={value}
                            onChange={this.handleChange}
                            fullWidth
                            indicatorColor='primary'
                            textColor='primary'
                            scrollable
                            scrollButtons="auto"
                        >
                            { tabs.map( tab => {
                                return <Tab key={tab} label={tab} />;
                            })
                            }
                        </Tabs>
                    </AppBar>
                    <TabContainer>
                        {tabs[value] === 'Standards' && <StandardTable/>}
                        {tabs[value] === 'Datasets' && <DatasetTable
                            defineVersion={defineVersion}
                        />}
                        {tabs[value] === 'Variables' && this.generateVariableTables(defineVersion)}
                        {tabs[value] === 'Codelists' && <CodeListTable/>}
                        {tabs[value] === 'Coded Values' && this.generateCodeListTables(defineVersion)}
                        {tabs[value] === 'Documents' && <DocumentTab/>}
                    </TabContainer>
                </div>
            </MuiThemeProvider>
        );
    }
}

ConnectedEditorTabs.propTypes = {
    classes      : PropTypes.object.isRequired,
    odm          : PropTypes.object.isRequired,
    stdCodeLists : PropTypes.object,
};

const EditorTabs = connect(mapStateToProps)(ConnectedEditorTabs);
export default withStyles(styles)(EditorTabs);
