import { OAuth2Client } from "google-auth-library";

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  name: string;
}

export class GoogleTokenVerifier {
  private client: OAuth2Client;
  private clientId: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new Error("GOOGLE_CLIENT_ID is not defined");
    }

    this.clientId = clientId;
    this.client = new OAuth2Client(clientId);
  }

  async verify(idToken: string): Promise<GoogleUserPayload> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google token");
    }

    return {
      googleId: payload.sub!,
      name: payload.name!,
      email: payload.email!,
    };
  }
}
