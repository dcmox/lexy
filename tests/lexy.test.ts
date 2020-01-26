const assert = require('assert')
import * as testSuite from '../lexy'

describe('lexy test suite', () => {
    it('should scan and detect errors', () => {
        const doc = `
        <html>
            <head>
                <title>Test</title>
            </head>
            <body>
                <div id="test">
                    <span>Span</span>
                    <p>Paragraph</p>
                </div>
                <section>
                    <div>Nested</div>
                    <div>
                        <nav>
                            <u>
                                <li>List item</li>
                                <li>List item</li>
                            </ul>
                        </nav>
                    </div>

                    <img src="" />

                    <a href="#">Google</a>
                </section>
            </body>

            <footer>
                <span>Copyright stuff here</span>
            </footr>
        </html>
        `
        const lexy = new testSuite.LexyScan(doc)
        const result = lexy.scan()

        assert.equal(result.errors.length, 4)

        assert.deepEqual(result.errors[2],  {
            end: 391,
            error: 'Unclosed',
            hint: 'Possible mispelled tag: ul',
            length: 1,
            match: '<u>',
            start: 388,
            tag: 'u',
        })

        assert.deepEqual(result.errors[3],  {
            end: 734,
            error: 'Unclosed',
            hint: 'Possible mispelled tag: footr',
            length: 6,
            match: '<footer>',
            start: 726,
            tag: 'footer',
        })

        assert.deepEqual(result.structure,  {
            root: {
                html: {
                    head: {
                        title: {},
                    },
                    body: {
                        div: {
                            span: {},
                            p: {},
                        },
                        section: {
                        div: {
                            nav: {
                            u: {
                                li: {},
                            },
                            },
                        },
                        img: {
                            a: {},
                        },
                        },
                        footer: {
                            span: {},
                        },
                    },
                },
            },
        })
    })
})
