"use strict";
/**
 * Daniel Moxon
 * Copyright (C) 2020
 * https://github.com/dcmox/lexy
 */
exports.__esModule = true;
var fs = require('fs');
var levenshtein = require('string-dist').levenshtein;
var HTML_TAGS = [
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
];
var HTML_TAGS_UNCLOSED = [
    'img',
    'meta',
    'link',
    'input',
    '!DOCTYPE',
];
var cleanTag = function (s) { return s.indexOf(' ') === -1 ? s.replace(/\<|\>|\//g, '') : s.replace(/\<|\>|\//g, '').split(' ')[0]; };
var LexyScan = /** @class */ (function () {
    function LexyScan(document) {
        var _this = this;
        this._addNode = function (node) {
            var lrNode = _this._analysis.structure;
            // tslint:disable-next-line: prefer-for-of
            for (var i = 0; i < _this._path.length; i++) {
                if (lrNode[_this._path[i]] !== null) {
                    lrNode = lrNode[_this._path[i]];
                }
            }
            lrNode[node] = {};
            _this._path.push(node);
        };
        this._analysis = {
            errors: [],
            structure: { root: {} }
        };
        this._path = ['root'];
        this._openTags = [];
        this._document = document;
        this._len = document.length;
        this._scanPos = 0;
    }
    LexyScan.prototype.scan = function () {
        var _this = this;
        var scan;
        var _loop_1 = function () {
            var match = this_1._document.substring(scan.pos, scan.posN);
            // closed tag
            if (match.indexOf('/') === 1) {
                var cNode_1 = cleanTag(match);
                var index = this_1._openTags.findIndex(function (t) { return t && t.tag === cNode_1; });
                if (index !== -1) {
                    this_1._openTags[index] = null;
                }
                if (index === -1) {
                    this_1._analysis.errors.push({
                        end: scan.posN,
                        error: 'Unopened',
                        length: cNode_1.length,
                        match: match,
                        start: scan.pos,
                        tag: cNode_1
                    });
                }
                this_1._path.pop();
            }
            else {
                var node = cleanTag(match);
                this_1._openTags.push({
                    end: scan.posN,
                    error: '',
                    length: node.length,
                    match: match,
                    start: scan.pos,
                    tag: node
                });
                this_1._addNode(node);
            }
            this_1._scanPos = scan.posN;
        };
        var this_1 = this;
        // tslint:disable-next-line: no-conditional-assignment
        while ((scan = this._scan()) !== false) {
            _loop_1();
        }
        this._openTags = this._openTags.filter(function (t) { return t !== null; });
        this._openTags.forEach(function (t) { return _this._buildAnalysis(t); });
        return this._analysis;
    };
    LexyScan.prototype._buildAnalysis = function (tag) {
        if (HTML_TAGS_UNCLOSED.indexOf(tag.tag) !== -1) {
            return;
        }
        var sErrors = this._analysis.errors
            .filter(function (t) { return t.error === 'Unopened'; })
            .sort(function (a, b) { return levenshtein(a.tag, tag.tag) > levenshtein(b.tag, tag.tag) ? 1 : -1; });
        var dist = levenshtein(sErrors[0].tag, tag.tag);
        if (dist === 1) {
            this._analysis.errors.push(Object.assign(tag, { hint: "Possible mispelled tag: " + sErrors[0].tag, error: 'Unclosed' }));
        }
        else {
            this._analysis.errors.push(Object.assign(tag, { error: 'Unclosed' }));
        }
    };
    LexyScan.prototype._scan = function () {
        var pos = this._document.indexOf('<', this._scanPos);
        if (pos === -1) {
            return false;
        }
        var posN = this._document.indexOf('>', this._scanPos);
        if (posN === -1) {
            return false;
        }
        return { pos: pos, posN: posN + 1 };
    };
    return LexyScan;
}());
exports.LexyScan = LexyScan;
exports["default"] = LexyScan;
