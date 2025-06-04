const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

const token = process.env.BOT_TOKEN;  // Telegram Bot Token from BotFather
const bot = new TelegramBot(token, { polling: true });

app.get('/', (req, res) => res.send('🎬 Movie Stream Bot is online!'));
app.listen(process.env.PORT || 3000, () => console.log('Server started'));

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const videoOrDoc = msg.video || msg.document;

  if (!videoOrDoc) {
    return bot.sendMessage(chatId, '📩 Please send me a video or document file (up to 4GB).');
  }

  if (videoOrDoc.file_size > 4 * 1024 * 1024 * 1024) {
    return bot.sendMessage(chatId, '❌ File too large! Max size is 4GB.');
  }

  try {
    const file = await bot.getFile(videoOrDoc.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    const name = videoOrDoc.file_name || 'movie_file';
    const sizeMB = (videoOrDoc.file_size / (1024 * 1024)).toFixed(2);

    bot.sendMessage(chatId, `🎥 *${name}*\n📦 Size: ${sizeMB} MB\n\n▶️ Stream link:\n${fileUrl}`, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, '⚠️ Error generating stream link, try again.');
  }
});
