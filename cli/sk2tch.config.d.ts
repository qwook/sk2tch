export interface Sk2tchConfig {
  name: string;
  entry: string;

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
