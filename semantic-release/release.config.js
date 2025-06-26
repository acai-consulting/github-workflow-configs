const folderPrefixes = (process.env.SKIP_VERSION_INJECTION_FOLDER_PREFIX || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

// Creates: -not -path "./foo*" -not -path "./bar*"
const excludeFindArgs = folderPrefixes
    .map(p => `-not -path "./${p}*"`)
    .join(' ');

// Escape the find args for shell use
const escapedExcludeFindArgs = excludeFindArgs.replace(/(["$`\\])/g, '\\$1');

module.exports = {
    branches: ["main"],
    tagFormat: "${version}",
    plugins: [
        '@semantic-release/commit-analyzer',
        [
            '@semantic-release/release-notes-generator',
            { preset: 'conventionalcommits' }
        ],
        [
            "@semantic-release/exec",
            {
                // Update main.tf files with version, skipping excluded folders
                prepareCmd: "find . -type f -name 'main.tf' ${excludeFindArgs} -exec sed -i 's|\\(/\\*inject_version_start\\*/ \"\\).*\\(\" /\\*inject_version_end\\*/\\)|\\1${nextRelease.version}\\2|' {} +"
            }
        ],
        [
            "@semantic-release/exec",
            {
                // Simple placeholder replacement in README.md
                prepareCmd: "find . -type f -name 'README.md' ${excludeFindArgs} -exec sed -i 's|INJECT_VERSION|${nextRelease.version}|g' {} +"
            }
        ],
        [
            "@semantic-release/exec",
            {
                // Complex version string replacement in README.md
                prepareCmd: "find . -type f -name 'README.md' ${excludeFindArgs} -exec sed -i 's|module_version-[0-9]*\\.[0-9]*\\.[0-9]*|module_version-${nextRelease.version}|g' {} +"
            }
        ],
        [
            '@semantic-release/github',
            {
                successComment: "This ${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version ${nextRelease.version} :tada:",
                labels: false,
                releasedLabels: false,
            }
        ],
        [
            "@semantic-release/changelog",
            {
                changelogFile: './CHANGELOG.md',
                changelogTitle: '# Changelog\n\nAll notable changes to this project will be documented in this file.',
            }
        ],
        [
            '@semantic-release/git',
            {
                // These files are tracked, but .tf updates are handled separately
                assets: ['CHANGELOG.md', 'README.md', '**/main.tf'],
                message: 'chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            }
        ]
    ]
};
