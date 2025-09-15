# pa11y-server

# What is Pa11y?

The Pa11y-Server is based on https://github.com/pa11y/pa11y-ci.


Pa11y is your automated accessibility testing pal. It runs accessibility tests on your pages via the command line or Node.js, so you can automate your testing process.

## Parameter

 <b>The Pa11y Server takes two arguments with ? as a prefix in its path.</b>

| scanningMethod      
| -------- | 
| sarif  | 
| json (not done yet) |


# Sitemap URL

A sitemap is a file (usually XML) or diagram that shows the structure of a website.

To scan your website for accessibility, your website should support sitemap.xml

You can generate a sitemap for you website with the [next-sitemap](https://www.npmjs.com/package/next-sitemap) package


Usually you add next-sitemap to your postbuild, to generate the xml.

    ```json
    {
        "name": "example-project",
        "version": "0.1.0",
        "private": true,
        "scripts": {
            "predev": "node prebuild.mjs",
            "prebuild": "node prebuild.mjs",
            "dev": "next dev",
            "build": "next build",
            "postbuild": "next-sitemap",  `
            "start": "next start",
            "lint": "next lint"
        },

    ```

make sure to add `https://` to the sitemap url parameter.

### Example
`http://localhost:50259/?scanningMethod=sarif&sitemapurl=https://servicestandard.gov.de/sitemap.xml`


