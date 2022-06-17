import { Scanner} from './scanner';
import {  TokenName } from './token';

interface BufferEntry {
    type: string;
    value: string;
}

export class Tokenizer {
    scanner: Scanner;
    readonly buffer: BufferEntry[];

    constructor(code: string) {
        this.scanner = new Scanner(code);
        this.buffer = [];
    }

    getNextToken() {
        if (this.buffer.length === 0) {
            // 扫描空白字符
            this.scanner.scanComments();
            // 未结束，循环遍历
            if (!this.scanner.isEOF()) {
                // 读取Token
                let token = this.scanner.lex();
                // 重新取值
                const entry: BufferEntry = {
                    type: TokenName[token.type],
                    value: this.scanner.source.slice(token.start, token.end)
                };
                // 入buffer，其为一边读，一遍输出
                this.buffer.push(entry);
            }
        }

        return this.buffer.shift();
    }

}
