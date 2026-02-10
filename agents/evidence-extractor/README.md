# Evidence Extractor (Reference Agent)

This reference agent transforms messy text into **evidence proposals** only.
It does not decide outcomes.

## Contract
- Input: unstructured text.
- Output: proposal payloads for `submit_evidence`.
- Adjudication: Zeo validates proposal schema, computes decision boundary and accepts/rejects through referee mode.

## Required tools
- `submit_evidence`
- `explain_decision_boundary`

## Security defaults
- Filesystem access: disabled
- Network access: disabled by default
