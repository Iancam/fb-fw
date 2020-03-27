# Facebook Follow-up

## Getting Started

assuming you are in the root directory and use vscode:

`mkdir creds && code creds/credentials.json`

add

```json
{
  "email": "<your email>",
  "password": "<your password>"
}
```

After the first time running the app, you should be able to delete this file.

run the app with `yarn dev`

for reference

```json
  "scripts": {
    "dev": "electron-webpack dev",
    "compile": "electron-webpack",
    "dist": "yarn compile && electron-builder",
    "dist:dir": "yarn dist --dir -c.compression=store -c.mac.identity=null"
  },
```
