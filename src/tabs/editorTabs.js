import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import StandardTable from 'tabs/standardTab.js';
import DatasetTable from 'tabs/datasetTab.js';
import VariableTab from 'tabs/variableTab.js';
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


    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    handleChange = (event, value) => {
        let tabs = this.props.tabs;
        if (value !== this.props.currentTab) {
            // Do not update scroll position for Variables and Coded Values as it is managed within those
            // components for each Dataset/CodeList separately
            let updateObj;
            if (!['Variables', 'Coded Values'].includes(tabs.tabNames[tabs.currentTab])) {
                updateObj = {
                    selectedTab           : value,
                    currentScrollPosition : window.scrollY,
                };
            } else {
                updateObj = {
                    selectedTab: value,
                };
            }
            this.props.changeTab(updateObj);
        }
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

    onKeyDown = (event)  => {
        if (event.ctrlKey && (event.keyCode === 49)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Variables'));
        } else if (event.ctrlKey && (event.keyCode === 50)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Coded Values'));
        } else if (event.ctrlKey && (event.keyCode === 51)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Codelists'));
        } else if (event.ctrlKey && (event.keyCode === 52)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Datasets'));
        } else if (event.ctrlKey && (event.keyCode === 53)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Documents'));
        } else if (event.ctrlKey && (event.keyCode === 54)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Standards'));
        } else if (event.ctrlKey && (event.keyCode === 9)) {
            // Change to the next tab
            let currentTab = this.props.tabs.currentTab;
            let tabCount = this.props.tabs.tabNames.length;
            if (currentTab + 1 < tabCount) {
                this.handleChange(undefined, currentTab + 1);
            } else {
                this.handleChange(undefined, 0);
            }
        }
    }

    render() {

        const { classes } = this.props;
        const { currentTab, tabNames } = this.props.tabs;

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
                            { tabNames.map( tab => {
                                return <Tab key={tab} label={tab} />;
                            })
                            }
                        </Tabs>
                    </AppBar>
                    <TabContainer>
                        <br/>
                        {tabNames[currentTab] === 'Standards' && <StandardTable/>}
                        {tabNames[currentTab] === 'Datasets' && <DatasetTable/>}
                        {tabNames[currentTab] === 'Variables' && <VariableTab/>}
                        {tabNames[currentTab] === 'Codelists' && <CodeListTable/>}
                        {tabNames[currentTab] === 'Coded Values' && this.generateCodeListTables()}
                        {tabNames[currentTab] === 'Documents' && <DocumentTab/>}
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
