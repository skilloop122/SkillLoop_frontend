const fs = require('fs');

async function test() {
  const fileData = fs.readFileSync('/Users/mac/.gemini/antigravity-ide/brain/6ef73202-f283-4328-b9a3-0b21e7187787/.system_generated/logs/transcript.jsonl', 'utf8');
  console.log("Found transcript");
}
test();
