import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
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
 * Create bedrock runtime.
 *
 * @param {string} region - AWS region name
 * @param {string} profile - AWS CLI profile name
 * @returns {import('@aws-sdk/client-bedrock-runtime').BedrockRuntimeClient} - AWS Bedrock Runtime Client
 */
export function getBedrockClient(region, profile){
    const bedrockClient = new BedrockRuntimeClient({
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
    console.error('Error:', error);
    if (error.name === 'ValidationException') {
        return response.status(400).send({ error: true, message: 'Amazon Bedrock request error' });
    } else if (error.name === 'CredentialsProviderError') {
        return response.status(400).send({ error: true, message: 'No AWS credential found.' });
    }
    return response.status(500).send({ error: true, message: 'Uncaught Exception' });
}
