import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import StandardTable from 'tabs/standardTab.js';
import DatasetTable from 'tabs/datasetTab.js';
import VariableTable from 'tabs/variableTab.js';
import CodeListTable from 'tabs/codeListTab.js';
import CodedValueTable from 'tabs/codedValueTab.js';
import DocumentTab from 'tabs/documentTab.js';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import { changeTab } from 'actions/index.js';

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

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        changeTab: (updateObj) => dispatch(changeTab(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        itemGroupOrder : state.odm.study.metaDataVersion.itemGroupOrder,
        codeLists      : state.odm.study.metaDataVersion.codeLists,
        tabs           : state.ui.tabs,
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

    handleChange = (event, value) => {
        if (value !== this.props.currentTab) {
            let updateObj = {
                selectedTab           : value,
                currentScrollPosition : window.scrollY,
            };
            this.props.changeTab(updateObj);
        }
    }

    generateVariableTables = () => {
        // Sort datasets according to the orderNumber
        let result = this.props.itemGroupOrder.map(itemGroupOid => {
            return (
                <div key={itemGroupOid}>
                    <VariableTable itemGroupOid={itemGroupOid}/>
                </div>
            );
        });
        return result;
    }

    generateCodeListTables = () => {
        // Sort codeLists according to the orderNumber
        const codeLists = this.props.codeLists;
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
        const currentTab = this.props.tabs.currentTab;
        // Remove whitespaces and make lowercase for ID values
        /* TODO: 'Methods', 'Comments', 'Where Conditions'*/
        let tabs = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Coded Values', 'Documents'];

        return (
            <MuiThemeProvider theme={theme}>
                <div className={classes.root}>
                    <AppBar position="fixed" color='default'>
                        <Tabs
                            value={currentTab}
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
                        <br/>
                        {tabs[currentTab] === 'Standards' && <StandardTable/>}
                        {tabs[currentTab] === 'Datasets' && <DatasetTable/>}
                        {tabs[currentTab] === 'Variables' && this.generateVariableTables()}
                        {tabs[currentTab] === 'Codelists' && <CodeListTable/>}
                        {tabs[currentTab] === 'Coded Values' && this.generateCodeListTables()}
                        {tabs[currentTab] === 'Documents' && <DocumentTab/>}
                    </TabContainer>
                </div>
            </MuiThemeProvider>
        );
    }
}

ConnectedEditorTabs.propTypes = {
    classes        : PropTypes.object.isRequired,
    codeLists      : PropTypes.object.isRequired,
    itemGroupOrder : PropTypes.array.isRequired,
};

const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditorTabs);
export default withStyles(styles)(EditorTabs);
