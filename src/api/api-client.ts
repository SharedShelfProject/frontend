import { API_BASE_PATH } from '@/constants/api.constants';
import { LOGIN_ROUTE_PATH } from '@/constants/routes.constants';
import { ApiErrorResponse } from '@/interfaces/api-error-response.interface';
import { ApiRequestOptions } from '@/interfaces/api-request-options.interface';
import { authSessionService } from '@/services/auth-session.service';

async function readResponseData<ResponseInterface>(response: Response): Promise<ResponseInterface> {
  const responseText = await response.text();

  if (!responseText) {
    return {} as ResponseInterface;
  }

  return JSON.parse(responseText) as ResponseInterface;
}

function buildHeaders(requestOptions: ApiRequestOptions): Headers {
  const requestHeaders = new Headers(requestOptions.headers);

  if (!(requestOptions.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (requestOptions.useAuthorization !== false) {
    const accessToken = authSessionService.getAccessToken();

    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  return requestHeaders;
}

function createErrorMessage(errorResponse: ApiErrorResponse): string {
  if (Array.isArray(errorResponse.message)) {
    return errorResponse.message.join(', ');
  }

  return errorResponse.message ?? errorResponse.error ?? 'Request failed';
}

export async function apiClient<ResponseInterface>(
  requestPath: string,
  requestOptions: ApiRequestOptions = {},
): Promise<ResponseInterface> {
  const response = await fetch(`${API_BASE_PATH}${requestPath}`, {
    ...requestOptions,
    headers: buildHeaders(requestOptions),
  });

  const responseData = await readResponseData<ResponseInterface | ApiErrorResponse>(response);

  if (response.status === 401) {
    authSessionService.logout();

    if (requestOptions.useAuthorization !== false) {
      window.location.assign(LOGIN_ROUTE_PATH);
    }
  }

  if (!response.ok) {
    throw new Error(createErrorMessage(responseData as ApiErrorResponse));
  }

  return responseData as ResponseInterface;
}
