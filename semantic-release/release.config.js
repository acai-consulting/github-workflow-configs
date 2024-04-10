module.exports = {
    branches: ["main"],
    tagFormat: "${version}",
    plugins: [
        '@semantic-release/commit-analyzer',
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'conventionalcommits',
            }
        ],
        [
            "@semantic-release/exec",
            {
                prepareCmd: "sed -i 's|\\(/\\*inject_version_start\\*/ \"\\).*\\(\" /\\*inject_version_end\\*/\\)|\\1${nextRelease.version}\\2|' main.tf"
            }
        ],
        [
            "@semantic-release/exec",
            {
                prepareCmd: "sed -i 's|INJECT_VERSION|${nextRelease.version}|g' README.md"
            }
        ],
        [
            "@semantic-release/exec",
            {
                prepareCmd: "sed -i 's|module_version-[0-9]*\.[0-9]*\.[0-9]*|module_version-${nextRelease.version}|g' README.md"
            }            
        ],
        [
            '@semantic-release/github',
            {
                successComment: "This ${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version ${nextRelease.version} :tada:",
                labels: false,
                releasedLabels: false
            }
        ],
        [
            "@semantic-release/changelog",
            {
                changelogFile: './CHANGELOG.md',
                changelogTitle: '# Changelog\n\nAll notable changes to this project will be documented in this file.'
            }
        ],
        [
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'main.tf', 'README.md'], // Include main.tf to commit the updated version
                message: 'chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
            }
        ],
    ]
};
