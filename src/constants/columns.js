const variables = {
    oid: {
        isKey    : true,
        text     : '',
        width    : '48px',
        editable : false,
        hidden   : false,
        tdStyle  : { padding: '0px' },
    },
    keyOrder: {
        text    : 'Key, Position',
        width   : '110px',
        hidden  : true,
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' }
    },
    nameLabelWhereClause: {
        text    : 'Name, Label, Where Clause',
        width   : '300px',
        hidden  : false,
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' }
    },
    dataType: {
        text    : 'Type',
        width   : '100px',
        hidden  : false,
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' }
    },
    lengthAttrs: {
        text    : 'Length',
        width   : '110px',
        hidden  : false,
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' }
    },
    roleMandatory: {
        text    : 'Role, Mandatory',
        width   : '110px',
        hidden  : false,
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' }
    },
    codeListFormatAttrs: {
        text    : 'Codelist, Display Format',
        width   : '130px',
        hidden  : false,
        tdStyle : { whiteSpace: 'normal', overFlowWrap: 'break-word', wordBreak: 'break-word' },
        thStyle : { whiteSpace: 'normal' }
    },
    description: {
        text    : 'Description',
        width   : '100%',
        hidden  : false,
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' },
    },
};

const codeLists = {
    oid: {
        isKey    : true,
        text     : '',
        width    : '48px',
        editable : false,
        hidden   : false,
        tdStyle  : { padding: '0px' },
    },
    name: {
        text    : 'Name',
        width   : '20%',
        hidden  : false,
        tdStyle : {whiteSpace: 'normal'},
        thStyle : {whiteSpace: 'normal'}
    },
    codeListType: {
        text    : 'Type',
        hidden  : false,
        width   : '130px',
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' },
    },
    dataType: {
        text    : 'Data Type',
        hidden  : false,
        width   : '140px',
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' },
    },
    formatName: {
        text    : 'Format Name',
        hidden  : false,
        width   : '140px',
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' },
    },
    linkedCodeList: {
        text    : 'Linked Codelist',
        width   : '20%',
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' },
    },
    standardData: {
        text    : 'Standard',
        hidden  : false,
        width   : '20%',
        tdStyle : { whiteSpace: 'normal' },
        thStyle : { whiteSpace: 'normal' }
    },
};

const columns = {
    variables,
    codeLists,
};

export default columns;
