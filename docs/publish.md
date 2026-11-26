# Publication checklist

1. Keep the original course-submission ZIP, slides and demo video privately; do not upload them as-is.
2. Extract this public ZIP. Review files and the PDF. The `src/` code is a reference implementation using synthetic data, not the original deployment.
3. If using the existing repository, clone it to a new local working folder, check its branch and existing files, and back up anything necessary before changes. Copy the public files into it, resolving naming conflicts consciously. Do not replace a real controller with the example unless you intend to change it.
4. Review all tracked files, including previously published project exports, notebooks, screenshots, configurations, commits, release assets, issues and pull requests. `.gitignore` does not remove files already tracked or data in earlier commits.
5. If a credential was ever exposed, revoke/rotate it immediately. Removing the current file is not enough. Review GitHub's sensitive-data-removal guidance; history rewriting requires coordination with collaborators. A new public repository containing only the reviewed package is the simplest option when the old repository should be kept private, but cannot undo past exposure.
6. Confirm permission to share group work and third-party assets. Keep personal student IDs, names, faces, home layout, camera addresses, bot tokens, chat identifiers and private footage out of public artifacts.
7. Run `node --test tests/controller.test.js` and `node src/demo.js` from the extracted folder. Check `git status`, `git diff --cached` and the file list before committing. Stage only explicitly reviewed files.
8. Publish, then open the public repository while signed out and check the README links, PDF, release assets and visibility. Do not upload private materials as release attachments.

Suggested commit: `Publish privacy-preserving CatGuard AI portfolio edition`

GitHub documentation: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
