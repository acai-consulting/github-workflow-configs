const folderPrefixes = (process.env.SKIP_VERSION_INJECTION_FOLDER_PREFIX || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

// Create proper find exclusion syntax with escaped parentheses
const excludeFindArgs = folderPrefixes.length > 0
    ? `\\( ${folderPrefixes.map(p => `-path './${p}*'`).join(' -o ')} \\) -prune -o`
    : '';

module.exports = {
    branches: ['main'],
    tagFormat: '${version}',
    plugins: [
        '@semantic-release/commit-analyzer',
        [
            '@semantic-release/release-notes-generator',
            { preset: 'conventionalcommits' }
        ],
        [
            '@semantic-release/exec',
            {
                // Update main.tf files with version, skipping excluded folders
                prepareCmd: `find . ${excludeFindArgs} -type f -name 'main.tf' -exec sed -i 's|\\(/\\*inject_version_start\\*/ "\\).*\\(" /\\*inject_version_end\\*/\\)|\\1\${nextRelease.version}\\2|' {} +`
            }
        ],
        [
            '@semantic-release/exec',
            {
                // Simple placeholder replacement in README.md
                prepareCmd: `find . ${excludeFindArgs} -type f -name 'README.md' -exec sed -i 's|INJECT_VERSION|\${nextRelease.version}|g' {} +`
            }
        ],
        [
            '@semantic-release/exec',
            {
                // Complex version string replacement in README.md
                prepareCmd: `find . ${excludeFindArgs} -type f -name 'README.md' -exec sed -i 's|module_version-[0-9]*\\.[0-9]*\\.[0-9]*|module_version-\${nextRelease.version}|g' {} +`
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
            '@semantic-release/changelog',
            {
                changelogFile: './CHANGELOG.md',
                changelogTitle: '# Changelog\n\nAll notable changes to this project will be documented in this file.',
            }
        ],
        [
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'README.md', '**/main.tf'],
                message: 'chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            }
        ]
    ]
};