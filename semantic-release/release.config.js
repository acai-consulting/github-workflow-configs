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
                prepareCmd: "sed -i 's|\"tf_module_version\" = /\\*inject_version_start\\*/\".*\"/\\*inject_version_end\\*/|\"tf_module_version\" = /\\*inject_version_start\\*/\"${nextRelease.version}\"/\\*inject_version_end\\*/|' main.tf"
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
                assets: ['CHANGELOG.md', 'main.tf'], // Include main.tf to commit the updated version
                message: 'chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
            }
        ],
    ]
};
