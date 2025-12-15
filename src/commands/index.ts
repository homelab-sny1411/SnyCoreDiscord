import { Collection } from 'discord.js';
import { Command } from '../types/command';
import { startCommand } from './start';

export const commands = new Collection<string, Command>();

commands.set(startCommand.data.name, startCommand);
