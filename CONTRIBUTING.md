# Contributing

Use tabs where supported. YAML uses spaces; Dart uses the standard Dart formatter.
Run the checks listed in README.md before opening a pull request. Keep the runtime
dependency-free and keep UI formatting outside the numeric API.

## Cross-language behavior

The compaction JSON fixtures in `tests/fixtures/compaction.json` are duplicated
in the companion repository. Keep them identical when changing numeric behavior.
Tests cover signs, midpoint boundaries, zero, metadata, precision and promotions.

## Release setup

Configure npm trusted publishing for organization `core-laboratories`, repository
`compact-money`, workflow filename `release.yml`, with direct publishing allowed.
For a new package, an owner must first establish the package on npm using their
authenticated account before package-level trusted publisher settings can be used.
The workflow uses Node 24, npm 11.19.1 and OIDC with provenance; no stored npm token
is required after configuration. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

## Releasing a version

1. Update `package.json` and CHANGELOG.md.
2. Run all README checks, including the publication dry run.
3. Commit and push the reviewed changes.
4. Create and push a stable tag matching the manifest, for example `0.0.2`.

The `release.yml` workflow runs CI before publication and rejects a mismatched
version tag. Only stable `MAJOR.MINOR.PATCH` tags are supported. Pushing such a tag
publishes the package after registry setup; creating a GitHub Release is optional.
The initial 0.0.1 bootstrap publication is a manual owner step, so start automated
tags at the next version. Do not reuse an already-published version.

Registry account setup and actual publication are separate from local package
creation. No credentials belong in this repository.
