

let codeFragments = [];

/**
 * AST 转为代码
 * @param {*} ast 
 * @returns 
 */
function generate(ast) {
    let code = "";

    function traverseArray(array, parent) {
        return array.map(node => traverseNode(node, parent));
    }

    // 遍历节点
    function traverseNode(node, parent) {
        let tmpCode = ""

        switch (node.type) {
            // 根节点
            // https://github.com/estree/estree/blob/master/es5.md#programs
            case 'Program':
                return traverseArray(node.body, node)

            // 变量声明  例：var a = 1, b = 2;
            // https://github.com/estree/estree/blob/master/es5.md#variabledeclaration
            case 'VariableDeclaration':
                return node.kind + traverseArray(node.declarations, node) + ';'

            // 变量声明程序 例：var a = 1, b = 2; 是两个VariableDeclarator
            // https://github.com/estree/estree/blob/master/es5.md#variabledeclarator
            case 'VariableDeclarator':
                tmpCode = ' ' + traverseNode(node.id);
                // 初始值
                if (node.init) {
                    tmpCode += '=' + traverseNode(node.init, node);
                }
                return tmpCode

            // 函数申明  例如：function log(num){console.log(num)}
            //https://github.com/estree/estree/blob/master/es5.md#functiondeclaration
            case 'FunctionDeclaration':
                // function log(num){console.log(num)}
                return `function ${traverseNode(node.id)} (${traverseArray(node.params)})${traverseNode(node.body)}`;

            // 二元表表达式, 例如：  1 + 2
            // https://github.com/estree/estree/blob/master/es5.md#binaryexpression
            case 'BinaryExpression':
                return traverseNode(node.left) + node.operator + traverseNode(node.right)

            // 调用表达式 console.log
            // https://github.com/estree/estree/blob/master/es5.md#callexpression
            case 'CallExpression':
                // console.log(1)            
                return `${traverseNode(node.callee)}(${traverseArray(node.arguments).join(',')})`;

            // 表达式语句 赋值表达式，函数调用表达式等等 ，例如 console.log(num)
            // https://github.com/estree/estree/blob/master/es5.md#expressionstatement
            case 'ExpressionStatement':
                return traverseNode(node.expression, node)

            // 赋值表达式 例如：a=1
            // https://github.com/estree/estree/blob/master/es5.md#assignmentexpression
            case 'AssignmentExpression':
                return traverseNode(node.left) + '=' + traverseNode(node.right) + ';';

            // 成员表达式 例如：console.log
            // https://github.com/estree/estree/blob/master/es5.md#memberexpression
            case 'MemberExpression':
                // console.log
                return `${traverseNode(node.object)}.${traverseNode(node.property)}`

            // 语句块  例如：{}
            //https://github.com/estree/estree/blob/master/es5.md#blockstatement
            case 'BlockStatement':
                return '{\r\n' + traverseArray(node.body, node) + '\r\n}';

            // 标志符
            // https://github.com/estree/estree/blob/master/es5.md#identifier
            case 'Identifier':
                return node.name;
            // 字面量 
            // https://github.com/estree/estree/blob/master/es5.md#literal
            case 'Literal':
                return node.raw;

            // 同样，如果不能识别当前的结点，那么就抛出一个错误。
            default:
                console.error("TypeError:", node.type, node);
                throw new TypeError(node.type)
        }
    }
    // 最后我们对 AST 调用 traverseNode，开始遍历。注意 AST 并没有父结点。
    code = traverseNode(ast, null)

    return code;
};

const ast = {
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "num1"
                    },
                    "init": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "Literal",
                            "value": 1,
                            "raw": "1"
                        },
                        "right": {
                            "type": "Literal",
                            "value": false,
                            "raw": "false"
                        }
                    }
                }
            ],
            "kind": "var"
        },
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "Identifier",
                    "name": "num1"
                },
                "right": {
                    "type": "Literal",
                    "value": "strNum1",
                    "raw": "'strNum1'"
                }
            }
        },
        {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": "log"
            },
            "params": [
                {
                    "type": "Identifier",
                    "name": "num"
                }
            ],
            "body": {
                "type": "BlockStatement",
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "Identifier",
                                    "name": "console"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "log"
                                }
                            },
                            "arguments": [
                                {
                                    "type": "Identifier",
                                    "name": "num"
                                }
                            ]
                        }
                    }
                ]
            },
            "generator": false,
            "expression": false,
            "async": false
        },
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": "log"
                },
                "arguments": [
                    {
                        "type": "Identifier",
                        "name": "num1"
                    }
                ]
            }
        }
    ],
    "sourceType": "script"
};


const code = generate(ast);
console.log("code:")
const codeStr = code.join("\r\n");
console.log(codeStr)
console.log("")
console.log("result:", new Function(codeStr)())

