import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export class GoogleSheetsAuth {
  private auth: JWT | null = null;

  constructor(
    private serviceAccountEmail: string,
    private serviceAccountPrivateKey: string
  ) {}

  async getAuthClient(): Promise<JWT> {
    if (!this.auth) {
      this.auth = new google.auth.JWT({
        email: this.serviceAccountEmail,
        key: this.serviceAccountPrivateKey.replace(/\\n/g, '\n'),
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.readonly'
        ]
      });

      await this.auth.authorize();
    }

    return this.auth;
  }

  async getSheetsClient() {
    const auth = await this.getAuthClient();
    return google.sheets({ version: 'v4', auth });
  }
}