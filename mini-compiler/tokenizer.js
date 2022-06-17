
// 四位符号
const PUNCTUATOR_FOUR = ['>>>='];
// 三位符号
const PUNCTUATOR_THREE = ['===', '!==', '>>>', '<<=', '>>=', '**='];
// 两位符号
const PUNCTUATOR_TWO = ['===', '!==', '>>>', '<<=', '>>=', '**='];
// 一位符号
const PUNCTUATOR_ONE = '({.}?);,[]:~<>=!+-*%&|^/';

// 正则 空白
const REG_WHITESPACE = /\s/;
const REG_LETTERS = /[a-zA-Z]/;

// 关键字
const KEYWORDS = [
    'if', 'in', 'do',
    'var', 'for', 'new', 'try',
    'this', 'else', 'case', 'void', 'with',
    'while', 'break', 'catch', 'throw',
    'return', 'typeof', 'delete', 'switch',
    'finally',
    'function', 'continue', 'debugger',
    'instanceof'
];

// 换行
function isLineTerminator(cp) {
    // \n(0x0A) \r(0x0D)  行分隔符 (0x2028) 和段落分隔符 (0x2029)
    return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029);
}

/**
 * 标志符的开始， 未完善版本（中文等）
 * @param cp
 * @returns
 */
function isIdentifierStart(cp) {
    return (cp === 0x24) || (cp === 0x5F) ||  // $ (dollar) and _ (underscore)
        (cp >= 0x41 && cp <= 0x5A) ||         // A..Z
        (cp >= 0x61 && cp <= 0x7A) ||         // a..z
        (cp === 0x5C)                      // \ (backslash)
}

/**
 * 标志符部分，未完善版本（中文等）
 * @param cp 
 * @returns 
 */
function isIdentifierPart(cp) {
    return (cp === 0x24) || (cp === 0x5F) ||  // $ (dollar) and _ (underscore)
        (cp >= 0x41 && cp <= 0x5A) ||         // A..Z
        (cp >= 0x61 && cp <= 0x7A) ||         // a..z
        (cp >= 0x30 && cp <= 0x39) ||         // 0..9
        (cp === 0x5C)                   // \ (backslash)
}

/**
 * code 转为 Token
 * supported type: Boolean Identifier Keyword Null Numeric Punctuator String
 * not supported type: RegularExpression Template
 * @param {String} code 源码
 */
function tokenizer(code) {
    // 索引
    let index = 0;
    // Token数组
    const tokens = [];

    while (index < code.length) {
        // 当前字符
        var ch = code[index];

        // 处理符号, 未处理ES6+的 ?? ?. ...等
        {
            let pun;
            if (PUNCTUATOR_ONE.indexOf(ch) >= 0) {
                tokens.push({
                    type: 'Punctuator',
                    value: ch
                });
                index++;
                continue;
            }
            pun = code.slice(index, 4);
            if (PUNCTUATOR_FOUR.indexOf(pun) >= 0) {
                tokens.push({
                    type: 'Punctuator',
                    value: pun
                });
                index += 4;
                continue;
            }
            pun = code.slice(index, 3);
            if (PUNCTUATOR_THREE.indexOf(pun) >= 0) {
                tokens.push({
                    type: 'Punctuator',
                    value: ch
                });
                index += 3;
                continue;
            }
            pun = code.slice(index, 2);
            if (PUNCTUATOR_TWO.indexOf(ch) >= 0) {
                tokens.push({
                    type: 'Punctuator',
                    value: pun
                });
                index += 2;
                continue;
            }
        }

        // 空格换行等等
        {
            if (REG_WHITESPACE.test(ch)) {
                index++
                continue
            }
        }

        // 数字
        {
            // 大于0，小于9
            if (ch >= '0' && ch <= '9') {
                let numStr = '';
                do {
                    numStr += ch;
                    ch = index[++index];
                } while (ch >= '0' && ch <= '9' && index < code.length)

                tokens.push({
                    type: 'Numeric',
                    value: numStr
                })
                continue;
            }
        }

        // Identifier
        {
            let charCode = ch.charCodeAt(0);
            if (isIdentifierPart(charCode)) {
                let str = '';
                let type;
                do {
                    str += ch;
                    ch = code[++index];
                } while (isIdentifierPart(ch.charCodeAt(0)) && index < code.length);


                if (str.length === 1) {
                    type = 'Identifier';
                } else if (KEYWORDS.indexOf(str) >= 0) {
                    type = 'Keyword';
                } else if (str === 'null') {
                    type = 'Null';
                } else if (str === 'true' || str === 'false') {
                    type = 'Boolean';
                } else {
                    type = 'Identifier';
                }
                tokens.push({
                    type,
                    value: str,
                })
                continue;
            }
        }

        // String
        {
            if (ch === '\'' || ch === '\"') {
                let quote = code[index];
                ++index;
                let str = '';

                while (index < code.length) {
                    ch = code[index++];
                    if (ch === quote) {
                        quote = '';
                        break;
                    } else if (isLineTerminator(ch.charCodeAt(0))) {
                        break;
                    } else {
                        str += ch;
                    }
                }

                tokens.push({
                    type: "String",
                    value: str,
                })
                continue;
            }
        }

        throw new TypeError('Unexpected token ILLEGAL: ' + ch)
    }

    return tokens;
}

const tokens = tokenizer(`
    var num1 = 1 + 2; 
    var str = 'hello world';
    var bValue = false;
    var nullValue = null;
    function a(){
        console.log(1)
    }
`);
console.log("tokens:", tokens);