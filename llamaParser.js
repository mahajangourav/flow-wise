import { LlamaParseReader } from "llama-cloud-services";

async function main() {
  const reader = new LlamaParseReader({
    // The parsing tier. Options: fast, cost_effective, agentic, agentic_plus
    tier: "fast",
    // The version of the parsing tier to use. Use 'latest' for the most recent version
    version: "latest",
    // Whether to use precise bounding box extraction (experimental)
    precise_bounding_box: true,
    // The page separator
    page_separator: "\n\n---\n\n",
    // The maximum number of pages to parse
    max_pages: 0
  });

  // Parse the file and get the result
  const results = await reader.parse("101.pdf");

  // parse() returns an array of ParseResult objects
  for (const result of results) {
    console.log(`Job ID: ${result.job_id}`);
    console.log(`File: ${result.file_path}`);
    console.log(`Completed: ${result.is_completed}`);
    console.log(`Number of pages: ${result.pages.length}`);
    console.log("---");

    // Access individual pages
    for (const page of result.pages) {
      // The page object structure depends on the parsing configuration
      // It may contain: text, md, images, layout, structuredData, etc.
      if (page.text) console.log("Text:", page.text);
      if (page.md) console.log("Markdown:", page.md);
      if (page.json) console.log("JSON:", page.json);
    }
  }
}

main().catch(console.error);
