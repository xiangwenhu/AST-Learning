import { Tokenizer } from "./index"

export function tokenize(code: string) {
    const tokenizer = new Tokenizer(code);
    const tokens: any = [];
    try {
        while (true) {
            let token = tokenizer.getNextToken();
            if (!token) {
                break;
            }
            tokens.push(token);
        }
    } catch (e) {
       console.log("tokenize error:", e);
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
const tokens = tokenize(code);
console.log("tokens:", tokens);
