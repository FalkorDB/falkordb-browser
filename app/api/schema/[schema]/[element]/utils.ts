export const formatAttribute = (att: [string, string[]]): [string, string] => {
    const [key, [t, d, u, r]] = att
    let val = `${t}`
    if (u === "true") val += "!"
    if (r === "true") val += "*"
    if (d) val += `-${d}`
    return [key, val]
}

export const formatAttributes = (attributes: [string, string[]][]) => attributes.map((att) => formatAttribute(att))