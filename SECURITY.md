# Security and privacy

This prototype has no network integration and requires no secrets.

- Never commit real bot tokens, camera stream addresses, passwords, student identifiers or household footage.
- Keep local integrations and captures outside version control. `.gitignore` is a convenience, not a secret scanner.
- Restrict camera access and repository visibility. Use synthetic examples for public issues.
- Avoid raw payload/URL logging; log only event type, time and delivery outcome needed for diagnosis.
- Rotate any accidentally exposed credential at its provider; deleting a file from the latest commit does not remove history.

There is no hosted security-reporting address in this package. Report vulnerabilities privately to the repository owner once a repository exists. Do not post credentials in an issue.
