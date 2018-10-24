function checkForSpecialChars(value, regex = new RegExp(/[^\u0020-\u007f]/,'g'), prefix = 'Special character') {
    let issues = [];
    let issueText;
    let result;
    while ((result = regex.exec(value)) !== null) {
        // For non-printable control characters show ASCII code instead
        if (result[0].charCodeAt(0) < 32) {
            let asciiLabel;
            if (result[0].charCodeAt(0) === 10) {
                asciiLabel = '\\n (line feed)';
            } else if (result[0].charCodeAt(0) === 13) {
                asciiLabel = '\\r (carriage return)';
            } else if (result[0].charCodeAt(0) === 9) {
                asciiLabel = '\\t (horizontal tab)';
            } else {
                asciiLabel = 'with ASCII code ' + result[0].charCodeAt(0).toString();
            }
            issueText = `${prefix} ${asciiLabel} found at position ${result.index}`;
        } else {
            issueText = `${prefix} ${result[0]} found at position ${result.index}`;
        }
        if (result.index > 0) {
            let prevString = value.slice(0,result.index).replace(/\s/g,' ');
            let previousWord = /^.*?\s?(\S+)\s*$/.exec(prevString);
            if (previousWord !== null && previousWord.length > 1) {
                issueText = issueText + ` after word "${previousWord[1]}"`;
            }
        }
        issueText = issueText + '.';
        issues.push(issueText);
    }

    return issues;
}

export default checkForSpecialChars;
