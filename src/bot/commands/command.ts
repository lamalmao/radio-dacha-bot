import { Message } from 'discord.js';

export default interface Command {
  execute: (interaction: Message, data: CommandData) => Promise<unknown>;
}

export type CommandData = {
  command: string;
  content?: string;
};
