const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const PROVIDER_CONFIG = {

  openai: {
    basePoint:`${BASE_URL}/v1`,
    endpoint: `${BASE_URL}/v1/chat/completions`, 
    model: "gpt-4o",

    nodeInstall:"npm install openai",
    pythonInstall:"pip install openai",
    javaInstall:"Maven: com.openai:openai-java",

    nodeImport: `const OpenAI = require("openai");`,
    nodeClient: `new OpenAI`,
    nodeCall: `client.responses.create({
          model: "gpt-4o",
          input: "Hello!"
        })`,

    pythonImport: `from openai import OpenAI`,
    pythonClient: `OpenAI`,
    pythonCall: `client.responses.create(
        model="gpt-4o",
        input="Hello!"
    )`,

    javaImport: `
          import com.openai.client.OpenAIClient;
          import com.openai.client.okhttp.OpenAIOkHttpClient;
          import com.openai.models.responses.Response;
          import com.openai.models.responses.ResponseCreateParams;
          `,

    javaClient: `
            OpenAIClient client = OpenAIOkHttpClient.builder()
            .apiKey(token)
            .baseUrl(BASE_URL)
            .addDefaultHeader("x-ai-guard-provider","openai")
            .build();
        `,

    javaCall: `
            ResponseCreateParams params =
            ResponseCreateParams.builder()
            .input("Say this is a test")
            .model("gpt-4o")
            .build();

            Response response =
            client.responses().create(params);

            System.out.println(response.outputText());
            `,

    curlBody: `{
    "model": "gpt-4o",
    "input": "Hello!"
    }`
  },

  anthropic: {
    basePoint:`${BASE_URL}/v1`,
    endpoint: `${BASE_URL}/v1/messages`,
    model: "claude-opus-4-6",

    nodeInstall:"npm install @anthropic-ai/sdk",
    pythonInstall:"pip install anthropic",
    javaInstall:"Maven: com.anthropic:anthropic-java",

    nodeImport: `import Anthropic from "@anthropic-ai/sdk";`,
    nodeClient: `new Anthropic`,
    nodeCall: `client.messages.create({
      max_tokens: 1024,
      messages: [{ content: "Hello, world", role: "user" }],
      model: "claude-opus-4-6"
    })`,

    pythonImport: `from anthropic import Anthropic`,
    pythonClient: `Anthropic`,
    pythonCall: `client.messages.create(
        max_tokens=1024,
        messages=[{
            "content": "Hello, world",
            "role": "user"
        }],
        model="claude-opus-4-6"
    )`,

    javaImport: `
        import com.anthropic.client.AnthropicClient;
        import com.anthropic.client.okhttp.AnthropicOkHttpClient;
        import com.anthropic.models.messages.Message;
        import com.anthropic.models.messages.MessageCreateParams;
        import com.anthropic.models.messages.Model;
    `,

    javaClient: `
        AnthropicClient client =
        AnthropicOkHttpClient.builder()
        .apiKey(token)
        .baseUrl(BASE_URL)
        .addDefaultHeader("x-ai-guard-provider","anthropic")
        .build();
        `,

    javaCall: `
          MessageCreateParams params =
          MessageCreateParams.builder()
          .maxTokens(1024L)
          .addUserMessage("Hello, world")
          .model(Model.CLAUDE_OPUS_4_6)
          .build();

          Message message =
          client.messages().create(params);

          System.out.println(message.id());
    `,

    curlBody: `{
      "model": "claude-opus-4-6",
      "max_tokens": 1024,
      "messages": [
        { "role": "user", "content": "Hello, world" }
      ]
    }`
  },

  gemini: {
    basePoint:`${BASE_URL}/v1beta`,
    endpoint: `${BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent`,
    model: "gemini-2.0-flash",

    nodeInstall:"npm install @google/genai",
    pythonInstall:"pip install google-genai",
    javaInstall:"Maven: com.google.genai:google-genai",

    nodeImport: `import { GoogleGenAI } from "@google/genai";`,
    nodeClient: `new GoogleGenAI`,
    nodeCall: `client.models.generateContent({ 
              model: "gemini-2.0-flash",
              contents: "Write a story about a magic backpack."
            })`,

    pythonImport: `from google import genai`,
    pythonClient: `genai.Client`,
    pythonCall: `client.models.generate_content(
            model="gemini-2.0-flash",
            contents="Write a story about a magic backpack."
        )`,

    javaImport: `
        import com.google.genai.Client;
        import com.google.genai.types.GenerateContentResponse;
    `,

    javaClient: `
          Client client =
          Client.builder()
          .apiKey(token)
          .baseUrl(BASE_URL)
          .addDefaultHeader("x-ai-guard-provider","gemini")
          .build();
          `,

    javaCall: `
            GenerateContentResponse response =
            client.models.generateContent(
            "gemini-2.0-flash",
            "Write a story about a magic backpack.",
            null
            );

    System.out.println(response.text());
`,

    curlBody: `{
        "contents": [{
          "parts":[{"text": "Write a story about a magic backpack."}]
        }]
      }`
  }
};
