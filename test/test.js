const fs = require('fs');
const tala = require('../dist');

let dp = new tala.TalaDiffPatch();

let text1 = fs.readFileSync(__dirname + '/text1.txt', { encoding: 'utf-8' });
let text2 = fs.readFileSync(__dirname + '/text2.txt', { encoding: 'utf-8' });

console.log('text 1:', text1);
console.log('text 2:', text2);

let startTime = new Date().getTime();
let patch = dp.diff(text1, text2);
let endTime = new Date().getTime();
console.log('diff tooks ' + (endTime - startTime) + 'ms');
console.log('patch: ', patch.toString());

startTime = new Date().getTime();
patch = new tala.TalaPatchData(patch.toString());
let patchedText = dp.patch(text1, patch);
endTime = new Date().getTime();
console.log('patch tooks ' + (endTime - startTime) + 'ms');
console.log('patched text:', patchedText);
