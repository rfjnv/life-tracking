# Life Game OS as Telegram Mini App

This project can run as a Telegram Mini App opened from a bot button.

## 1. Create bot

Open `@BotFather` in Telegram:

```text
/newbot
```

Copy the bot token.

## 2. Host the app

Telegram Mini Apps need a public HTTPS URL.

Deploy this folder to any Node hosting provider and set:

```text
BOT_TOKEN=your_bot_token
WEBAPP_URL=https://your-domain.com
PORT=3000
```

Start:

```text
npm start
```

## 3. Set bot webhook

Open this URL after deploy:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook
```

## 4. Optional BotFather menu button

In `@BotFather`:

```text
/mybots
Bot Settings
Menu Button
Configure menu button
```

Set URL:

```text
https://your-domain.com
```

Now users can open Life Game OS directly inside Telegram.
