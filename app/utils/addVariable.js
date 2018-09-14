import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import AddVariableSimple from 'utils/addVariableSimple.js';
import AddVariableFromDefine from 'utils/addVariableFromDefine.js';
import AddVariableFromOtherStudy from 'utils/addVariableFromOtherStudy.js';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 1,
        paddingRight  : theme.spacing.unit * 1,
        paddingTop    : theme.spacing.unit * 1,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        borderColor   : 'primary',
        top           : '10%',
        transform     : 'translate(0%, calc(-10%+0.5px))',
        overflowX     : 'auto',
        maxHeight     : '80%',
        width         : '90%',
        overflowY     : 'auto',
    },
    appBar: {
        transform     : 'translate(0%, calc(-20%+0.5px))',
    },
    title: {
        marginTop: theme.spacing.unit * 5,
        paddingBottom : 0,
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        model         : state.present.odm.study.metaDataVersion.model,
        defineVersion : state.present.odm.study.metaDataVersion.defineVersion,
    };
};

const tabNames = ['New Variable', 'This Define', 'Another Define'];

function TabContainer(props) {
    return (
        <Typography component="div">
            {props.children}
        </Typography>
    );
}

class AddVariableConnected extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            currentTab : 1,
        };
    }

    handleTabChange = (event, currentTab) => {
        this.setState({ currentTab });
    }

    render() {
        const { classes } = this.props;
        const { currentTab } = this.state;

        return (
            <React.Fragment>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open
                    PaperProps={{className: classes.dialog}}
                >
                    <DialogTitle className={classes.title}>
                        <Grid container spacing={0} justify='space-between' alignItems='center'>
                            <Grid item>
                                Add Variable
                            </Grid>
                            <Grid item>
                                <IconButton
                                    color="secondary"
                                    onClick={this.props.onClose}
                                >
                                    <ClearIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </DialogTitle>
                    <DialogContent>
                        <AppBar position='absolute' color='default'>
                            <Tabs
                                value={currentTab}
                                onChange={this.handleTabChange}
                                fullWidth
                                centered
                                indicatorColor='primary'
                                textColor='primary'
                            >
                                { tabNames.map( tab => {
                                    return <Tab key={tab} label={tab} />;
                                })
                                }
                            </Tabs>
                        </AppBar>
                        <TabContainer>
                            <br/>
                            {tabNames[currentTab] === 'New Variable' && (
                                <AddVariableSimple
                                    itemGroupOid={this.props.itemGroupOid}
                                    position={this.props.position}
                                    onClose={this.props.onClose}
                                />
                            )}
                            {tabNames[currentTab] === 'This Define' &&
                                    <AddVariableFromDefine
                                        itemGroupOid={this.props.itemGroupOid}
                                        position={this.props.position}
                                        onClose={this.props.onClose}
                                    />
                            }
                            {tabNames[currentTab] === 'Another Define' &&
                                    <AddVariableFromOtherStudy
                                        itemGroupOid={this.props.itemGroupOid}
                                        position={this.props.position}
                                        onClose={this.props.onClose}
                                    />
                            }
                        </TabContainer>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

AddVariableConnected.propTypes = {
    classes       : PropTypes.object.isRequired,
    model         : PropTypes.string.isRequired,
    itemGroupOid  : PropTypes.string.isRequired,
    defineVersion : PropTypes.string.isRequired,
    position      : PropTypes.number,
    onClose       : PropTypes.func.isRequired,
};

const AddVariable = connect(mapStateToProps)(AddVariableConnected);
export default withStyles(styles)(AddVariable);

