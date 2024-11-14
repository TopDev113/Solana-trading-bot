import TelegramBot from "node-telegram-bot-api";
import {
  contractInfoScreenHandler,
  refreshHandler,
} from "../screens/contract.info.screen";
import { GasFeeEnum } from "../services/user.trade.setting.service";
import {
  buyCustomAmountScreenHandler,
  buyHandler,
  sellCustomAmountScreenHandler,
  sellHandler,
  setSlippageScreenHandler,
} from "../screens/trade.screen";
import {
  cancelWithdrawHandler,
  transferFundScreenHandler,
  withdrawButtonHandler,
  withdrawCustomAmountScreenHandler,
  withdrawHandler,
} from "../screens/transfer.funds";
import {
  WelcomeScreenHandler,
  welcomeGuideHandler,
} from "../screens/welcome.screen";
import {
  autoBuyAmountScreenHandler,
  changeGasFeeHandler,
  changeJitoTipFeeHandler,
  generateNewWalletHandler,
  pnlCardHandler,
  presetBuyAmountScreenHandler,
  presetBuyBtnHandler,
  revealWalletPrivatekyHandler,
  setCustomAutoBuyAmountHandler,
  setCustomFeeScreenHandler,
  setCustomJitoFeeScreenHandler,
  settingScreenHandler,
  switchAutoBuyOptsHandler,
  setParameterHandler,
  switchWalletHandler,
  walletViewHandler,
  connectMyWalletHandler,
  connectCopyingWalletHandler,
} from "../screens/settings.screen";
import { positionScreenHandler } from "../screens/position.screen";
import { OpenReferralWindowHandler } from "../screens/referral.link.handler";
import {
  openAlertBotDashboard,
  sendMsgForAlertScheduleHandler,
  updateSchedule,
} from "../screens/bot.dashboard";
import {
  backToReferralHomeScreenHandler,
  refreshPayoutHandler,
  sendPayoutAddressManageScreen,
  setSOLPayoutAddressHandler,
} from "../screens/payout.screen";
import { messageHandler } from "./message.handler";

export const callbackQueryHandler = async (
  bot: TelegramBot,
  callbackQuery: TelegramBot.CallbackQuery
) => {
  try {
    const { data: callbackData, message: callbackMessage } = callbackQuery;
    if (!callbackData || !callbackMessage) return;
    const data = JSON.parse(callbackData);
    const opts = {
      chat_id: callbackMessage.chat.id,
      message_id: callbackMessage.message_id,
    };

    if (data.command.includes("set_parameter")) {
      await setParameterHandler(bot, callbackMessage);
    }
    if (data.command.includes("my_wallet")) {
      messageHandler;
      await connectMyWalletHandler(bot, callbackMessage);
    }
    if (data.command.includes("copy_wallet")) {
      await connectCopyingWalletHandler(bot, callbackMessage);
    }
    if (data.command.includes("back_home")) {
      const replaceId = callbackMessage.message_id;
      await welcomeGuideHandler(bot, callbackMessage, replaceId);
    }

    if (data.command.includes("autobuy_switch")) {
      await switchAutoBuyOptsHandler(bot, callbackMessage);
      return;
    }

    if (data.command.includes("autobuy_amount")) {
      const replaceId = callbackMessage.message_id;
      await autoBuyAmountScreenHandler(bot, callbackMessage, replaceId);
      return;
    }

    if (data.command.includes("settings")) {
      console.log("Settings");
      const replaceId = callbackMessage.message_id;
      await settingScreenHandler(bot, callbackMessage, replaceId);
    }

    if (data.command.includes("dismiss_message")) {
      bot.deleteMessage(opts.chat_id, opts.message_id);
      return;
    }

    if (data.command === "custom_gas") {
      await setCustomFeeScreenHandler(bot, callbackMessage);
      return;
    }

    if (data.command === "custom_jitofee") {
      await setCustomJitoFeeScreenHandler(bot, callbackMessage);
      return;
    }

    if (data.command.includes("set_slippage")) {
      await setSlippageScreenHandler(bot, callbackMessage);
      return;
    }

    if (data.command.includes("wallet_view")) {
      await walletViewHandler(bot, callbackMessage);
      return;
    }

    // Update SOL address
    if (data.command === "set_sol_address") {
      await setSOLPayoutAddressHandler(bot, callbackMessage.chat);
    } else if (data.command === "refresh_payout") {
      await refreshPayoutHandler(bot, callbackMessage);
    }
  } catch (e) {
    console.log(e);
  }
};
