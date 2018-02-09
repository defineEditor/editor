import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel } from 'material-ui/Input';
import ItemSelect from './itemSelect.js';
import DeleteIcon from 'material-ui-icons/Delete';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { FormControlLabel, FormControl } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import TextField from 'material-ui/TextField';

const styles = theme => ({
    container: {
        display  : 'flex',
        flexWrap : 'wrap',
    },
    formControl: {
        margin   : 'normal',
        minWidth : 120,
    },
    select: {
        marginTop: theme.spacing.unit * 2,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
});

class PdfPageRef extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = Object.assign(this.props.value, {
            pageRangeFlag: (this.props.value.pageRefs !== undefined ? 'disable' : '')
        });
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    }

    getPageInputs = (type,classes) => {
		let result = [];
        if (type === 'PhysicalRef') {
            result.push(
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.state.pageRangeFlag}
                      onChange={(event, checked) => this.setState({ pageRangeFlag: checked })}
                    />
                  }
                  label="Range"
                />
            );
            if (!this.state.pageRangeFlag) {
                result.push(
                    <FormControl className={classes.formControl}>
                        <TextField
                          label="Pages (comma separated)"
                          className={classes.textField}
                          value={this.state.pageRefs}
                          onChange={this.handleChange}
                          margin="normal"
                        />
                    </FormControl>
                );
            } else {
                result.push(
                    <div>
                        <FormControl key='first' className={classes.formControl}>
                            <InputLabel htmlFor="pageRefsFirst">First Page</InputLabel>
                            <Input id="pageRefsFirst" value={this.state.pageRefs} onChange={this.handleChange} />
                        </FormControl>
                        <FormControl key='last' className={classes.formControl}>
                            <InputLabel htmlFor="pageRefsLast">Last Page</InputLabel>
                            <Input id="pageRefsLast" value={this.state.pageRefs} onChange={this.handleChange} />
                        </FormControl>
                    </div>
                );
            }
        } else if (type === 'NamedDestination') {
                result.push(
                    <FormControl className={classes.formControl}>
                        <TextField
                          label="Destination Anchor"
                          className={classes.textField}
                          value={this.state.pageRefs}
                          onChange={this.handleChange}
                          margin="normal"
                        />
                    </FormControl>
                );
        }
		return result;
    }

    render() {
        const { classes } = this.props;
        const value = this.state.type || 'PhysicalRef';

        return (
                <Grid container>
                    <Grid item>
                        <Button
                            mini
                            color='default'
                            onClick={this.props.handleChange('deletePdfPageRef',this.props.documentId,this.props.pdfPageRefId)}
                            variant='fab'
                            style={{margin: '5pt'}}
                        >
                            <DeleteIcon />
                        </Button>
                    </Grid>
                    <Grid item>
                        <ItemSelect
                            options={[{'PhysicalRef': 'Physical Reference'},{'NamedDestination': 'Named Destination'}]}
                            value={value}
                            handleChange={this.handleChange('type')}
                            label='Reference Type'
                        />
                    </Grid>
                    {<Grid item>{this.getPageInputs(value, classes)}</Grid>}
                </Grid>
        );
    }
}

PdfPageRef.propTypes = {
    classes : PropTypes.object.isRequired,
    value   : PropTypes.object.isRequired,
};

export default withStyles(styles)(PdfPageRef);

