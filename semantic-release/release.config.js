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
                // This command updates all main.tf files with the new version
                prepareCmd: "find . -type f -name 'main.tf' -exec sed -i 's|\\(/\\*inject_version_start\\*/ \"\\).*\\(\" /\\*inject_version_end\\*/\\)|\\1${nextRelease.version}\\2|' {} +"
            }
        ],
        [
            "@semantic-release/exec",
            {
                successCmd: "./release-commit-main-tf.sh ${nextRelease.version}"
            }
        ],
        [
            "@semantic-release/exec",
            {
                // This command updates the README.md with a simple version placeholder replacement
                prepareCmd: "sed -i 's|INJECT_VERSION|${nextRelease.version}|g' README.md"
            }
        ],
        [
            "@semantic-release/exec",
            {
                // This command updates the README.md with a more complex version placeholder replacement
                prepareCmd: "sed -i 's|module_version-[0-9]*\\.[0-9]*\\.[0-9]*|module_version-${nextRelease.version}|g' README.md"
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
                // Exclude main.tf from this step's assets, since their inclusion and commit are handled by the exec plugin.
                assets: ['CHANGELOG.md', 'README.md'], // Only include files directly handled here
                message: 'chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            }
        ]
    ]
};
