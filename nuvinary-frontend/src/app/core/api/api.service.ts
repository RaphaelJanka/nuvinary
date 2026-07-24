import { Injectable } from '@angular/core';
import { del, get, patch, post, put } from 'aws-amplify/api';
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

  async executeGetOperation(path: string) {
    return get({
      apiName: this.API_NAME,
      path,
      options: {
        headers: await this.getAuthHeaders(),
      },
    });
  }

  async executePutOperation(path: string, body: ApiBody) {
    return put({
      apiName: this.API_NAME,
      path,
      options: {
        headers: await this.getAuthHeaders(),
        body,
      },
    });
  }

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

  /** Sends a partial update to the given path. */
  async executePatchOperation(path: string, body: ApiBody) {
    return patch({
      apiName: this.API_NAME,
      path,
      options: {
        headers: await this.getAuthHeaders(),
        body,
      },
    });
  }

  /** Sends a delete request to the given path. */
  async executeDeleteOperation(path: string) {
    return del({
      apiName: this.API_NAME,
      path,
      options: {
        headers: await this.getAuthHeaders(),
      },
    });
  }
}
