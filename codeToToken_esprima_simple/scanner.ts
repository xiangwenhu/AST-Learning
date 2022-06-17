import { Token } from './token';
import { isDecimalDigit, isIdentifierPart, isIdentifierStart, isLineTerminator, isWhiteSpace } from './util';

// 原始的Token
export interface RawToken {
    type: Token;
    value: string | number;
    start: number;
    end: number;
}

// 关键字
const KEYWORDS = [
    'if', 'in', 'do',
    'var', 'for', 'new', 'try', 'let',
    'this', 'else', 'case', 'void', 'with', 'enum',
    'while', 'break', 'catch', 'throw', 'const', 'yield', 'class', 'super',
    'return', 'typeof', 'delete', 'switch', 'export', 'import',
    'default', 'finally', 'extends',
    'function', 'continue', 'debugger',
    'instanceof'
];

export class Scanner {
    // 源码
    readonly source: string;
    // 目前源码字符串的索引值
    index: number;
    // 源码的长度，结合index，来判断是否遍历结束
    private readonly length: number;

    constructor(code: string) {
        this.source = code;
        this.length = code.length;
        this.index = 0;
    }

    /**
     * 抛出Token异常
     */
    private throwUnexpectedToken() {
        throw new Error('Unexpected token ILLEGAL');
    }

    /**
     * 是否借宿
     * @returns 
     */
    public isEOF(): boolean {
        return this.index >= this.length;
    }

    /**
     * 是否是关键字
     * @param word 
     * @returns 
     */
    private isKeyword(word: string): boolean {
        return KEYWORDS.indexOf(word) > 0;
    }

    /**
     * 获取码点，未处理码元大于2的字符
     * @param i 
     * @returns 
     */
    private codePointAt(i: number): number {
        let cp = this.source.charCodeAt(i);
        return cp;
    }

    /**
     * 此处主要用于去除空格， 未处理备注
     * @returns
     */
    public scanComments() {
        let comments = [];
        let start = (this.index === 0);
        while (!this.isEOF()) {
            let ch = this.source.charCodeAt(this.index);
            // 空格
            if (isWhiteSpace(ch)) {
                ++this.index;
            } else if (isLineTerminator(ch)) { // 换行
                ++this.index;
                start = true;
            }else {
                break;
            }
        }

        return comments;
    }

    /**
     * 获得标志符
     * @returns
     */
    private getIdentifier(): string {
        const start = this.index++;
        while (!this.isEOF()) {
            const ch = this.source.charCodeAt(this.index);
            if (isIdentifierPart(ch)) {
                ++this.index;
            } else {
                break;
            }
        }

        return this.source.slice(start, this.index);
    }

    /**
     * 扫描标识符
     * https://tc39.github.io/ecma262/#sec-names-and-keywords
     * @returns 
     */
    private scanIdentifier(): RawToken {
        let type: Token;
        const start = this.index;

        const id = this.getIdentifier();
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (this.isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }

        return {
            type: type,
            value: id,
            start: start,
            end: this.index
        };
    }

    /**
     * 扫描符号
     * https://tc39.github.io/ecma262/#sec-punctuators
     * @returns 
     */
    private scanPunctuator(): RawToken {
        const start = this.index;

        let str = this.source[this.index];
        switch (str) {
            case '(':
            case '{':
            case '.':
            case '}':
            case '?':
            case ')':
            case ';':
            case ',':
            case '[':
            case ']':
            case ':':
            case '~':
                ++this.index;
                break;
            default:
                // 4-character punctuator.
                str = this.source.substring(this.index, 4);
                if (str === '>>>=') {
                    this.index += 4;
                } else {
                    // 3-character punctuators.
                    str = str.substring(0, 3);
                    if (str === '===' || str === '!==' || str === '>>>' ||
                        str === '<<=' || str === '>>=' || str === '**=') {
                        this.index += 3;
                    } else {
                        // 2-character punctuators.
                        str = str.substring(0, 2);
                        if (['&&', '||', '??', '==', '!=', '+=', '-=', '*=', '/=', '++',
                            '--', '<<', '>>', '&=', '|=', '^=', '%=', '<=', '>=', '=>', '**'].indexOf(str) >= 0) {
                            this.index += 2;
                        } else {
                            // 1-character punctuators.
                            str = this.source[this.index];
                            if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
                                ++this.index;
                            }
                        }
                    }
                }
        }
        return {
            type: Token.Punctuator,
            value: str,
            start: start,
            end: this.index
        };
    }

    /**
     * 扫描十进制字面量
     * @returns
     */
    private scanNumericLiteral(): RawToken {
        const start = this.index;
        let ch = this.source[start];
        if (!(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'))) {
            throw new Error('Numeric literal must start with a decimal digit or a decimal point')
        }

        let num = '';
        if (ch !== '.') {
            num = this.source[this.index++];
            ch = this.source[this.index];

            //如果下一位是数字，拼接
            while (isDecimalDigit(this.source.charCodeAt(this.index))) {
                num += this.source[this.index++];
            }
            // 读取最新字符
            ch = this.source[this.index];
        }

        // 点
        if (ch === '.') {
            num += this.source[this.index++];
            // 小数部分
            while (isDecimalDigit(this.source.charCodeAt(this.index))) {
                num += this.source[this.index++];
            }
            // 读取最新字符
            ch = this.source[this.index];
        }

        // 科学计数法
        if (ch === 'e' || ch === 'E') {
            num += this.source[this.index++];

            ch = this.source[this.index];
            if (ch === '+' || ch === '-') {
                num += this.source[this.index++];
            }
            // 位数部分值
            if (isDecimalDigit(this.source.charCodeAt(this.index))) {
                while (isDecimalDigit(this.source.charCodeAt(this.index))) {
                    num += this.source[this.index++];
                }
            } else {
                this.throwUnexpectedToken();
            }
        }

        if (isIdentifierStart(this.source.charCodeAt(this.index))) {
            this.throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(num),
            start: start,
            end: this.index
        };
    }

    /**
     * 扫描字符串字面量， 未处理转义字符
     *  https://tc39.github.io/ecma262/#sec-literals-string-literals
     * @returns 
     */
    private scanStringLiteral(): RawToken {
        const start = this.index;
        let quote = this.source[start];
        if (!(quote === '\'' || quote === '"')) {
            throw new Error('String literal must starts with a quote');
        }

        ++this.index;
        let str = '';

        while (!this.isEOF()) {
            let ch = this.source[this.index++];
            if (ch === quote) {
                quote = '';
                break;
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            this.index = start;
            this.throwUnexpectedToken();
        }

        return {
            type: Token.StringLiteral,
            value: str,
            start: start,
            end: this.index
        };
    }

    public lex(): RawToken {
        if (this.isEOF()) {
            return {
                type: Token.EOF,
                value: '',
                start: this.index,
                end: this.index
            };
        }

        const cp = this.source.charCodeAt(this.index);

        // 标志符
        if (isIdentifierStart(cp)) {
            return this.scanIdentifier();
        }

        // ((0x28)  )(0x29)  ;(0x3B)
        if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
            return this.scanPunctuator();
        }

        // 单引号双引号 '(0x27),"(0x22)
        if (cp === 0x27 || cp === 0x22) {
            return this.scanStringLiteral();
        }

        // .(0x2E)
        if (cp === 0x2E) {
            // 数字
            if (isDecimalDigit(this.source.charCodeAt(this.index + 1))) {
                return this.scanNumericLiteral();
            }
            // 符号
            return this.scanPunctuator();
        }

        // 数字
        if (isDecimalDigit(cp)) {
            return this.scanNumericLiteral();
        }

        // 码点在代理区
        // if (cp >= 0xD800 && cp < 0xDFFF) {
        //     if (isIdentifierStart(this.codePointAt(this.index))) {
        //         return this.scanIdentifier();
        //     }
        // }

        // 符号
        return this.scanPunctuator();
    }

}
