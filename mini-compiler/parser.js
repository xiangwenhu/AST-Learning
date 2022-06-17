

function parse(tokens) {
    let index = 0;

    function walk() {
        const token = tokens[index];
        const nextToken = tokens[index + 1];

        if(token.type === 'Identifier'){
            
        }

    }

}


const tokens = [
    { type: 'Keyword', value: 'var' },
    { type: 'Identifier', value: 'num1' },
    { type: 'Punctuator', value: '=' },
    { type: 'Numeric', value: '1' },
    { type: 'Punctuator', value: '+' },
    { type: 'Numeric', value: '2' },
    { type: 'Punctuator', value: ';' }
];

const ast = parse(tokens);
console.log("ast:", ast);