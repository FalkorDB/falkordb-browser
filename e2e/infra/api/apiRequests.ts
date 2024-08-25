import { APIRequestContext, request } from "@playwright/test"


const getRequest = async (url: string, body: any, availableRequest?: APIRequestContext, headers?: Record<string, string>) => {
  const requestOptions = {
    data: body,
    headers: headers || undefined,
  };

  const requestContext = availableRequest || (await request.newContext());
  return await requestContext.get(url, requestOptions);
};
  
const deleteRequest = async (url: string, headers?: Record<string, string>) => {
  const requestOptions = {
    headers: headers || undefined,
  };

  const requestContext = await request.newContext();
  return await requestContext.delete(url, requestOptions);
};



export{ getRequest, deleteRequest }