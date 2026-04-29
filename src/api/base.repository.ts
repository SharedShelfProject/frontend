import { apiClient } from '@/api/api-client';
import { HttpMethod } from '@/enums/http-method.enum';
import { RepositoryRequestOptions } from '@/interfaces/repository-request-options.interface';

export class BaseRepository {
  protected request<ResponseInterface>(
    requestPath: string,
    httpMethod: HttpMethod,
    requestBody?: unknown,
    requestOptions: RepositoryRequestOptions = {},
  ): Promise<ResponseInterface> {
    return apiClient<ResponseInterface>(requestPath, {
      method: httpMethod,
      body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
      useAuthorization: requestOptions.useAuthorization,
    });
  }

  protected post<ResponseInterface>(
    requestPath: string,
    requestBody?: unknown,
    requestOptions: RepositoryRequestOptions = {},
  ): Promise<ResponseInterface> {
    return this.request<ResponseInterface>(requestPath, HttpMethod.Post, requestBody, requestOptions);
  }
}
