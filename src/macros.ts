import parse, { HTMLElement } from "node-html-parser";

export function panel(content: string, type: string): HTMLElement {
    return parse(`
        <table
            class="wysiwyg-macro"
            data-macro-name="${type}"
            data-macro-schema-version="1"
            data-macro-body-type="RICH_TEXT"
        >
            <tr>
                <td class="wysiwyg-macro-body">
                    <p>${content}</p>
                </td>
            </tr>
        </table>
    `);
}

export function info(content: string): HTMLElement {
    return panel(content, "info");
}

export function warning(content: string): HTMLElement {
    return panel(content, "note");
}

export function success(content: string): HTMLElement {
    return panel(content, "tip");
}

export function error(content: string): HTMLElement {
    return panel(content, "error");
}

export function toc(exclude?: string): HTMLElement {
    return parse(`
        <img
            class="editor-inline-macro"
            data-macro-name="toc"
            data-macro-parameters="exclude=${(exclude ?? "").replace("|", "\\|")}"
            data-macro-schema-version="1"
        />`
    );
}