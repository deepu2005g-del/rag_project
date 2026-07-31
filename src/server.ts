import app from './app';
import { config } from './config/env';

const startServer = async () => {
  try {
    // Validate that Pinecone and other services are ready if needed
    
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment:`);
      console.log(`- Pinecone Index: ${config.pineconeIndex}`);
      console.log(`- Groq Model: ${config.groqModel}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
