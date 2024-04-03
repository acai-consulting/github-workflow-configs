module.exports = {
    branches: ["main"],
    tagFormat: "${version}",
    plugins: [
        '@semantic-release/commit-analyzer', // This plugin has no additional configuration here, so it's just a string.
        [
            '@semantic-release/release-notes-generator', // This needs to be an array with its configuration object.
            {
                preset: 'conventionalcommits',
            }
        ],
        [
            '@semantic-release/github',
            {
                successComment: 'This ${issue.pull_request ? \'PR is included\' : \'issue has been resolved\'} in version ${nextRelease.version} :tada:',
                labels: false, // This and the next option expect boolean or array values. To disable them, `false` is correct.
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
                assets: ['CHANGELOG.md'],
                message: 'chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
            },
        ],
    ]
};
