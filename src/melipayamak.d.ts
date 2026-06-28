declare module "melipayamak" {
  interface MelipayamakSms {
    send(to: string, from: string, text: string, isFlash?: boolean): Promise<unknown>;
    sendByBaseNumber(text: string, to: string, bodyId: number | string): Promise<unknown>;
    getCredit(): Promise<unknown>;
  }
  export default class MelipayamakApi {
    constructor(username: string, password: string);
    sms(method?: string, type?: string): MelipayamakSms;
  }
}
