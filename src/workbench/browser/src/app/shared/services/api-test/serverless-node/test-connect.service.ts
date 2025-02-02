import { Injectable, Inject, LOCALE_ID } from '@angular/core';

import { TestServer } from '../test-server.model';
import { eoFormatRequestData, eoFormatResponseData } from '../api-test.utils';
@Injectable()
export class TestServerServerlessService implements TestServer {
  receiveMessage: (message) => void;
  xhrByTabID = {};
  constructor(@Inject(LOCALE_ID) private locale: string) {}
  init(receiveMessage: (message) => void) {
    this.receiveMessage = receiveMessage;
  }
  send(module, message) {
    switch (message.action) {
      case 'ajax': {
        this.xhrByTabID[message.id] = this.ajax(message);
        break;
      }
      default: {
        this.xhrByTabID[message.id].abort();
      }
    }
    if (message.action !== 'ajax') return;
  }
  ajax(message) {
    const xhr = new XMLHttpRequest();
    const url = '/api/unit';
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          this.receiveMessage(this.formatResponseData(JSON.parse(xhr.responseText).data));
        } else {
          this.receiveMessage({
            id: message.id,
            general: { redirectTimes: 0, downloadSize: 0, downloadRate: 0, time: '0.00ms' },
            response: {
              statusCode: 0,
              headers: [],
              testDeny: '0.00',
              responseLength: 0,
              responseType: 'text',
              reportList: [],
              body: '测试服务连接失败，请提交 Issue 联系社区',
            },
            report: {
              request: {
                requestHeaders: [{ name: 'Content-Type', value: 'application/json' }],
                requestBodyType: 'raw',
                requestBody: '{}',
              },
            },
            history: {
              request: {
                uri: 'http:///',
                method: 'POST',
                protocol: 'http',
                requestHeaders: [{ name: 'Content-Type', value: 'application/json' }],
                requestBodyJsonType: 'object',
                requestBodyType: 'raw',
                requestBody: '{}',
              },
            },
          });
        }
      }
    };
    xhr.send(JSON.stringify(message));
    return xhr;
  }
  close() {}
  /**
   * Format UI Request Data To Server Request Data
   *
   * @param input
   */
  formatRequestData(data, opts = { env: {} }) {
    return eoFormatRequestData(data, opts, this.locale);
  }
  /**
   * Format TestResult to TestData
   * @param  {object} report test result after test finish
   * @param  {object} history storage test history
   */
  formatResponseData(data) {
    return eoFormatResponseData(data);
  }
}
