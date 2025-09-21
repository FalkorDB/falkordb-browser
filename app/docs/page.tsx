"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "swagger-ui-react/swagger-ui.css";

// Dynamically import SwaggerUI to avoid SSR issues and suppress React warnings
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64">Loading API Documentation...</div>
});

// Component wrapper to handle React warnings
function SwaggerWrapper({ baseUrl }: { baseUrl: string }) {
  useEffect(() => {
    // Suppress specific React warnings from swagger-ui-react
    // eslint-disable-next-line no-console
    const originalError = console.error;
    
    // eslint-disable-next-line no-console
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (message.includes('UNSAFE_componentWillReceiveProps') || 
         message.includes('OperationContainer') ||
         message.includes('componentWillReceiveProps'))
      ) {
        return; // Suppress these specific warnings
      }
      originalError(...args);
    };

    return () => {
      // Restore original console.error on cleanup
      // eslint-disable-next-line no-console
      console.error = originalError;
    };
  }, []);

  return (
    <SwaggerUI 
      url={`${baseUrl}/api/swagger?t=${Date.now()}`}
      docExpansion="none"
      defaultModelsExpandDepth={1}
      defaultModelExpandDepth={1}
      tryItOutEnabled
      displayRequestDuration
      persistAuthorization
      deepLinking={false}
      showExtensions
      showCommonExtensions
      filter
      displayOperationId={false}
      showMutatedRequest={false}
      layout="BaseLayout"
      supportedSubmitMethods={['get', 'put', 'post', 'delete', 'options', 'head', 'patch']}
      plugins={[
        {
          components: {
            InfoContainer: () => null
          }
        }
      ]}
      requestInterceptor={(request) => {
        // Add JWT-only header for all requests from docs page
        request.headers['X-JWT-Only'] = 'true';
        return request;
      }}
    />
  );
}

export default function DocsPage() {
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    // Get the base URL from the current window location
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Don't render until we have the base URL
  if (!baseUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-lg">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">FalkorDB Browser API</h1>
          <p className="text-lg text-gray-600 mb-4">
            Interactive API documentation for the FalkorDB Browser REST API
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Most endpoints require authentication. Use the login endpoint to obtain a JWT token,
              then click the &ldquo;Authorize&rdquo; button below to authenticate your requests.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 h-0 overflow-y-auto px-6 py-4">
        <SwaggerWrapper baseUrl={baseUrl} />
      </div>
    </div>
  );
}
