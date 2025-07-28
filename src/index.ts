import { Tela } from "./Tela.node";
import { TelaApi } from "./credentials";

export const nodes = [new Tela()];

export const credentials = [new TelaApi()];

// Export classes with proper naming for n8n
export const TelaNode = Tela;
export const TelaApiCredential = TelaApi;

export default {
  nodes,
  credentials,
};
