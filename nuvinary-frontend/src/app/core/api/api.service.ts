import { Injectable } from '@angular/core';
import { post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

export type ApiBody = Record<string, string | number | boolean>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_NAME = 'NuvinaryApi';

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error('No access token found');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // executeGetOperation() {}

  // executePutOperation() {}

  async executePostOperation(path: string, body: ApiBody) {
    return post({
      apiName: this.API_NAME,
      path,
      options: {
        headers: await this.getAuthHeaders(),
        body,
      },
    });
  }
}
