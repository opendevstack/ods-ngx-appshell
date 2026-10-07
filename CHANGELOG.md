# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

### Added
### Changed
### Fixed

## [19.0.17]

Library version: `@opendevstack/ngx-appshell@19.0.17`

### Changed
- Upgraded MSAL libraries ("@azure/msal-angular" from "4.1.1" to "5.3.1" and "@azure/msal-browser" from "4.30.0" to "5.16.0") and adapt the code and schematics to work with this newer versions.

## [19.0.16]

Library version: `@opendevstack/ngx-appshell@19.0.16`

### Added
- Added the AppShellFeedbackComponent, a questionnaire that asks one step at a time and emits the
  answers instead of sending them. Ships the standard four steps of the feedback widget design (what
  the person came to do, whether they achieved it, CSAT 1-5 and the reason for the rating); a host can
  add the optional product-specific fifth step with `productQuestion`, adjust the exported
  `APPSHELL_FEEDBACK_STANDARD_QUESTIONS` (e.g. its own goals in step 1) or supply a questionnaire of
  its own. Question types:
  `choice` (radio buttons), `multiple` (checkboxes), `scale` (radio buttons with a label per point via
  `optionLabels`) and `text` (with an optional `inputLabel`); a `followUp` opens a free-text field under
  one option ("Other", "No") and is emitted only while that option is picked. `{product}` in any
  string is replaced by `productName`. Required questions carry an asterisk, and the last step shows
  Submit instead of Next. Styled after appshell-toast (0.125rem corners, grey-medium hairline, the
  same shadow) with the theme's 16px type and small native checkboxes and radios, as in the design.
  Showcased in the example application under `/feedback`.
- Added AppShellFeedbackOptionsComponent and AppShellFeedbackTextFieldComponent, the presentational
  pieces that draw the questionnaire's answers: checkboxes, radio buttons and the labelled scale; and
  a captioned textarea whose counter appears once the text reaches 80% of its cap. Exported so other
  forms can reuse them; they also keep each component's styles within the style budget.
- Added the AppShellFeedbackLauncherComponent, a floating trigger that opens that questionnaire
  in a dialog, so a product gets the whole experience without rebuilding it. Round action button
  in the corner by default, or a strip against the side. Focus trapping, Escape to close and
  focus restoration come from the Material dialog. Destroying the launcher closes a dialog it left
  open and stops listening to it.

### Changed
- Added multiple selection support for the AppShellSelectComponent and AppShellFiltersComponent.

## [19.0.15]

Library version: `@opendevstack/ngx-appshell@19.0.15`

### Changed
- Upgraded Azure authentication dependencies for the next library release:
  - `@azure/msal-angular` -> `4.1.1`
  - `@azure/msal-browser` -> `4.30.0`

## [19.0.14]

Library version: `@opendevstack/ngx-appshell@19.0.14`

### Added
- Added custom picker placeholder support in headers.
- Split header into reusable components and added space for extra icons.
- Added loading skeletons for product cards.
- Improved icon management.
- Added package publication guidance and npm scope updates.

### Changed
- Improved styles for picker and sidebar menu.

### Fixed
- Fixed product image sizing.
- Fixed breadcrumb and header styling issues.
- Fixed Azure login schematic behavior.

## [19.0.0]

### Added
- Initial public release of the `ngx-appshell` library.

---

Notes:
- This repository currently has no git tags. Version entries are aligned with the version declared in `projects/ngx-appshell/package.json` and the commit history.
