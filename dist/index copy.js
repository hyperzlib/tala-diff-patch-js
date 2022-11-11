"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalaDiffPatch = exports.TalaPatchData = exports.PatchType = void 0;
const DiffMatchPatch = __importStar(require("diff-match-patch"));
exports.PatchType = {
    COPY: 0,
    ADD: 1,
};
class TalaPatchData {
    constructor(patchData) {
        this.patchList = [];
        if (Array.isArray(patchData)) {
            this.patchList = patchData;
        }
    }
    fromString(patchText) {
        let inBlock = false;
        let chunkStart = 0;
        let char = '';
        let patchList = [];
        for (let i = 0; i < patchText.length; i++) {
            char = patchText.charAt(i);
            if (inBlock) {
                // 在block中
                if (char === ']') {
                    let posList = patchText.substring(chunkStart, i).split(':');
                    let start = 0;
                    let end = 0;
                    if (posList.length === 2) {
                        start = parseInt(posList[0]);
                        length = parseInt(posList[1]);
                        patchList.push({
                            type: exports.PatchType.COPY,
                            start,
                            length
                        });
                    }
                    // block结束
                    inBlock = false;
                    chunkStart = i + 1;
                }
            }
            else {
                if (char === '[') {
                    if (chunkStart < i) {
                        // 复制前面的文本块
                        let text = decodeURI(patchText.substring(chunkStart, i));
                        patchList.push({
                            type: exports.PatchType.ADD,
                            text,
                        });
                    }
                    inBlock = true;
                    chunkStart = i + 1;
                }
            }
        }
        if (chunkStart < patchText.length) {
            // 复制前面的文本块
            let text = decodeURI(patchText.substring(chunkStart, patchText.length));
            patchList.push({
                type: exports.PatchType.ADD,
                text,
            });
        }
    }
    toString() {
        let sb = this.patchList.map((one) => {
            switch (one.type) {
                case exports.PatchType.COPY:
                    return `[${one.start}:${one.length}]`;
                case exports.PatchType.ADD:
                    return one.text
                        .replace(/%/g, '%25')
                        .replace(/\{/g, '%5B')
                        .replace(/\}/g, '%5D');
            }
        });
        return sb.join('');
    }
}
exports.TalaPatchData = TalaPatchData;
class TalaDiffPatch {
    constructor() {
        this.dmp = new DiffMatchPatch.diff_match_patch();
    }
    diff(text1, text2) {
        const diff = this.dmp.diff_main(text1, text2);
        let srcSeek = 0;
        let patchList = [];
        diff.forEach((one) => {
            let type = one[0];
            let text = one[1];
            switch (type) {
                case DiffMatchPatch.DIFF_EQUAL:
                    patchList.push({
                        type: exports.PatchType.COPY,
                        start: srcSeek,
                        length: text.length
                    });
                    srcSeek += text.length;
                    break;
                case DiffMatchPatch.DIFF_DELETE:
                    srcSeek += text.length;
                    break;
                case DiffMatchPatch.DIFF_INSERT:
                    patchList.push({
                        type: exports.PatchType.ADD,
                        text
                    });
                    break;
            }
        });
        return new TalaPatchData(patchList);
    }
    patch(text1, patch) {
        return patch.patchList.map((one) => {
            switch (one.type) {
                case exports.PatchType.COPY:
                    return text1.substring(one.start, one.start + one.length);
                case exports.PatchType.ADD:
                    return one.text;
            }
        }).join('');
    }
}
exports.TalaDiffPatch = TalaDiffPatch;
//# sourceMappingURL=index%20copy.js.map