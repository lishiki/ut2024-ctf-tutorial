# UT2024 CTF Tutorial

このリポジトリは、講義で行われるCTFのTutorialのためのものです。

## 初期設定

Localで動作をさせる場合、以下の設定が必要です。

### Flagの生成
ランダムなFlagを生成するために、env.shを実行して.envを生成してください。

```sh
bash env.sh
```

### /etc/hosts の編集

/etc/hostsに以下の2行を追加してください。

```
127.0.0.1 ut2024-challenge.sszk.net
127.0.0.1 ut2024.sszk.net
```

## 起動

```sh
docker compose up -d
```

起動後、http://ut2024.sszk.net にアクセスしてください

## 課題

課題はXSS、SQL Injectionでそれぞれ3問ずつ、合計6問あります。
ソースコードはそれぞれ

- XSS: [/xss/app.js](/xss/app.js)
- SQL Injection: [/sqli/app.js](/sqli/app.js)

にあります。