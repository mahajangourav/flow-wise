const fs = require('fs');

// Upload and parse a file using LlamaParse HTTP API
const apiKey = '<your-api-key>'; // See how to get your API key at https://developers.llamaindex.ai/python/cloud/general/api_key/
const filePath = './my_file.pdf';

// Step 1: Upload the file
const uploadFile = async () => {
    try {
        const formData = new FormData();
        formData.append('file', new Blob([fs.readFileSync(filePath)]), filePath);
        // The parsing tier. Options: fast, cost_effective, agentic, agentic_plus
        formData.append('tier', "fast");
        // The version of the parsing tier to use. Use 'latest' for the most recent version
        formData.append('version', "latest");
        // Whether to use precise bounding box extraction (experimental)
        formData.append('precise_bounding_box', true);
        // The page separator
        formData.append('page_separator', "\n\n---\n\n");
        // The maximum number of pages to parse
        formData.append('max_pages', 0);


        const response = await fetch('https://api.cloud.llamaindex.ai/api/v1/parsing/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        const result = await response.json();
        const jobId = result.id;
        console.log('File uploaded successfully. Job ID:', jobId);

        await pollForResult(jobId);
    } catch (error) {
        console.error('Upload error:', error);
    }
};

// Step 2: Poll for job completion
const pollForResult = async (jobId) => {
    while (true) {
        try {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

            const response = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}/result/markdown`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Parsing completed!');
                console.log('Markdown result:', result.markdown);
                break;
            } else if (response.status === 400) {
                const error = await response.json();
                if (error.detail === 'Job not completed yet') {
                    console.log('Job still processing...');
                    continue;
                } else {
                    throw new Error(`Error: ${JSON.stringify(error)}`);
                }
            } else {
                const errorText = await response.text();
                throw new Error(`Error checking job status: ${errorText}`);
            }
        } catch (error) {
            console.error('Request error:', error);
            break;
        }
    }
};

// Start the upload process
uploadFile();
