import { mockProcessFeatureDefinitions } from "../../testing/mocks/mockFeatureSchemas";
import { mockProcessRawFieldDefinitions } from "../../testing/mocks/mockRawSchemas";

export async function fetchProcessFeatureDefinitions() {
  return mockProcessFeatureDefinitions;
}

export async function fetchProcessRawFieldDefinitions() {
  return mockProcessRawFieldDefinitions;
}
