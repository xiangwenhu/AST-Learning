
/**
 * 遍历AST， 深度遍历
 * @param {*} ast 
 * @param {*} visitor 
 */
function traverse(ast, visitor) {

    // 遍历数组节点，调用 traverseNode
    function traverseArray(array, parent) {
        if (typeof array.forEach === 'function')
            array.forEach(function (child) {
                traverseNode(child, parent);
            });
    }

    // 遍历节点
    function traverseNode(node, parent) {

        // 检查是不是定义处理函数
        var handler = visitor[node.type]
        if (handler) {
            handler(node, parent)
        }

        switch (node.type) {
            // 根节点
            // https://github.com/estree/estree/blob/master/es5.md#programs
            case 'Program':
                traverseArray(node.body, node)
                break

            // 变量声明  例：var a = 1, b = 2;
            // https://github.com/estree/estree/blob/master/es5.md#variabledeclaration
            case 'VariableDeclaration':
                traverseArray(node.declarations, node);
                break;

            // 变量声明程序 例：var a = 1, b = 2; 是两个VariableDeclarator
            // https://github.com/estree/estree/blob/master/es5.md#variabledeclarator
            case 'VariableDeclarator':
                traverseNode(node.id, node);
                // 初始值
                if (node.init) {
                    traverseNode(node.init, node);
                }
                break;

            // 函数申明  例如：function log(num){console.log(num)}
            //https://github.com/estree/estree/blob/master/es5.md#functiondeclaration
            case 'FunctionDeclaration':
                traverseNode(node.id, node);
                // 参数
                if (node.params && node.params.length > 0) {
                    traverseArray(node.params, node);
                }
                traverseNode(node.body, node)
                break;

            // 二元表表达式, 例如：  1 + 2
            // https://github.com/estree/estree/blob/master/es5.md#binaryexpression
            case 'BinaryExpression':
                if (node.left) {
                    traverseNode(node.left, node)
                }
                if (node.right) {
                    traverseNode(node.right, node)
                }
                break;

            // 调用表达式 console.log
            // https://github.com/estree/estree/blob/master/es5.md#callexpression
            case 'CallExpression':
                traverseNode(node.callee, node);
                if (node.arguments && node.arguments.length > 0) {
                    traverseArray(node.arguments, node)
                }
                break;

            // 表达式语句 赋值表达式，函数调用表达式等等 ，例如 console.log(num)
            // https://github.com/estree/estree/blob/master/es5.md#expressionstatement
            case 'ExpressionStatement':
                traverseNode(node.expression, node)
                break;

            // 赋值表达式 例如：a=1
            // https://github.com/estree/estree/blob/master/es5.md#assignmentexpression
            case 'AssignmentExpression':
                if (node.left) {
                    traverseNode(node.left, node)
                }
                if (node.right) {
                    traverseNode(node.right, node)
                }
                break;

            // 成员表达式 例如：console.log
            // https://github.com/estree/estree/blob/master/es5.md#memberexpression
            case 'MemberExpression':
                traverseNode(node.object, node)
                traverseNode(node.property, node)
                break;

            // 语句块  例如：{}
            //https://github.com/estree/estree/blob/master/es5.md#blockstatement
            case 'BlockStatement':
                traverseArray(node.body, node);
                break;

            // 标志符
            // https://github.com/estree/estree/blob/master/es5.md#identifier
            case 'Identifier':
                break;
            // 字面量 
            // https://github.com/estree/estree/blob/master/es5.md#literal
            case 'Literal':
                break;

            // 同样，如果不能识别当前的结点，那么就抛出一个错误。
            default:
                console.error("TypeError:", node.type, node);
                throw new TypeError(node.type)
        }
    }
    // 最后我们对 AST 调用 traverseNode，开始遍历。注意 AST 并没有父结点。
    traverseNode(ast, null)
}


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
}

// const visitor = {
// Literal(node, parent) {
//     console.log("Literal", node);
// },
// Identifier(node, parent) {
//     console.log("Identifier", node);
// },
// VariableDeclaration(node, parent) {
//     console.log("VariableDeclaration", node);
// },
// VariableDeclarator(node, parent) {
//     console.log("VariableDeclarator", node);
// },
// BinaryExpression(node, parent) {
//     console.log("BinaryExpression", node);
// },
// Program(node, parent) {
//     console.log("Program", node);
// },
// AssignmentExpression(node, parent) {
//     console.log("AssignmentExpression", node);
// },
// FunctionDeclaration(node, parent) {
//     console.log("FunctionDeclaration", node);
// },
// BlockStatement(node, parent) {
//     console.log("BlockStatement", node);
// },
// ExpressionStatement(node, parent) {
//     console.log("ExpressionStatement", node);
// },
// CallExpression(node, parent) {
//     console.log("CallExpression", node);
// },
// MemberExpression(node, parent) {
//     console.log("CallExpression", node);
// }
// };

const visitor = {
    CallExpression(node, parent) {
        // console.log to console.error

        if (node.callee && node.callee.type === 'MemberExpression') {
            if (node.callee.object.name === 'console' && node.callee.property.name === "log") {
                node.callee.property.name = "error"
            }
        }

    }
}

    ; (function () {
        try {
            traverse(ast, visitor);
            console.log("ast:after", JSON.stringify(ast))
        } catch (err) {
            console.error("traverser error:", err);
        }
    })();

