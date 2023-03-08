import axios, { AxiosResponse } from 'axios';

export const notifyDiscord = async (discordWebHook: string, message: string): Promise<AxiosResponse<any, any>> => {
  const result = await axios.post(discordWebHook, {
    content: message,
  });
  return result;
};
