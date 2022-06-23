import parse, { HTMLElement } from "node-html-parser";

export function panel(content: string, type: string, parameters?: string): HTMLElement {
    return parse(`
        <table
            class="wysiwyg-macro"
            data-macro-name="${type}"
            data-macro-schema-version="1"
            data-macro-body-type="RICH_TEXT"
            data-macro-parameters="${parameters ?? ""}"
        >
            <tr>
                <td class="wysiwyg-macro-body">
                    <p>${content}</p>
                </td>
            </tr>
        </table>
    `);
}

export function info(content: string, parameters?: string): HTMLElement {
    return panel(content, "info", parameters);
}

export function warning(content: string, parameters?: string): HTMLElement {
    return panel(content, "note", parameters);
}

export function success(content: string, parameters?: string): HTMLElement {
    return panel(content, "tip", parameters);
}

export function error(content: string, parameters?: string): HTMLElement {
    return panel(content, "error", parameters);
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