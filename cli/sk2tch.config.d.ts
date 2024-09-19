export interface Sk2tchConfig {
  name: string;
  entry: string;
  output: string;

  // Used if this sketch has it's own hosted server.
  server?: string;
  pages?: {
    [page: string]: string;
  };

  analytics?: {
    googleTag: string;
  };

  releasing?: {
    osx?: {
      appleApiKey: string;
      appleApiKeyId: string;
      appleApiIssuer: string;
    };
    steam?: {
      username: string;
      appId: number;
      depots: {
        osx?: number;
        win?: number;
      };
    };
  };
}
