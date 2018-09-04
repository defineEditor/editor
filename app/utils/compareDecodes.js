function compareDecodes(decodes1, decodes2) {
    if (decodes1.length !== decodes2.length) {
        return false;
    } else {
        return !decodes1.some( (decode1, index) => {
            let decode2 = decodes2[index];
            return ( Object.keys(decode1).some( prop => (decode1[prop] !== decode2[prop])) );
        });
    }
}

export default compareDecodes;
