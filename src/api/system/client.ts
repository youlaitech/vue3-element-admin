import {
  ClientFormData,
  ClientPageResult,
  ClientQueryParam,
} from '@/types/api/system/client';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

export function listClientPages(
  queryParams: ClientQueryParam
): AxiosPromise<ClientPageResult> {
  return request({
    url: '/youlai-admin/api/v1/oauth-clients',
    method: 'get',
    params: queryParams,
  });
}

export function getClientFormDetial(id: number): AxiosPromise<ClientFormData> {
  return request({
    url: '/youlai-admin/api/v1/oauth-clients/' + id,
    method: 'get',
  });
}

export function addClient(data: ClientFormData) {
  return request({
    url: '/youlai-admin/api/v1/oauth-clients',
    method: 'post',
    data: data,
  });
}

export function updateClient(id: string, data: ClientFormData) {
  return request({
    url: '/youlai-admin/api/v1/oauth-clients/' + id,
    method: 'put',
    data: data,
  });
}

export function deleteClients(ids: string) {
  return request({
    url: '/youlai-admin/api/v1/oauth-clients/' + ids,
    method: 'delete',
  });
}

export function updateClientPart(id: number, data: object) {
  return request({
    url: '/youlai-admin/api/v1/oauth-clients/' + id,
    method: 'patch',
    data: data,
  });
}
