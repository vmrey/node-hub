const listRaw = `npm warn allow-scripts ...
[
  {
    "id": "123",
    "title": "node-hub-KV"
  }
]
`;
const match = listRaw.match(/\[\s*\{[\s\S]*\}\s*\]/);
if (match) {
  console.log(JSON.parse(match[0]));
}
