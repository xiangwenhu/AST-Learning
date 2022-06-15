import { Tokenizer } from "./index"

export function tokenize(code: string, options, delegate) {
    const tokenizer = new Tokenizer(code, options);
    const tokens: any = [];
    try {
        while (true) {
            let token = tokenizer.getNextToken();
            if (!token) {
                break;
            }
            if (delegate) {
                token = delegate(token);
            }
            tokens.push(token);
        }
    } catch (e) {
        tokenizer.errorHandler.tolerate(e);
    }

    if (tokenizer.errorHandler.tolerant) {
        tokens.errors = tokenizer.errors();
    }
    return tokens;
}

const code = `
    var num1 = 10, prefix = "结果";
    function double(num){
        return num*2
    }
    console.log(prefix, double(num1));
`;
const tokens = tokenize(code, {}, undefined);
console.log("tokens:", tokens);
