

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

                if(token.value === ";"){
                    index++;
                    return;
                }

                // 加减乘除二元表达式
                // https://github.com/estree/estree/blob/master/es5.md#binaryexpression
                if (BINARY_OPERATOR.indexOf(token.value) >= 0) {
                    index--;
                    // 取左边的值
                    const left = walk();
                    index++;
                    // 取右边的值
                    const right = walk();

                    index++;
                    return {
                        type: 'BinaryExpression',
                        operator: token.value,
                        left: left,
                        right: right
                    }
                }

                // 赋值表达式 
                // https://github.com/estree/estree/blob/master/es5.md#assignmentexpression
                if (ASSIGNMENT_OPERATOR.indexOf(token.value) >= 0) {
                    index++;

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
                // 变量声明  VariableDeclaration, 不支持多个，例如 var num1, num2 = 2;
                // https://github.com/estree/estree/blob/master/es5.md#variabledeclaration
                // var num1 = 1 + 2;
                // var num1;
                if (token.value === 'var') {
                    index++;
                    // 下一个是类型Identifier，即变量名num1, 例： var num1 = 1 + 2;
                    const varNameNode = walk();
                    // 获取下一个节点 ；例： var num1 = 1 + 2; var num1; 
                    const punNode =  index < tokens.length ? walk(): null;

                    let initNode;

                    // =号，直接取下一个
                    if (punNode && punNode.operator === "=") {
                        initNode = walk();
                        // 下一个是符号
                        if (tokens[index].type === 'Punctuator') {
                            initNode = walk();
                        }

                    } else {
                        // 只是定义变量 var num1;
                        initNode = null
                    }

                    const declaration = {
                        "type": "VariableDeclarator",
                        "id": {
                            "type": "Identifier",
                            "name": varNameNode.value
                        },
                        "init": initNode
                    }

                    return {
                        type: "VariableDeclaration",
                        // 不支持多个声明
                        declarations: [declaration],
                        kind: token.value,
                    }

                }

            }
        }
        throw new TypeError("未知的Token类型:" + token.type);
    }

    // Programs 根节点
    // https://github.com/estree/estree/blob/master/es5.md#programs
    // https://esprima.org/demo/parse.html
    const ast = {
        type: 'Program',
        body: [],
        sourceType: "script"
    };

    // 遍历
    while (index < tokens.length) {
        const node = walk();
        ast.body.push(node);
    }

    return ast;
}


const tokens = [
    { type: 'Keyword', value: 'var' },
    { type: 'Identifier', value: 'num1' },
    {
        "type": "Punctuator",
        "value": ";"
    },
    {
        "type": "Keyword",
        "value": "var"
    },
    {
        "type": "Identifier",
        "value": "num1"
    },
    {
        "type": "Punctuator",
        "value": "="
    },
    {
        "type": "Identifier",
        "value": "n1"
    },
    {
        "type": "Punctuator",
        "value": "+"
    },
    {
        "type": "Numeric",
        "value": "2"
    },
    {
        "type": "Punctuator",
        "value": ";"
    }
];

const ast = parse(tokens);
console.log("ast:", JSON.stringify(ast,undefined, "\t"));