import { BedrockRuntimeClient, ConverseCommand, ConverseStreamCommand } from '@aws-sdk/client-bedrock-runtime'
import { BedrockClient } from '@aws-sdk/client-bedrock';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

/**
 * Converts an array of message objects to a format with nested content structure.
 *
 * @param {Array<{role: string, content: string}>} messages - The original array of message objects
 * @returns {Array<import('@aws-sdk/client-bedrock-runtime').Message>} - The converted array with nested content
 */
export function convertToBedrockMessages(messages) {
    return messages.map(item => {
        const bedrockRole = item.role === 'assistant' ? 'assistant' : 'user';
        return {
            role: bedrockRole,
            content: [
                {
                    text: item.content,
                },
            ],
        };
    });
}
/**
 * Create Bedrock runtime client.
 *
 * @param {string} region - AWS region name
 * @param {string} profile - AWS CLI profile name
 * @returns {import('@aws-sdk/client-bedrock-runtime').BedrockRuntimeClient} - AWS Bedrock Runtime Client
 */
export function getBedrockRuntimeClient(region, profile){
    const bedrockRuntimeClient = new BedrockRuntimeClient({
        region: region,
        credentials: defaultProvider({ profile: profile }),
    });
    return bedrockRuntimeClient;
}

/**
 * Create Bedrock client.
 *
 * @param {string} region - AWS region name
 * @param {string} profile - AWS CLI profile name
 * @returns {import('@aws-sdk/client-bedrock').BedrockClient} - AWS Bedrock Runtime Client
 */
export function getBedrockClient(region, profile){
    const bedrockClient = new BedrockClient({
        region: region,
        credentials: defaultProvider({ profile: profile }),
    });
    return bedrockClient;
}

/**
 * Bedrock Error Handler.
 *
 * @param {Error} error - The original array of message objects
 * @param {import('express').Response} response The Express response object
 */
export function bedrockErrorHandler(error, response){
    console.error('AWS Bedrock: Amazon Bedrock API Access Error.')
    console.error(error);

    // Check if the response has already been sent
    if (response.headersSent) {
        return;
    }

    if (error.name === 'ValidationException') {
        return response.status(400).send({ error: true, statusText: 'Amazon Bedrock request error' });
    } else if (error.name === 'CredentialsProviderError') {
        return response.status(400).send({ error: true, statusText: 'No AWS credential found.' });
    }
    return response.status(500).send({ error: true, statusText: 'Uncaught Exception' });
}

/**
 * Cross region inference model id converter.
 *
 * @param {string} region - The original array of message objects
 * @param {string} model The Express response object
 */

export function getCrossRegionModelId(region, model){
    const regionModelMap = {
        us: 'us',
        eu: 'eu',
        ap: 'apac',
    };
    const regionPrefix = region.split('-')[0];
    return regionModelMap[regionPrefix] + '.' + model;
}

/**
 * Get Amazon Bedrock Claude 3.7 API Additional RequestFields.
 *  https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-37.html
 * As Anthropics suggests, we set budget_token as 4000.
 * @param {import('express').Request} request - The original array of message objects
 * @return {{
 *  thinking: {
 *     type: 'disabled' | 'enabled',
 *     budget_tokens?: number
 * }}}
 */
function getClaudeAdditionalRequestFields(request){

    const include_reasoning = request.body.include_reasoning
    if ( include_reasoning ) {
        return {
            thinking: {
                type: 'enabled',
                budget_tokens: 4000
            }
        }
    } else {
        return {
            thinking: {
                type: "disabled"
            }
        }
    }

}

/**
 * Get Amazon Bedrock Cohere Command anc Command R+ Additional RequestFields.
 * https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-cohere-command-r-plus.html
 * @return {{
 *  k?: number,
 *  frequency_penalty?: number,
 *  presence_penalty?: number
 * }}
 */
function getCohereAdditionalRequestFields(request){

    const top_k = request.body.top_k
    const frequency_penalty = request.body.frequency_penalty
    const presence_penalty = request.body.presence_penalty
    return {
        ...(top_k != null && { k: top_k }),
        ...(frequency_penalty != null && { frequency_penalty: frequency_penalty }),
        ...(presence_penalty != null && { presence_penalty: presence_penalty })
    }
}

/**
 * Get Amazon Bedrock Converse API Additional RequestFields.
 *  (get model specific parameters)
 * @param {import('express').Request} request - The original array of message objects
 * @return {Object | null} can be anything
 */
function getAdditionalRequestFields(request){
    const modelId = request.body.bedrock_model;
    // Claude 3.7
    if (modelId.includes('anthropic.claude-3-7-sonnet-20250219-v1:0')) {
        console.debug('AWS Bedrock: Claude 3.7 selected.')
        return getClaudeAdditionalRequestFields(request)

    // Cohere Command R+
    } else if (modelId.includes('cohere.command-r-plus-v1:0')) {
        console.debug('AWS Bedrock: Cohere Command R+ selected.')
        return getCohereAdditionalRequestFields(request)

    // Cohere Command R
    } else if (modelId.includes('cohere.command-r-v1:0')) {
        console.debug('AWS Bedrock: Cohere Command R selected.')
        return getCohereAdditionalRequestFields(request)
    } else {
        return null
    }
}

/**
 * Get Amazon Bedrock converse or coverse stream command.
 *
 * @param {import('express').Request} request - The original array of message objects
 * @return {{modelId: string}} command object
 */

function getCommand(request) {

    let modelId = request.body.bedrock_model;
    const region = request.body.bedrock_region
    const messages = convertToBedrockMessages(request.body.messages);
    const crossRegionInference = request.body.cross_region_inference;
    const additionalRequestFields = getAdditionalRequestFields(request)

    // Turn into model.xyz -> us.model.xyz... if cross region specified
    if ( crossRegionInference ) {
        console.debug('AWS Bedrock: Cross region inference requested.')
        modelId = getCrossRegionModelId(region, modelId)
    }

    const command = {
        modelId: modelId,
        messages: messages,
        inferenceConfig: {
            maxTokens: request.body.max_tokens,
            topP: request.body.top_p,
            temperature: request.body.temperature,
        },
        ...(additionalRequestFields != null && { additionalRequestFields }),
    }


    console.debug('AWS Bedrock: Converse and ConverStream Command dump')
    console.debug(command)

    return command
}


/**
 * Get Amazon Bedrock converse command object.
 *
 * @param {import('express').Request} request - The original array of message objects
 * @return {import('@aws-sdk/client-bedrock-runtime').ConverseCommand} Converse command
 */
export function getConverseCommand(request) {
    const command = getCommand(request)
    return new ConverseCommand(command)
}

/**
 * Get Amazon Bedrock converse command object.
 *
 * @param {import('express').Request} request - The original array of message objects
 * @return {import('@aws-sdk/client-bedrock-runtime').ConverseStreamCommand } ConverseStream command
 */
export function getConverseStreamCommand(request) {
    const command = getCommand(request)
    return new ConverseStreamCommand(command)
}