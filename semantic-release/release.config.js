// Parse folder prefixes from environment variable
const folderPrefixes = (process.env.SKIP_VERSION_INJECTION_FOLDER_PREFIX || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

console.log('DEBUG: Parsed folder prefixes:', folderPrefixes);

function createFindCommand(filePattern, sedCommand) {
    if (folderPrefixes.length === 0) {
        return `find . -type f -name '${filePattern}' -exec ${sedCommand} {} +`;
    }
    
    // Use -prune for efficient exclusions with proper recursion
    const excludeArgs = folderPrefixes
        .map(prefix => `-path './${prefix}*' -prune`)
        .join(' -o ');

    return `find . \\( ${excludeArgs} \\) -o \\( -type f -name '${filePattern}' -exec ${sedCommand} {} + \\)`;
}

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
                // Update main.tf files with version
                prepareCmd: createFindCommand('main.tf', `sed -i 's|\\(/\\*inject_version_start\\*/ \"\\).*\\(\" \\*inject_version_end\\*/\\)|\\1\${nextRelease.version}\\2|'`)
            }
        ],
        [
            '@semantic-release/exec',
            {
                // Simple placeholder replacement in README.md
                prepareCmd: createFindCommand('README.md', `sed -i 's|INJECT_VERSION|\${nextRelease.version}|g'`)
            }
        ],
        [
            '@semantic-release/exec',
            {
                // Complex version string replacement in README.md
                prepareCmd: createFindCommand('README.md', `sed -i 's|module_version-[0-9]*\\.[0-9]*\\.[0-9]*|module_version-\${nextRelease.version}|g'`)
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