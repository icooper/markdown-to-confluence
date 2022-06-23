import { marked } from "marked";
import * as parser from "node-html-parser";

import * as macros from "./macros";

export default class Transformer {
    private root: parser.HTMLElement;
    private sourceName: string;
    readonly title: string | undefined;

    constructor(sourceName: string, markdown: string) {
        this.sourceName = sourceName;
        this.root = parser.parse(marked(markdown, { gfm: true }));
        this.title = this.promoteTitle();

        this.addTableOfContents();
        this.fixPreTrailingNewline();
        this.fixPanels();
        this.addMirrorInformation();
        this.fixParagraphWhitespace();
    }

    private promoteTitle(): string | undefined {
        let title: string | undefined;
    
        const h1 = this.root.getElementsByTagName("h1");
        if (h1.length === 1) {
            title = h1[0].textContent;
            h1[0].remove();
    
            let l = 2, hl: parser.HTMLElement[] = [];
            do {
                hl = this.root.getElementsByTagName(`h${l}`);
                hl.forEach(e => e.tagName = `h${l - 1}`);
                l++;
            } while (hl.length > 0);
        }
    
        return title;
    }
    
    private addTableOfContents(): void {
        const e = this.root.getElementById("table-of-contents") ??
            this.root.getElementById("table-of-contents-");
        if (e) {
            e.nextElementSibling.replaceWith(macros.toc(`(Version\\|${e.textContent})`));
        }
    }
    
    private fixPreTrailingNewline(): void {
        this.root.getElementsByTagName("pre").forEach(e => {
            e.innerHTML = e.innerHTML.replace("\n</code>", "</code>");
        });
    }
    
    private fixPanels(): void {
        this.root.querySelectorAll("blockquote > p > em").forEach(e => {
            let panelType: string | undefined = undefined;
            switch (e.textContent.toUpperCase()) {
                case "INFO:":
                case "NOTE:":
                    panelType = "info";
                    break;
    
                case "WARNING:":
                    panelType = "note";
                    break;
    
                case "ERROR:":
                    panelType = "error";
                    break;
    
                case "TIP:":
                case "SUCCESS:":
                    panelType = "tip";
                    break;
            }
    
            if (panelType) {
                const p = e.parentNode;
                const gp = e.parentNode.parentNode;
                e.remove();
                gp.replaceWith(macros.panel(p.innerHTML, panelType));
            }
        });
    }
    
    private addMirrorInformation(): void {
        const repo = `https://github.com/${process.env["GITHUB_REPOSITORY"]}`;
        this.root.childNodes.unshift(macros.info(`
            This page is automatically mirrored from
            <code>${this.sourceName}</code> in <a href="${repo}">${repo}</a>.
            Please make any changes to this document via GitHub.
        `))
    }

    private fixParagraphWhitespace() {
        this.root.getElementsByTagName("p").forEach(e => {
            e.innerHTML = e.innerHTML.replace(/(\r|\n|\r\n)/, " ").trim();
        });
    }

    public get html(): string {
        return this.root.toString();
    }
}

