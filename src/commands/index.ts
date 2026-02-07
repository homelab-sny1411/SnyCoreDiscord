import { Collection } from 'discord.js';
import { Command } from '../types/command';
import { startCommand } from './start';
import { stopCommand } from './stop';
import { restartCommand } from './restart';
import { statusCommand } from './status';
import { autoShutdownStatusCommand } from './auto-shutdown-status';
import { autoshutdownCommand } from './autoshutdown';
import { rconCommand } from './rcon';

export const commands = new Collection<string, Command>();

commands.set(startCommand.data.name, startCommand);
commands.set(stopCommand.data.name, stopCommand);
commands.set(restartCommand.data.name, restartCommand);
commands.set(statusCommand.data.name, statusCommand);
commands.set(autoShutdownStatusCommand.data.name, autoShutdownStatusCommand);
commands.set(autoshutdownCommand.data.name, autoshutdownCommand);
commands.set(rconCommand.data.name, rconCommand);
