# Publish to GitHub / วิธีอัปโหลด

This package is ready to upload, but a downloadable ZIP is not evidence of publication. Prefer a new **private** repository named `catguard-ai`; review the contents before changing visibility.

## ภาษาไทย

1. แตกไฟล์ `catguard-ai.zip` แล้วเข้าโฟลเดอร์ `catguard-ai`
2. เปิด https://github.com/new ตั้งชื่อ `catguard-ai` และเลือก **Private**
3. ไม่ต้องเพิ่ม README, .gitignore หรือ license อัตโนมัติ เพราะมีไฟล์ที่เตรียมไว้แล้ว
4. สร้าง repository แล้วเลือก **uploading an existing file**
5. อัปโหลดไฟล์และโฟลเดอร์ภายใน `catguard-ai` ไม่ใช่ตัว ZIP โดยตรวจให้มี `.github/workflows/tests.yml` และ `.gitignore` ด้วย
6. Commit ด้วยข้อความ `Add CatGuard AI reference prototype`
7. เปิด README และหน้า Actions เพื่อตรวจผลทดสอบ การทดสอบนี้ใช้ข้อมูลจำลองเท่านั้น

หากเบราว์เซอร์ไม่อัปโหลดโฟลเดอร์ที่ขึ้นต้นด้วยจุด ให้ใช้ Git ตามคำสั่งด้านล่าง ไม่มีการใส่รหัสผ่านหรือ token ในคำสั่ง

## Git command-line route

Create an empty private repository in your own account first. From the extracted project directory:

```sh
git init -b main
git add .
git diff --cached --stat
git commit -m "Add CatGuard AI reference prototype"
git remote add origin https://github.com/YOUR-ACCOUNT/catguard-ai.git
git push -u origin main
```

Replace `YOUR-ACCOUNT` with the actual owner. Authenticate through Git's normal credential flow. Do not put a token in the URL. If Git requests a commit identity, configure your chosen name and a GitHub-provided no-reply email locally for this repository.

## Review after upload

- The root should show README.md, src/, test/, examples/, docs/, package.json, SECURITY.md and .github/.
- Verify the repository is Private and the latest commit contains the expected files.
- Inspect Actions; do not describe CI as passing until GitHub reports success.
- Add a description: `Prototype cat monitoring and independent door alerts, with simulated reference tests.`
- Suggested topics: `cira-core`, `computer-vision`, `iot`, `javascript`, `prototype`, `cat-monitoring`.

No software license was selected automatically because ownership of the original project/assets was not established. Choose a license after confirming rights with the project team.

Official reference: [GitHub Docs: adding locally hosted code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).
