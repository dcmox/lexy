/**
 * Daniel Moxon
 * Copyright (C) 2020
 * https://github.com/dcmox/lexy
 */

const fs = require('fs')
const levenshtein = require('string-dist').levenshtein

interface ILexyResult {
    structure: any,
    errors: any[],
}

interface INodeInfo {
    match: string,
    start: number,
    end: number,
    length: number,
    tag: string,
    error?: string,
    hint?: string
}

const HTML_TAGS = [
    'html',
    'head',
    'div',
    'ul',
    'li',
    'nav',
    'span',
    'p',
    'title',
    'meta',
    'img',
    'section',
    'article',
    'main',
    'footer',
    'header',
    'aside',
    'time',
    'dd',
    'dt',
    'ol',
    'acronym',
    'address',
    'blockquote',
    'em',
    'b',
    'button',
    'canvas',
    'form',
    'code',
    'pre',
    'embed',
    'fieldset',
    'figure',
    'input',
    'hr',
    'iframe',
    'a',
    'strong',
    'style',
    'table',
    'tbody',
    'tr',
    'td',
    'th',
    'video',
    'u',
    'link',
    'label',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
]

const HTML_TAGS_UNCLOSED = [
    'img',
    'meta',
    'link',
    'input',
    '!DOCTYPE',
]

const cleanTag = (s: string) => s.indexOf(' ') === -1 ? s.replace(/\<|\>|\//g, '') : s.replace(/\<|\>|\//g, '').split(' ')[0]

export class LexyScan {
    public _analysis: ILexyResult
    private _path: string[]
    private _openTags: any[]
    private _len: number
    private _scanPos: number
    private _document: string

    constructor(document: string) {
        this._analysis = {
            errors: [],
            structure: { root: {} },
        }

        this._path = ['root']
        this._openTags = []
        this._document = document
        this._len = document.length
        this._scanPos = 0
    }

    public scan(): ILexyResult {
        let scan
        // tslint:disable-next-line: no-conditional-assignment
        while ((scan = this._scan()) !== false) {
            const match: string = this._document.substring(scan.pos, scan.posN)
            // closed tag
            if (match.indexOf('/') === 1) {
                const cNode: string = cleanTag(match)
                const index: number = this._openTags.findIndex((t: any) => t && t.tag === cNode)
                if (index !== -1) {
                    this._openTags[index] = null
                }
                if (index === -1) {
                    this._analysis.errors.push({
                        end: scan.posN,
                        error: 'Unopened',
                        length: cNode.length,
                        match,
                        start: scan.pos,
                        tag: cNode,
                    })
                }
                this._path.pop()
            } else {
                const node: string = cleanTag(match)
                this._openTags.push({
                    end: scan.posN,
                    error: '',
                    length: node.length,
                    match,
                    start: scan.pos,
                    tag: node,
                })
                this._addNode(node)
            }
            this._scanPos = scan.posN
        }
        this._openTags = this._openTags.filter((t: any) => t !== null)
        this._openTags.forEach((t) => this._buildAnalysis(t))
        return this._analysis
    }

    private _buildAnalysis(tag: INodeInfo): void {
        if (HTML_TAGS_UNCLOSED.indexOf(tag.tag) !== -1) { return }
        const sErrors = this._analysis.errors
            .filter((t) => t.error === 'Unopened')
            .sort((a: any, b: any) => levenshtein(a.tag, tag.tag) > levenshtein(b.tag, tag.tag) ? 1 : -1)

        const dist = levenshtein(sErrors[0].tag, tag.tag)
        if (dist === 1) {
            this._analysis.errors.push(Object.assign(tag, {hint: `Possible mispelled tag: ${sErrors[0].tag}`, error: 'Unclosed'}))
        } else {
            this._analysis.errors.push(Object.assign(tag, {error: 'Unclosed'}))
        }
    }

    private _scan(): any {
        const pos = this._document.indexOf('<', this._scanPos)
        if (pos === -1) { return false }

        const posN = this._document.indexOf('>', this._scanPos)
        if (posN === -1) { return false }
        return { pos, posN: posN + 1 }
    }

    private _addNode = (node: string) => {
        let lrNode: any = this._analysis.structure
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this._path.length; i++) {
            if (lrNode[this._path[i]] !== null) {
                lrNode = lrNode[this._path[i]]
            }
        }
        lrNode[node] = {}
        this._path.push(node)
    }
}

export default LexyScan
