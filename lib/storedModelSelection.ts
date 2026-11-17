/**
 * Picks the model to select after the model list loads: the stored preference when the list
 * still offers it, otherwise the first model. OpenAI IDs were stored unprefixed before the list
 * started prefixing them as `openai::<id>`, so a legacy ID matches (and migrates to) its prefixed
 * entry instead of being replaced.
 */
export function selectStoredModel(storedModel: string, models: string[]): string {
    if (models.includes(storedModel)) return storedModel;
    const prefixed = `openai::${storedModel}`;
    if (storedModel && !storedModel.includes("::") && models.includes(prefixed)) return prefixed;
    return models[0];
}
