const folderPrefixes = (process.env.SKIP_VERSION_INJECTION_FOLDER_PREFIX || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

// e.g. for ["99-","foo"], this becomes:
//   ( -path './99-*' -o -path './foo*' ) -prune -o
const pruneExpr = folderPrefixes.length
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
                // prune your skipped folders *first*, then only match the remaining main.tf / README.md files
                prepareCmd: `
          find . ${pruneExpr} -type f -name 'main.tf' -exec \
            sed -i 's|\\(/\\*inject_version_start\\*/ \"\\).*\\(\" /\\*inject_version_end\\*/\\)|\\1\${nextRelease.version}\\2|' {} + &&
          find . ${pruneExpr} -type f -name 'README.md' -exec \
            sed -i 's|INJECT_VERSION|\${nextRelease.version}|g' {} + &&
          find . ${pruneExpr} -type f -name 'README.md' -exec \
            sed -i 's|module_version-[0-9]*\\.[0-9]*\\.[0-9]*|module_version-\${nextRelease.version}|g' {} +
        `
            }
        ],
        [
            '@semantic-release/github',
            {
                successComment:
                    "This ${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version ${nextRelease.version} :tada:",
                labels: false,
                releasedLabels: false
            }
        ],
        [
            '@semantic-release/changelog',
            {
                changelogFile: './CHANGELOG.md',
                changelogTitle:
                    '# Changelog\n\nAll notable changes to this project will be documented in this file.'
            }
        ],
        [
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'README.md', '**/main.tf'],
                message:
                    'chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
            }
        ]
    ]
};
