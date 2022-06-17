// https://tc39.github.io/ecma262/#sec-white-space
/**
 * 是否是空格
 * @param cp 
 * @returns 
 */
export function isWhiteSpace(cp: number): boolean {
    return (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0) ||
        (cp >= 0x1680 && [0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(cp) >= 0);
}


/**
 * 标志符的开始， 未完善版本（中文等）
 * @param cp
 * @returns
 */
 export function isIdentifierStart(cp: number): boolean {
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
export function isIdentifierPart(cp: number): boolean {
    return (cp === 0x24) || (cp === 0x5F) ||  // $ (dollar) and _ (underscore)
        (cp >= 0x41 && cp <= 0x5A) ||         // A..Z
        (cp >= 0x61 && cp <= 0x7A) ||         // a..z
        (cp >= 0x30 && cp <= 0x39) ||         // 0..9
        (cp === 0x5C)                   // \ (backslash)
}

/**
 *  10进制数字
 * @param cp 
 * @returns 
 */
export function isDecimalDigit(cp: number): boolean {
    return (cp >= 0x30 && cp <= 0x39);      // 0..9
}

/**
 *  是否是行终结符号
 *  https://tc39.github.io/ecma262/#sec-line-terminators
 * @param cp 
 * @returns 
 */
export function isLineTerminator(cp: number): boolean {
    // \n(0x0A) \r(0x0D)  行分隔符 (0x2028) 和段落分隔符 (0x2029)
    return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029);
}