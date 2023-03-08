import axios, { AxiosResponse } from 'axios';

export const notifyDiscord = async (channel: string, message: string): Promise<AxiosResponse<any, any>> => {
  const result = await axios.post(channel, {
    content: message,
  });
  return result;
};
