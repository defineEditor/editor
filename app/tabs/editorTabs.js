import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import StandardTable from 'tabs/standardTab.js';
import DatasetTable from 'tabs/datasetTab.js';
import CodeListTable from 'tabs/codeListTab.js';
import GroupTab from 'tabs/groupTab.js';
import DocumentTab from 'tabs/documentTab.js';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { changeTab, toggleMainMenu } from 'actions/index.js';

const styles = theme => ({
    root: {
        flexGrow        : 1,
        marginTop       : theme.spacing.unit * 3,
        backgroundColor : theme.palette.background.paper,
    },
    menuToggle: {
        marginTop : '-23px',
        position  : 'fixed',
        zIndex    : '9000',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        toggleMainMenu : () => dispatch(toggleMainMenu()),
        changeTab      : (updateObj) => dispatch(changeTab(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        tabs: state.present.ui.tabs,
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

class ConnectedEditorTabs extends React.Component {

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    componentDidCatch(error, info) {
        console.log(error, info);
    }

    handleChange = (event, value) => {
        if (value !== this.props.currentTab) {
            let updateObj = {
                selectedTab           : value,
                currentScrollPosition : window.scrollY,
            };
            this.props.changeTab(updateObj);
        }
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
            <div className={classes.root}>
                <div className='doNotPrint'>
                    <IconButton
                        color='default'
                        onClick={this.props.toggleMainMenu}
                        className={classes.menuToggle}
                    >
                        <MenuIcon/>
                    </IconButton>
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
                </div>
                <TabContainer>
                    <br/>
                    {tabNames[currentTab] === 'Standards' && <StandardTable/>}
                    {tabNames[currentTab] === 'Datasets' && <DatasetTable/>}
                    {tabNames[currentTab] === 'Variables' && <GroupTab groupClass='Variables'/>}
                    {tabNames[currentTab] === 'Codelists' && <CodeListTable/>}
                    {tabNames[currentTab] === 'Coded Values' && <GroupTab groupClass='Coded Values'/>}
                    {tabNames[currentTab] === 'Documents' && <DocumentTab/>}
                </TabContainer>
            </div>
        );
    }
}

ConnectedEditorTabs.propTypes = {
    classes        : PropTypes.object.isRequired,
    tabs           : PropTypes.object.isRequired,
    toggleMainMenu : PropTypes.func.isRequired,
    changeTab      : PropTypes.func.isRequired,
};

const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditorTabs);
export default withStyles(styles)(EditorTabs);
