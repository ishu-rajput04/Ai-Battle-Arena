import { config } from "dotenv";
config();
const app_config = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "",
    COHERE_API_KEY: process.env.COHERE_API_KEY || "",
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
};
export default app_config;
//# sourceMappingURL=config.js.map