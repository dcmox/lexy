# lexy
Lexy is an HTML lexer that can break down an HTML document into a tree-like structure and find parsing errors (unclosed/closed tags that are missing) and suggest hints at what might be wrong.

## Use
```typescript
const LexyScan = require('@dcmox/lexy').LexyScan

const lexy = new LexyScan(doc)
console.log(JSON.stringify(lexy.scan(), null, 2))
```

## Example output
![LexyScan](https://i.imgur.com/o0id6jv.jpg)