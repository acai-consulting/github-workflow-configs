const folderPrefixes = (process.env.SKIP_VERSION_INJECTION_FOLDER_PREFIX || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

// erzeugt z. B. "-not -path \"./foo*\" -not -path \"./bar*\""
const excludeFindArgs = folderPrefixes
    .map(p => `-not -path "./${p}*"`)
    .join(' ');

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
                // Alle main.tf aktualisieren, außer in Verzeichnissen mit angegebenem Präfix
                prepareCmd: `find . -type f -name 'main.tf' ${excludeFindArgs} -exec sed -i 's|\\(/\\*inject_version_start\\*/ \"\\).*\\(\" /\\*inject_version_end\\*/\\)|\\1\\\${nextRelease.version}\\2|' {} +`
            }
        ],
        [
            "@semantic-release/exec",
            {
                // This command updates the README.md with a simple version placeholder replacement
                prepareCmd: `find . -type f -name 'README.md' ${excludeFindArgs} -exec sed -i 's|INJECT_VERSION|\${nextRelease.version}|g' {} +`
            }
        ],
        [
            "@semantic-release/exec",
            {
                // This command updates the README.md with a more complex version placeholder replacement
                prepareCmd: `find . -type f -name 'README.md' ${excludeFindArgs} -exec sed -i 's|module_version-[0-9]*\\.[0-9]*\\.[0-9]*|module_version-\${nextRelease.version}|g' {} +`
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
                assets: ['CHANGELOG.md', 'README.md', '**/main.tf'], // Only include files directly handled here
                message: 'chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            }
        ]
    ]
};
