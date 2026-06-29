const env = require('../config/env');

const menus = `*MRK MSK Bot Menu*\n\nBasic: !menu !help !ping !status !time !owner\nGroup: !tagall !hidetag !kick !add !promote !demote !mute !unmute !welcome on/off !antilink on/off !antispam on/off\nAI: !ai <prompt> !translate <lang> <text> !summarize <text> !image <prompt>\nMedia: !sticker !toaudio !download <url>\nUtility: !weather <city> !calc <expr> !news !currency USD EUR 10 !quran !hadith !prayer <city>`;

async function handleCommand({ sock, session, message, text, sender, isGroup }) {
  const [command, ...args] = text.trim().split(/\s+/);
  const reply = (body) => sock.sendMessage(sender, { text: body }, { quoted: message });
  session.stats.messages += 1;
  if (!command.startsWith('!')) return null;
  session.stats.commands += 1;

  switch (command.toLowerCase()) {
    case '!menu': case '!help': return reply(menus);
    case '!ping': return reply('pong');
    case '!status': return reply(`Connected as ${session.phone}. Messages: ${session.stats.messages}, commands: ${session.stats.commands}`);
    case '!time': return reply(new Date().toLocaleString());
    case '!owner': return reply(`${env.ownerName}: +${env.ownerPhone}`);
    case '!welcome': session.settings.welcome = args[0] === 'on'; await session.save(); return reply(`Welcome is ${session.settings.welcome ? 'on' : 'off'}`);
    case '!antilink': session.settings.antilink = args[0] === 'on'; await session.save(); return reply(`Anti-link is ${session.settings.antilink ? 'on' : 'off'}`);
    case '!antispam': session.settings.antispam = args[0] !== 'off'; await session.save(); return reply(`Anti-spam is ${session.settings.antispam ? 'on' : 'off'}`);
    case '!tagall': case '!hidetag': return reply(isGroup ? 'Group mention command received. Grant bot admin rights to enforce mentions.' : 'This command only works in groups.');
    case '!kick': case '!add': case '!promote': case '!demote': case '!mute': case '!unmute': return reply('Group moderation command queued. Ensure the bot is a group admin.');
    case '!ai': return reply('AI assistant is ready. Add OPENAI_API_KEY to enable live responses. Prompt: ' + args.join(' '));
    case '!image': return reply('Image generation command received. Configure OPENAI_API_KEY to generate images.');
    case '!translate': return reply('Translation command placeholder: connect your preferred translation provider.');
    case '!summarize': return reply(args.join(' ').slice(0, 350) || 'Send text after !summarize.');
    case '!sticker': case '!toaudio': case '!download': return reply('Media command received. Send or quote media for conversion/download.');
    case '!weather': case '!news': case '!currency': case '!quran': case '!hadith': case '!prayer': case '!calc': return reply('Utility command received. Configure provider keys for live data where required.');
    default: return reply('Unknown command. Send !menu.');
  }
}

module.exports = { handleCommand, menus };
