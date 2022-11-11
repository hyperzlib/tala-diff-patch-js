import * as DiffMatchPatch from 'diff-match-patch';

export const PatchType = {
    COPY: 0,
    ADD: 1,
}

export type PatchDataType = {
    type: number,
    start?: number,
    length?: number,
    text?: string
};

export class TalaPatchData {
    public patchList: PatchDataType[] = [];

    constructor(patchList: PatchDataType[])
    constructor(patchText: string)
    constructor(patchData: PatchDataType[] | string) {
        if (Array.isArray(patchData)) {
            this.patchList = patchData;
        }
    }

    public fromString(patchText: string) {
        let inBlock = false;
        let chunkStart = 0;
        let char = '';
        let patchList: PatchDataType[] = [];
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
                            type: PatchType.COPY,
                            start,
                            length
                        });
                    }
                    // block结束
                    inBlock = false;
                    chunkStart = i + 1;
                }
            } else {
                if (char === '[') {
                    if (chunkStart < i) {
                        // 复制前面的文本块
                        let text = decodeURI(patchText.substring(chunkStart, i));
                        patchList.push({
                            type: PatchType.ADD,
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
                type: PatchType.ADD,
                text,
            });
        }
    }

    public toString(): string {
        let sb = this.patchList.map((one) => {
            switch (one.type) {
                case PatchType.COPY:
                    return `[${one.start}:${one.length}]`;
                case PatchType.ADD:
                    return one.text!
                        .replace(/%/g, '%25')
                        .replace(/\{/g, '%5B')
                        .replace(/\}/g, '%5D');
            }
        });
        return sb.join('');
    }
}

export class TalaDiffPatch {
    private dmp: DiffMatchPatch.diff_match_patch;

    constructor() {
        this.dmp = new DiffMatchPatch.diff_match_patch();
    }

    public diff(text1: string, text2: string): TalaPatchData {
        const diff = this.dmp.diff_main(text1, text2);

        let srcSeek = 0;
        let patchList: PatchDataType[] = [];
        diff.forEach((one) => {
            let type = one[0];
            let text = one[1];
            switch (type) {
                case DiffMatchPatch.DIFF_EQUAL:
                    patchList.push({
                        type: PatchType.COPY,
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
                        type: PatchType.ADD,
                        text
                    });
                    break;
            }
        });
        return new TalaPatchData(patchList);
    }

    public patch(text1: string, patch: TalaPatchData): string {
        return patch.patchList.map((one) => {
            switch (one.type) {
                case PatchType.COPY:
                    return text1.substring(one.start!, one.start! + one.length!);
                case PatchType.ADD:
                    return one.text!;
            }
        }).join('');
    }
}
