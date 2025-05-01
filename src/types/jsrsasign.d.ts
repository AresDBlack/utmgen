declare module 'jsrsasign' {
  export interface KJUR {
    jws: {
      JWS: {
        sign(alg: string, sHeader: string, sPayload: string, key: string): string;
      };
    };
  }

  export const KJUR: KJUR;
  export function hextob64(hex: string): string;
} 