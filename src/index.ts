/**
 * GitHub Action to render a Markdown file to Confluence-friendly HTML and then
 * upload the content to update an existing Confluence Cloud page.
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { getContent, putContent } from "./confluence";
import * as macros from "./macros";
import Transformer from "./transformer";

// read some environment variables
const {
    GITHUB_WORKSPACE: workspace,
    INPUT_MARKDOWN: filename,
    INPUT_PAGE: pageUrl,
    INPUT_USERNAME: username,
    INPUT_API_KEY: password
} = process.env as {
    [key: string]: string
};

// make sure nothing is missing
const missing = [];
if (!workspace) missing.push("GITHUB_WORKSPACE");
if (!filename) missing.push("INPUT_MARKDOWN");
if (!pageUrl) missing.push("INPUT_PAGE");
if (!username) missing.push("INPUT_USERNAME");
if (!password) missing.push("INPUT_API_KEY");
if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}.`);
}

(async () => {

    // read in the markdown file
    const markdown = await readFile(join(workspace ?? ".", filename), { encoding: "utf8" });

    // transform markdown into something that Confluence can use
    const doc = new Transformer(markdown);

    // get the metadata for the current version of the page
    const metadata = await getContent(pageUrl, { username, password });

    // add note at the top of the confluence page
    const repo = `https://github.com/${process.env["GITHUB_REPOSITORY"]}`;
    const html = macros.panel(
        "This page is automatically mirrored from " +
        `<code>${filename}</code> in <a href="${repo}">${repo}</a>. `+
        "Please make any changes to this document via GitHub.",
        "panel",
        "bgColor=#FFFAE6|panelIcon=:lock:|panelIconId=1f512|panelIconText=🔒"
    ) + doc.html;

    // compose new content for the page
    const content = {
        id: metadata.id,
        type: metadata.type,
        title: doc.title ?? metadata.title,
        version: { number: metadata.version.number + 1 },
        body: {
            editor: {
                value: html,
                representation: "editor"
            }
        }
    }

    // update content
    const response = await putContent(pageUrl, content, { username, password });

    // print URL of content
    console.log(`Markdown rendered to ${response._links.base}${response._links?.webui}`);

})();
