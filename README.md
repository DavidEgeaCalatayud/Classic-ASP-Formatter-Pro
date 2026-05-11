# Classic ASP Formatter Pro

![VS Code Extension](https://img.shields.io/badge/platform-VS%20Code-007ACC)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6)
![Classic ASP](https://img.shields.io/badge/focus-Classic%20ASP-blue)
![Formatter](https://img.shields.io/badge/category-Formatter-green)
![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18)
![Lint](https://img.shields.io/badge/lint-ESLint-purple)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Classic ASP Formatter Pro is a Visual Studio Code formatter for legacy **Classic ASP** files that mix HTML, CSS, JavaScript, VBScript, ASP directives, inline ASP expressions and include statements in the same document.

Classic ASP codebases are often difficult to maintain because server-side VBScript and client-side markup are tightly coupled inside `.asp` files. This extension focuses on **safe, conservative indentation** instead of aggressive rewriting.

The goal is simple: make legacy ASP files easier to read without changing business logic.

---

## Demo

![Classic ASP Formatter Pro demo](./docs/demo.svg)

---

## Features

- Registers the `asp` language for `.asp` and `.asa` files.
- Provides `Format Document` support through the official VS Code formatting API.
- Adds a safe formatting command for Classic ASP files.
- Adds a formatting-risk analysis command.
- Segments mixed Classic ASP documents into:
  - HTML blocks;
  - ASP script blocks;
  - ASP inline expressions;
  - ASP directives;
  - include directives;
  - ASP comments;
  - `<script>` blocks;
  - `<style>` blocks.
- Indents common VBScript structures:
  - `If / Else / ElseIf / End If`;
  - `For / Next`;
  - `Do / Loop`;
  - `While / Wend`;
  - `Select Case / Case / End Select`;
  - `Function / End Function`;
  - `Sub / End Sub`;
  - `Class / End Class`;
  - `With / End With`.
- Applies structural ASP indentation to surrounding HTML.
- Preserves inline ASP expressions inside HTML text and attributes.
- Formats CSS conservatively using brace-based indentation.
- Formats JavaScript conservatively using brace-based indentation.
- Includes safe mode for ambiguous ASP delimiters.
- Preserves legacy business logic, SQL strings and include ordering.

---

## Why this project exists

Classic ASP applications often contain several languages inside a single file:

```asp
<%@ LANGUAGE="VBSCRIPT" %>
<!--#include file="conexion.asp"-->

<html>
<head>
    <script>
        var id = "<%= Request.QueryString("id") %>";
    </script>
</head>
<body>
<%
If mostrarClientes Then
    Response.Write "<table>"
End If
%>
</body>
</html>
```

Most general-purpose formatters are not designed for this kind of mixed legacy file. They usually understand HTML, JavaScript or CSS, but they do not safely handle embedded VBScript, ASP delimiters, inline expressions and include directives.

Classic ASP Formatter Pro is designed specifically for this scenario.

It does not try to modernize the code automatically. It does not rewrite SQL. It does not refactor VBScript. It focuses on making existing files more readable while reducing the risk of breaking production logic.

---

## Before

```asp
<table>
<% If mostrarClientes Then %>
<tr>
<td>Nombre</td>
<td>Precio</td>
</tr>
<% End If %>
</table>
```

## After

```asp
<table>
    <% If mostrarClientes Then %>
        <tr>
            <td>Nombre</td>
            <td>Precio</td>
        </tr>
    <% End If %>
</table>
```

---

## Technical Highlights

- VS Code extension written in TypeScript.
- Language registration for `.asp` and `.asa` files.
- TextMate grammar support for Classic ASP syntax highlighting.
- Document formatter provider for Classic ASP documents.
- Conservative formatter designed for legacy codebases.
- Safe mode to avoid formatting risky or ambiguous ASP delimiter patterns.
- Configurable indentation size and tab usage.
- Independent formatting toggles for HTML, ASP, CSS and JavaScript.
- Fixture-based tests for regression control.
- Vitest test suite.
- ESLint-based linting.
- VSIX packaging support through `@vscode/vsce`.

---

## Architecture Overview

```text
VS Code
  │
  │ opens .asp / .asa file
  ▼
ASP language registration
  │
  ▼
Document formatter provider
  │
  ▼
Formatting risk analysis
  │
  ├── unmatched ASP delimiters
  ├── delimiter-like strings
  └── ambiguous ASP blocks
  │
  ▼
Document segmentation
  │
  ├── HTML
  ├── ASP blocks
  ├── inline ASP expressions
  ├── ASP directives
  ├── includes
  ├── comments
  ├── script blocks
  └── style blocks
  │
  ▼
Conservative formatting
  │
  ├── HTML indentation
  ├── VBScript indentation
  ├── CSS brace indentation
  └── JavaScript brace indentation
  │
  ▼
Formatted Classic ASP document
```

---

## Commands

| Command | Description |
|---|---|
| `Classic ASP: Format Document Safely` | Formats the active ASP document only when no obvious formatting risk is detected. |
| `Classic ASP: Analyze Formatting Risks` | Scans the active document for unmatched ASP delimiters and risky delimiter-like strings. |

You can also use VS Code's standard **Format Document** action when editing supported `.asp` or `.asa` files.

---

## Configuration

Classic ASP Formatter Pro exposes the following settings:

| Setting | Default | Description |
|---|---:|---|
| `classicAspFormatterPro.indentSize` | `4` | Number of spaces per indentation level. |
| `classicAspFormatterPro.useTabs` | `false` | Use tabs instead of spaces. |
| `classicAspFormatterPro.formatHtml` | `true` | Format HTML segments. |
| `classicAspFormatterPro.formatAsp` | `true` | Format ASP/VBScript segments. |
| `classicAspFormatterPro.formatCss` | `true` | Format CSS segments. |
| `classicAspFormatterPro.formatJavaScript` | `true` | Format JavaScript segments. |
| `classicAspFormatterPro.safeMode` | `true` | Avoid formatting ambiguous ASP blocks. |
| `classicAspFormatterPro.normalizeVbScriptKeywords` | `false` | Normalize common VBScript keyword casing. |
| `classicAspFormatterPro.preserveBlankLines` | `true` | Preserve blank lines while formatting. |

Example `.vscode/settings.json`:

```json
{
  "classicAspFormatterPro.indentSize": 4,
  "classicAspFormatterPro.useTabs": false,
  "classicAspFormatterPro.formatHtml": true,
  "classicAspFormatterPro.formatAsp": true,
  "classicAspFormatterPro.formatCss": true,
  "classicAspFormatterPro.formatJavaScript": true,
  "classicAspFormatterPro.safeMode": true,
  "classicAspFormatterPro.preserveBlankLines": true
}
```

---

## Safe Mode

Safe mode is enabled by default.

When enabled, the formatter avoids modifying files that contain obvious ASP delimiter risks, such as:

- unmatched `<%` or `%>` delimiters;
- ambiguous delimiter-like strings;
- risky mixed blocks that could produce unsafe formatting.

This behavior is intentional. Classic ASP applications are often production-critical legacy systems, and a conservative formatter is safer than an aggressive one.

---

## What the Formatter Handles

### ASP Blocks

```asp
<%
If usuarioActivo Then
    Response.Write "Activo"
Else
    Response.Write "Inactivo"
End If
%>
```

### ASP Inline Expressions

```asp
<input type="text" value="<%= Server.HTMLEncode(nombreCliente) %>">
```

### Include Directives

```asp
<!--#include file="conexion.asp"-->
<!--#include virtual="/includes/seguridad.asp"-->
```

### ASP Around HTML

```asp
<% If mostrarTabla Then %>
    <table>
        <tr>
            <td>Cliente</td>
        </tr>
    </table>
<% End If %>
```

### JavaScript with ASP Expressions

```asp
<script>
    const clienteId = "<%= codcli %>";
    if (clienteId) {
        console.log(clienteId);
    }
</script>
```

### CSS Blocks

```asp
<style>
    .card {
        display: block;
        padding: 12px;
    }
</style>
```

---

## Installation from Source

Clone the repository:

```bash
git clone https://github.com/DavidEgeaCalatayud/Classic-ASP-Formatter-Pro.git
cd Classic-ASP-Formatter-Pro
```

Install dependencies:

```bash
npm install
```

Compile the extension:

```bash
npm run compile
```

Open the project in Visual Studio Code:

```bash
code .
```

Press `F5` to launch an **Extension Development Host**.

Open a `.asp` file and run:

```text
Format Document
```

or:

```text
Classic ASP: Format Document Safely
```

---

## Development

Install dependencies:

```bash
npm install
```

Compile TypeScript:

```bash
npm run compile
```

Run the compiler in watch mode:

```bash
npm run watch
```

Run the test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

---

## Testing

Formatter behavior is covered with fixture-based tests.

The project uses input/output fixture pairs so formatting changes can be reviewed safely:

```text
example.input.asp
example.expected.asp
```

The test suite covers scenarios such as:

- ASP `If / Else / End If` blocks around HTML;
- `Select Case` indentation;
- `Function`, `Sub`, `Class` and `With` blocks;
- inline ASP expressions in HTML text;
- inline ASP expressions in HTML attributes;
- include directives;
- JavaScript blocks containing inline ASP expressions;
- CSS blocks;
- safe mode risk detection;
- unmatched ASP delimiters;
- delimiter-like strings.

Run tests with:

```bash
npm test
```

---

## Examples

The `examples/` directory contains realistic Classic ASP samples:

```text
examples/
  simple-table.asp
  form-with-validation.asp
  mixed-html-vbscript-js.asp
  select-case-page.asp
  include-directives.asp
  legacy-large-before.asp
  legacy-large-after.asp
```

These examples are useful for manually checking how the formatter behaves with common legacy ASP patterns.

---

## Packaging

Package the extension as a VSIX file:

```bash
npm run package
```

This generates a `.vsix` package that can be installed manually in Visual Studio Code.

To install the generated VSIX manually:

```bash
code --install-extension classic-asp-formatter-pro-0.1.0.vsix
```

The generated `.vsix` file should not be committed to Git. It should be treated as a release artifact.

Before publishing to the Visual Studio Marketplace, make sure the `publisher` field in `package.json` matches your Marketplace publisher ID.

---

## Publishing Checklist

Before publishing a release:

- [ ] Compile successfully with `npm run compile`.
- [ ] Pass all tests with `npm test`.
- [ ] Pass linting with `npm run lint`.
- [ ] Test the extension in an Extension Development Host.
- [ ] Test formatting on realistic `.asp` files.
- [ ] Confirm safe mode behavior.
- [ ] Update `CHANGELOG.md`.
- [ ] Update the version in `package.json`.
- [ ] Package the extension with `npm run package`.
- [ ] Install the generated `.vsix` locally.
- [ ] Verify the README, icon, repository URL and license.
- [ ] Publish to Visual Studio Marketplace when ready.

---

## What It Does Not Do

Classic ASP Formatter Pro is intentionally conservative.

It does not:

- refactor VBScript;
- rewrite SQL strings;
- parse SQL inside string literals;
- modernize legacy ASP applications;
- rename variables;
- reorder includes;
- reorder functions;
- move business logic;
- guarantee semantic formatting for malformed HTML;
- replace a complete language parser;
- guarantee perfect formatting for every possible legacy ASP pattern.

---

## Known Limitations

- HTML formatting is intentionally conservative and line-oriented.
- JavaScript formatting is brace-based and not a full JavaScript parser.
- CSS formatting is brace-based and not a full CSS parser.
- Safe mode skips documents with unmatched or ambiguous ASP delimiters.
- SQL inside strings is preserved and not reformatted.
- Malformed HTML can produce imperfect indentation.
- Very unusual VBScript formatting patterns may require manual adjustment.
- The formatter prioritizes safety over aggressive formatting.

---

## Roadmap

### v0.1

- [x] Basic ASP/VBScript formatter.
- [x] HTML/ASP segmentation.
- [x] Format Document support for `.asp`.
- [x] Safe formatting command.
- [x] Formatting-risk analysis command.

### v0.2

- [ ] Improve global ASP + HTML indentation.
- [ ] Improve structural ASP indentation around HTML.
- [ ] Expand fixture coverage for large legacy files.
- [ ] Add more before/after examples.

### v0.3

- [ ] Improve conservative CSS formatting.
- [ ] Improve conservative JavaScript formatting.
- [ ] Improve inline ASP placeholder handling.
- [ ] Add more tests for `<script>` and `<style>` blocks.

### v0.4

- [ ] Improve VBScript indentation rules.
- [ ] Improve handling for `Select Case`, `With` and `Class`.
- [ ] Add more real-world Classic ASP fixtures.
- [ ] Improve risk analysis output.

### v1.0

- [ ] Stabilize formatter behavior for large ASP files.
- [ ] Publish to Visual Studio Marketplace.
- [ ] Add complete user documentation.
- [ ] Add CI release packaging.
- [ ] Provide signed release artifacts.

---

## Development Goals

This project is also intended as a technical exploration of:

- VS Code extension development;
- custom document formatting providers;
- legacy code formatting;
- mixed-language document segmentation;
- conservative code transformation;
- formatter safety checks;
- TypeScript tooling;
- test-driven formatter development.

---

## Security Notes

This extension formats local source files opened in Visual Studio Code.

It does not need to execute ASP code, connect to databases or access production servers.

Even so, always review formatted changes before committing them, especially in legacy applications where formatting can affect string literals, generated HTML or mixed server/client code.

Recommended workflow:

```bash
git diff
```

Review all formatting changes before committing.

---

## Recommended Workflow

For legacy ASP projects, use the formatter carefully:

1. Format one file at a time.
2. Keep `safeMode` enabled.
3. Review the diff after formatting.
4. Run the application or relevant tests if available.
5. Commit formatting-only changes separately from logic changes.

This makes code review safer and avoids mixing formatting changes with functional changes.

---

## Contributing

Contributions are welcome, especially:

- new Classic ASP fixture examples;
- edge cases involving mixed HTML and ASP;
- VBScript indentation improvements;
- safer delimiter-risk detection;
- documentation improvements;
- bug reports with before/after examples.

When reporting a formatting issue, include:

```text
1. Original ASP input
2. Actual formatter output
3. Expected formatter output
4. Formatter configuration
5. Whether safe mode was enabled
```

---

## Disclaimer

Classic ASP Formatter Pro is designed for conservative formatting of legacy Classic ASP files.

It is not a compiler, interpreter, validator or full parser. Always review generated changes before using them in production codebases.

Use it at your own discretion, especially with old applications that contain mixed HTML, VBScript, JavaScript, CSS and SQL strings.

---

## License

MIT
