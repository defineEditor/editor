function getColumnHiddenStatus (prevColumns, nextColumns, showRowSelect) {
    let columns = { ...prevColumns };
    // Handle switch between selection/no selection
    if (showRowSelect !== prevColumns.oid.hidden) {
        columns = { ...columns, oid: { ...columns.oid, hidden: showRowSelect } };
    }
    // Load hidden/show property from the store
    Object.keys(nextColumns).forEach(columnName => {
        let columnSettings = nextColumns[columnName];
        // Skip this step for the oid column as its view is controlled by showRowSelect
        if ( columns.hasOwnProperty(columnName) && columnSettings.hidden !== columns[columnName].hidden && columnName !== 'oid') {
            columns = { ...columns, [columnName]: { ...columns[columnName], hidden: columnSettings.hidden } };
        }
    });
    return columns;
}

export default getColumnHiddenStatus;
