# Tala Diff Match
A lightweight diff patch library for network transfer and text file history.

## Usage
### Diff
```js
import { TalaDiffPatch } from 'tala-diff-patch';

const tdp = new TalaDiffPatch();

const text1 = 'I am the very model of a modern Major-General.';
const text2 = 'I am the very model of a cartoon individual.';

const patch = dp.diff(text1, text2);
console.log(patch.toString()); // [0:25]carto[26][30:2]i[40]dividu[43:3]
```

### Patch
```js
import { TalaDiffPatch, TalaPatchData } from 'tala-diff-patch';

const tdp = new TalaDiffPatch();

const text1 = 'I am the very model of a modern Major-General.';
const patch = new TalaPatchData('[0:25]carto[26][30:2]i[40]dividu[43:3]');

const text2 = dp.patch(text1, text2);
console.log(patch.toString()); // I am the very model of a cartoon individual.
```

## Format
The format of the Tala Patch is quite simple. The numbers in brackets indicate copying from the original text.

```[Copy start position, Copy length]```

And other text means insert.

Special symbols like ```%```, ```[```, ```]``` will be urlencoded.

You can use gzip to further reduce the size of the patch.