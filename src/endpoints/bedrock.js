import express from 'express';
import { BedrockRuntimeClient, ConverseStreamCommand } from '@aws-sdk/client-bedrock-runtime';

export const router = express.Router();

// Debug logging function
const debug = (...args) => console.debug('[Bedrock]', ...args);

// Default inference configuration
const DEFAULT_CONFIG = {
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
};

// Initialize the Bedrock client with default provider
const client = new BedrockRuntimeClient({
    region: 'us-west-2', // Oregon region
});

/**
 * @typedef {'user' | 'assistant'} ConversationRole
 */

// Create message content for different model types
const createMessageContent = (prompt, modelId) => ({
    role: /** @type {ConversationRole} */ ('user'),
    content: [{
        text: prompt,
    }],
});

// Error handlers
const ERROR_HANDLERS = {
    ValidationException: (error) => ({
        status: 400,
        message: 'Invalid request parameters',
    }),
    ResourceNotFoundException: (error) => ({
        status: 404,
        message: 'Specified model not found',
    }),
    ThrottlingException: (error) => ({
        status: 429,
        message: 'Rate limit exceeded',
    }),
    UnrecognizedClientException: (error) => ({
        status: 401,
        message: 'Authentication failed',
    }),
    ServiceQuotaExceededException: (error) => ({
        status: 429,
        message: 'Service quota has been exceeded',
    }),
    ModelTimeoutException: (error) => ({
        status: 504,
        message: 'Model processing timeout',
    }),
    default: (error) => ({
        status: 500,
        message: 'Internal server error',
    }),
};

function handleBedrockError(error, res) {
    console.error('Bedrock API error:', error);
    const errorHandler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.default;
    const { status, message } = errorHandler(error);
    res.status(status).json({ error: message });
}

router.post('/generate', async (req, res) => {
    const { prompt, model } = req.body;

    try {
        debug('Generating response for model:', model.bedrockModelId);

        const input = {
            modelId: model.bedrockModelId,
            messages: [createMessageContent(prompt, model.bedrockModelId)],
            inferenceConfig: DEFAULT_CONFIG,
        };

        const command = new ConverseStreamCommand(input);
        const response = await client.send(command);

        // Handle streaming response
        if (response && response.stream) {
            try {
                for await (const item of response.stream) {
                    if (item.contentBlockDelta?.delta?.text) {
                        res.write(JSON.stringify({ text: item.contentBlockDelta.delta.text }));
                    }
                }
            } catch (streamError) {
                console.error('Error processing stream:', streamError);
                res.write(JSON.stringify({ error: 'Error processing response stream' }));
            }
        }

        res.end();
    } catch (error) {
        handleBedrockError(error, res);
    }
});

export default router;
