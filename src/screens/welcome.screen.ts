import TelegramBot from "node-telegram-bot-api";
import { UserService } from "../services/user.service";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { GrowTradeVersion } from "../config";
import { copytoclipboard } from "../utils";
import { TokenService } from "../services/token.metadata";
import { contractInfoScreenHandler } from "./contract.info.screen";

const MAX_RETRIES = 5;
export const welcomeKeyboardList = (auto_buy: boolean) => {
  return {
    inline_keyboard: [
      [
        {
          text: "⛓ Status",
          callback_data: JSON.stringify({ command: "status" }),
        },
        {
          text: "🛠 Settings & Tools",
          callback_data: JSON.stringify({ command: "settings" }),
        },
      ],
      [
        {
          text: `${!auto_buy ? "Autobuy ☑️" : "Autobuy ✅"}`,
          callback_data: JSON.stringify({ command: "autobuy_switch" }),
        },
      ],
      [
        {
          text: "❌ Close",
          callback_data: JSON.stringify({ command: "dismiss_message" }),
        },
      ],
    ],
  };
};

export const WelcomeScreenHandler = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  try {
    const { username, id: chat_id, first_name, last_name } = msg.chat;
    console.log("username*************", username);
    // check if bot
    if (!username) {
      bot.sendMessage(
        chat_id,
        "⚠️ You have no telegram username. Please take at least one and try it again."
      );
      return;
    }
    const user = await UserService.findOne({ username });
    // if new user, create one
    if (!user) {
      const res = await newUserHandler(bot, msg);
      if (!res) return;
    }
    // send welcome guide
    await welcomeGuideHandler(bot, msg);
    // await bot.deleteMessage(chat_id, msg.message_id);
  } catch (error) {
    console.log("-WelcomeScreenHandler-", error);
  }
};

const newUserHandler = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const { username, id: chat_id, first_name, last_name } = msg.chat;

  let retries = 0;
  let userdata: any = null;
  let private_key = "";
  let wallet_address = "";

  // find unique private_key
  do {
    const keypair = Keypair.generate();
    private_key = bs58.encode(keypair.secretKey);
    wallet_address = keypair.publicKey.toString();

    const wallet = await UserService.findOne({ wallet_address });
    if (!wallet) {
      // add
      const newUser = {
        chat_id,
        username,
        first_name,
        last_name,
        wallet_address,
        private_key,
      };
      userdata = await UserService.create(newUser); // true; //
    } else {
      retries++;
    }
  } while (retries < MAX_RETRIES && !userdata);

  // impossible to create
  if (!userdata) {
    await bot.sendMessage(
      chat_id,
      "Sorry, we cannot create your account. Please contact support team"
    );
    return false;
  }

  // send private key & wallet address
  const caption =
    `👋 Welcome to GrowTradeBot!\n\n` +
    `A new wallet has been generated for you. This is your wallet address\n\n` +
    `${wallet_address}\n\n` +
    `<b>Save this private key below</b>❗\n\n` +
    `<tg-spoiler>${private_key}</tg-spoiler>\n\n` +
    `<b>To get started, please read our <a href="https://docs.growsol.io">docs</a></b>`;

  await bot.sendMessage(chat_id, caption, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "* Dismiss message",
            callback_data: JSON.stringify({
              command: "dismiss_message",
            }),
          },
        ],
      ],
    },
  });
  return true;
};

export const welcomeGuideHandler = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  replaceId?: number
) => {
  const { id: chat_id, username } = msg.chat;
  const user = await UserService.findOne({ username });

  if (!user) return;
  const solbalance = await TokenService.getSOLBalance(user.wallet_address);
  const caption =
    `<b>Welcome to CryptoTrade | Beta Version</b>\n\n` +
    `The Unique Solana Trading Bot. Track and trade with CryptoTrade.\n\n` +
    `<b>💳 My Wallet:</b>\n${copytoclipboard(user.wallet_address)}\n\n` +
    `<b>💳 Balance:</b> ${solbalance} SOL\n\n`;

  const { auto_buy } = user;

  if (replaceId) {
    bot.editMessageText(caption, {
      message_id: replaceId,
      chat_id,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: welcomeKeyboardList(auto_buy),
    });
  } else {
    await bot.sendMessage(chat_id, caption, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: welcomeKeyboardList(auto_buy),
    });
  }
};
