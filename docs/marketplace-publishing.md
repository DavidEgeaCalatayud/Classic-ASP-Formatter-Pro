# Visual Studio Marketplace publication checklist

Classic ASP Formatter Pro is already structured as a VS Code extension and can be packaged locally with `@vscode/vsce`. Publishing remains an explicit manual release decision.

## Repository readiness

- [x] Extension manifest lives in `package.json`.
- [x] `publisher` is declared as `David-Egea-Calatayud`.
- [x] Repository, bugs, homepage and MIT license metadata are declared.
- [x] `package-lock.json` is committed for reproducible `npm ci`.
- [x] CI runs compile, lint and tests on push and pull requests.
- [x] `npm run package` produces the VSIX release artifact.
- [ ] Verify that the Marketplace publisher ID is exactly `David-Egea-Calatayud`.
- [ ] Decide whether to add a Marketplace icon and listing assets.
- [ ] Review the public README and CHANGELOG for the release version.
- [ ] Perform a final manual formatting pass against representative Classic ASP files.

## Release validation

Run from a clean checkout:

```bash
npm ci
npm run compile
npm run lint
npm test
npm run package
npx vsce ls
```

Install the generated VSIX in a clean VS Code profile and verify `.asp`/`.asa` registration, Format Document integration, the safe-format command, risk analysis and representative mixed-language fixtures.

## Marketplace account setup

These steps require the repository owner and are intentionally not automated here:

1. Create or verify the Visual Studio Marketplace publisher whose ID matches `package.json`.
2. Create the Marketplace authentication credential required by `vsce`.
3. Authenticate locally with `npx vsce login David-Egea-Calatayud`.
4. Confirm the package version and `CHANGELOG.md`.
5. Publish only after explicit release approval with `npx vsce publish`.

Do not commit Marketplace credentials, tokens or generated secret configuration.

## Recommended first release process

Prefer a manually approved first release: merge a green release PR, tag the intended version, build and inspect the VSIX from that commit, install-test it locally, publish manually, and verify the resulting Marketplace listing. Only then consider automating future publication behind a protected/manual GitHub Actions environment.

The current CI is sufficient for continuous validation. Marketplace publication itself should remain manual until the first listing and publisher configuration have been verified.
