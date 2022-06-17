

/**
 * Tokens 转为 AST
 * @param {Array} tokens 
 * 标准：https://github.com/estree/estree/blob/master/es5.md
 * 在线转换：https://esprima.org/demo/parse.html
 * 
 */


// 二元操作符 
// https://github.com/estree/estree/blob/master/es5.md#binaryoperator
const BINARY_OPERATOR = [
    "==", "!=", "===", "!=="
    , "<", "<=", ">", ">="
    , "<<", ">>", ">>>"
    , "+", "-", "*", "/", "%"
    , "|", "^", "&", "in"
    , "instanceof"
]

// 赋值表达式
// https://github.com/estree/estree/blob/master/es5.md#assignmentoperator
const ASSIGNMENT_OPERATOR = [
    "=", "+=", "-=", "*=", "/=", "%="
    , "<<=", ">>=", ">>>="
    , "|=", "^=", "&="
]


function parse(tokens) {
    let index = 0;

    function walk() {
        const token = tokens[index];
        const nextToken = tokens[index + 1];

        // 标志符
        // https://github.com/estree/estree/blob/master/es5.md#identifier
        {
            if (token.type === 'Identifier') {
                index++;
                return {
                    type: "Identifier",
                    value: token.value
                }
            }
        }

        // 字面量
        // https://github.com/estree/estree/blob/master/es5.md#literal
        {

            if (token.type === 'Boolean') {
                index++;
                return {
                    type: "Literal",
                    value: !!token.value,
                    raw: token.value
                }
            }
            if (token.type === 'Null') {
                index++;
                return {
                    type: "Literal",
                    value: null,
                    raw: token.value
                }
            }
            if (token.type === 'Numeric') {
                index++;
                return {
                    type: "Literal",
                    value: Number(token.value),
                    raw: token.value
                }
            }
            if (token.type === 'String') {
                index++;
                return {
                    type: "Literal",
                    value: token.value,
                    raw: token.value
                }
            }
        }


        // 符号
        {
            if (token.type === 'Punctuator') {
                index++;
                // 加减乘除二元表达式
                // https://github.com/estree/estree/blob/master/es5.md#binaryexpression
                if (BINARY_OPERATOR.indexOf(token.value) >= 0) {
                    return {
                        type: 'BinaryExpression',
                        operator: token.value,
                        left: undefined,
                        right: undefined
                    }
                }

                // 赋值表达式 
                // https://github.com/estree/estree/blob/master/es5.md#assignmentexpression
                if (ASSIGNMENT_OPERATOR.indexOf(token.value) >= 0) {
                    return {
                        type: 'BinaryExpression',
                        operator: token.value,
                        left: undefined,
                        right: undefined
                    }
                }
            }
        }

        // 关键字
        {
            if (token.type === 'Keyword') {

            }
        }
        throw new TypeError("未知的Token类型:" + token.type);
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